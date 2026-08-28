// ============================================================
// Campus OS — useInterview Hook
// Orchestrates: Store + AI Service + Voice + API persistence
// Handles Internshala-style auto-submit on silence
// ============================================================
import { useCallback, useEffect, useRef } from 'react';
import { useInterviewStore } from '@/stores/useInterviewStore';
import { generateQuestion, evaluateAnswer, generateFinalReport } from '@/services/interviewService';
import {
  speak, stopSpeaking, startListening, stopListening,
  isSTTSupported, startAudioAnalyzer, stopAudioAnalyzer
} from '@/services/voiceService';
import { PERSONAS } from '@/components/apps/InterviewPrep/AvatarDisplay';

export function useInterview() {
  const store = useInterviewStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // ---- Timer ----
  useEffect(() => {
    if (store.status !== 'idle' && store.status !== 'setup' && store.status !== 'completed' && store.startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - store.startTime!) / 1000);
        store.setDuration(elapsed);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [store.status, store.startTime]);

  // ---- Auto-save to MongoDB every 30 seconds ----
  useEffect(() => {
    if (store.status !== 'idle' && store.status !== 'setup' && store.status !== 'completed') {
      autoSaveRef.current = setInterval(async () => {
        try {
          await fetch('/api/interview/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: store.sessionId,
              interviewType: store.interviewType,
              company: store.company,
              interviewerPersona: store.interviewerPersona,
              interviewMode: store.interviewMode,
              questionHistory: store.questionHistory,
              dimensions: store.dimensions,
              fillerWords: store.fillerWords,
              difficulty: store.difficulty,
              duration: store.duration,
              runningScore: store.runningScore,
              status: store.status,
            }),
          });
        } catch (err) {
          console.warn('Auto-save failed:', err);
        }
      }, 30000);
    }
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [store.status, store.sessionId]);

  // ---- Fetch resume on interview start ----
  const fetchResume = useCallback(async () => {
    try {
      const res = await fetch('/api/resume/latest');
      if (res.ok) {
        const data = await res.json();
        if (data.resume) store.setResumeData(data.resume);
      }
    } catch {
      console.warn('Could not fetch resume data');
    }
  }, []);

  // ---- Start voice listening after AI speaks ----
  const startSpeechListening = useCallback(async () => {
    if (!isSTTSupported()) return;
    store.setStatus('user-speaking');
    store.setAiStatus('Listening...');

    await startAudioAnalyzer();

    startListening({
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          useInterviewStore.setState((s) => ({
            currentAnswer: (s.currentAnswer ? s.currentAnswer + ' ' : '') + transcript,
          }));
        }
      },
      onSilence: () => {
        // User stopped for 8s — auto-submit
        submitAnswer();
      },
      onEnd: () => {
        stopAudioAnalyzer();
      },
      onError: (error) => {
        console.warn('Voice error:', error);
        stopAudioAnalyzer();
      },
      onSpeechStart: () => {
        // User has started speaking — show mic active
        store.setAiStatus('');
      },
      onFillerWord: (word) => {
        store.incrementFiller(word as any);
      },
    });
  }, []);

  // ---- Generate the next question ----
  const askNextQuestion = useCallback(async () => {
    store.setIsGenerating(true);
    store.setStatus('ai-speaking');
    store.setAiStatus('Generating question...');

    try {
      const question = await generateQuestion(
        store.interviewType!,
        store.resumeData,
        store.questionHistory,
        store.difficulty,
        store.company,
        store.interviewerPersona,
        store.jdText,
        store.resumeText,
        (msg) => store.setAiStatus(msg)
      );

      store.setCurrentQuestion(question);
      store.setAiStatus('');
      store.setIsGenerating(false);

      // Speech mode: TTS reads question then start listening
      if (store.interviewMode === 'speech' && store.ttsEnabled) {
        const persona = PERSONAS[store.interviewerPersona];
        speak(
          question,
          { rate: persona.voiceRate, pitch: persona.voicePitch },
          () => {
            // After AI finishes speaking, start listening
            startSpeechListening();
          }
        );
      } else {
        // Writing mode: just show question, wait for text input
        store.setStatus('user-speaking');
      }
    } catch (err) {
      console.error('Failed to generate question:', err);
      store.setAiStatus('');
      store.setIsGenerating(false);
      store.setStatus('user-speaking');
    }
  }, [
    store.interviewType, store.resumeData, store.questionHistory,
    store.difficulty, store.company, store.interviewerPersona,
    store.jdText, store.resumeText, store.interviewMode, store.ttsEnabled
  ]);

  // ---- Submit the current answer ----
  const submitAnswer = useCallback(async () => {
    const answer = useInterviewStore.getState().currentAnswer.trim();
    if (!answer || !useInterviewStore.getState().currentQuestion) return;

    stopSpeaking();
    stopListening();
    stopAudioAnalyzer();

    store.setStatus('evaluating');
    store.setIsEvaluating(true);
    store.setAiStatus('AI is evaluating your answer...');

    const question = useInterviewStore.getState().currentQuestion;
    const currentHistory = useInterviewStore.getState().questionHistory;

    try {
      const evaluation = await evaluateAnswer(
        question,
        answer,
        useInterviewStore.getState().interviewType!,
        useInterviewStore.getState().resumeData,
        useInterviewStore.getState().interviewerPersona,
        useInterviewStore.getState().jdText,
        useInterviewStore.getState().resumeText,
        (msg) => store.setAiStatus(msg)
      );

      const pair = {
        question,
        answer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        dimension: evaluation.dimension,
        timestamp: Date.now(),
      };

      store.addQAPair(pair);
      store.updateDimensions(evaluation.dimensions);

      // Adaptive difficulty
      if (evaluation.score > 80) store.setDifficulty(useInterviewStore.getState().difficulty + 1);
      else if (evaluation.score < 40) store.setDifficulty(useInterviewStore.getState().difficulty - 1);

      store.setIsEvaluating(false);
      store.setAiStatus('');

      // Check if interview should end
      if (currentHistory.length + 1 >= useInterviewStore.getState().totalQuestions) {
        await finishInterview();
      } else {
        await askNextQuestion();
      }
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
      store.setIsEvaluating(false);
      store.setAiStatus('');

      store.addQAPair({
        question,
        answer,
        score: 50,
        feedback: 'AI evaluation unavailable.',
        dimension: 'communication',
        timestamp: Date.now(),
      });

      await askNextQuestion();
    }
  }, [askNextQuestion]);

  // ---- Finish interview and generate report ----
  const finishInterview = useCallback(async () => {
    stopSpeaking();
    stopListening();
    stopAudioAnalyzer();
    store.setAiStatus('Generating your interview report...');
    store.setIsGenerating(true);

    const state = useInterviewStore.getState();

    try {
      const report = await generateFinalReport(
        state.questionHistory,
        state.interviewType!,
        state.dimensions,
        state.company,
        state.interviewerPersona,
        state.jdText,
        state.resumeText,
        (msg) => store.setAiStatus(msg)
      );

      store.setFinalReport(report);

      try {
        await fetch('/api/interview/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: state.sessionId,
            interviewType: state.interviewType,
            company: state.company,
            interviewerPersona: state.interviewerPersona,
            interviewMode: state.interviewMode,
            questionHistory: state.questionHistory,
            dimensions: report.dimensions,
            fillerWords: state.fillerWords,
            difficulty: state.difficulty,
            duration: state.duration,
            runningScore: report.overallScore,
            finalReport: report,
            status: 'completed',
          }),
        });
      } catch { /* not critical */ }
    } catch {
      const avgScore = Math.round(
        state.questionHistory.reduce((s, q) => s + q.score, 0) / Math.max(state.questionHistory.length, 1)
      );
      store.setFinalReport({
        overallScore: avgScore,
        dimensions: state.dimensions,
        strengths: ['Completed the interview'],
        weaknesses: ['Report generation failed'],
        improvements: [{ title: 'Try again', description: 'Redo the interview for a full report' }],
        sentiment: 'neutral',
      });
    }

    store.setIsGenerating(false);
    store.setAiStatus('');
    store.endInterview();
  }, []);

  // ---- Manual voice controls (for writing-mode or toggle) ----
  const startVoiceInput = useCallback(() => {
    startSpeechListening();
  }, [startSpeechListening]);

  const stopVoiceInput = useCallback(() => {
    stopListening();
    stopAudioAnalyzer();
  }, []);

  return {
    ...store,
    fetchResume,
    askNextQuestion,
    submitAnswer,
    finishInterview,
    startVoiceInput,
    stopVoiceInput,
  };
}
