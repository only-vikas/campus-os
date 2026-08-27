// ============================================================
// Campus OS — useInterview Hook
// Orchestrates: Store + AI Service + Voice + API persistence
// ============================================================
import { useCallback, useEffect, useRef } from 'react';
import { useInterviewStore } from '@/stores/useInterviewStore';
import { generateQuestion, evaluateAnswer, generateFinalReport } from '@/services/interviewService';
import { speak, stopSpeaking, startListening, stopListening, isSTTSupported } from '@/services/voiceService';

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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
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
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [store.status, store.sessionId]);

  // ---- Fetch resume data on interview start ----
  const fetchResume = useCallback(async () => {
    try {
      const res = await fetch('/api/resume/latest');
      if (res.ok) {
        const data = await res.json();
        store.setResumeData(data.resume);
      }
    } catch {
      console.warn('Could not fetch resume data');
    }
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
        (msg) => store.setAiStatus(msg)
      );

      store.setCurrentQuestion(question);
      store.setAiStatus('');
      store.setIsGenerating(false);

      // TTS: read question aloud
      if (store.ttsEnabled) {
        speak(question, () => {
          store.setStatus('user-speaking');
        });
      } else {
        store.setStatus('user-speaking');
      }
    } catch (err) {
      console.error('Failed to generate question:', err);
      store.setAiStatus('Failed to generate question. Retrying...');
      store.setIsGenerating(false);
      store.setStatus('user-speaking');
    }
  }, [store.interviewType, store.resumeData, store.questionHistory, store.difficulty, store.company, store.ttsEnabled]);

  // ---- Submit the current answer ----
  const submitAnswer = useCallback(async () => {
    const answer = store.currentAnswer.trim();
    if (!answer || !store.currentQuestion) return;

    stopSpeaking();
    stopListening();
    store.setStatus('evaluating');
    store.setIsEvaluating(true);
    store.setAiStatus('Evaluating your answer...');

    try {
      const evaluation = await evaluateAnswer(
        store.currentQuestion,
        answer,
        store.interviewType!,
        store.resumeData,
        (msg) => store.setAiStatus(msg)
      );

      const pair = {
        question: store.currentQuestion,
        answer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        dimension: evaluation.dimension,
        timestamp: Date.now(),
      };

      store.addQAPair(pair);
      store.updateDimensions(evaluation.dimensions);

      // Adjust difficulty based on score
      if (evaluation.score > 80) {
        store.setDifficulty(store.difficulty + 1);
      } else if (evaluation.score < 40) {
        store.setDifficulty(store.difficulty - 1);
      }

      store.setIsEvaluating(false);
      store.setAiStatus('');

      // Check if interview should end (10 questions default)
      if (store.questionHistory.length + 1 >= store.totalQuestions) {
        await finishInterview();
      } else {
        // Next question
        await askNextQuestion();
      }
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
      store.setIsEvaluating(false);
      store.setAiStatus('Evaluation failed. Moving to next question...');
      
      // Still record the Q&A pair with a default score
      store.addQAPair({
        question: store.currentQuestion,
        answer,
        score: 50,
        feedback: 'AI evaluation unavailable.',
        dimension: 'communication',
        timestamp: Date.now(),
      });

      await askNextQuestion();
    }
  }, [store.currentAnswer, store.currentQuestion, store.interviewType, store.resumeData, store.difficulty, store.totalQuestions]);

  // ---- Finish interview and generate report ----
  const finishInterview = useCallback(async () => {
    stopSpeaking();
    stopListening();
    store.setAiStatus('Generating your interview report...');
    store.setIsGenerating(true);

    try {
      const report = await generateFinalReport(
        store.questionHistory,
        store.interviewType!,
        store.dimensions,
        store.company,
        (msg) => store.setAiStatus(msg)
      );

      store.setFinalReport(report);

      // Save final session to MongoDB
      try {
        await fetch('/api/interview/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: store.sessionId,
            interviewType: store.interviewType,
            company: store.company,
            questionHistory: store.questionHistory,
            dimensions: report.dimensions,
            fillerWords: store.fillerWords,
            difficulty: store.difficulty,
            duration: store.duration,
            runningScore: report.overallScore,
            finalReport: report,
            status: 'completed',
          }),
        });
      } catch { /* save failed, not critical */ }
    } catch {
      // Fallback report
      const avgScore = Math.round(
        store.questionHistory.reduce((s, q) => s + q.score, 0) / Math.max(store.questionHistory.length, 1)
      );
      store.setFinalReport({
        overallScore: avgScore,
        dimensions: store.dimensions,
        strengths: ['Completed the interview'],
        weaknesses: ['Report generation failed'],
        improvements: [{ title: 'Try again', description: 'Redo the interview for a full report' }],
        sentiment: 'neutral',
      });
    }

    store.setIsGenerating(false);
    store.setAiStatus('');
    store.endInterview();
  }, [store.questionHistory, store.interviewType, store.dimensions, store.company, store.fillerWords, store.difficulty, store.duration, store.sessionId]);

  // ---- Voice controls ----
  const startVoiceInput = useCallback(() => {
    if (!isSTTSupported()) return;

    startListening({
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          useInterviewStore.setState((s) => ({
            currentAnswer: s.currentAnswer + (s.currentAnswer ? ' ' : '') + transcript,
          }));
        }
      },
      onEnd: () => { /* user stopped speaking */ },
      onError: (error) => console.warn('Voice error:', error),
      onFillerWord: (word) => {
        store.incrementFiller(word as any);
      },
    });
  }, []);

  const stopVoiceInput = useCallback(() => {
    stopListening();
  }, []);

  return {
    // State
    ...store,
    // Actions
    fetchResume,
    askNextQuestion,
    submitAnswer,
    finishInterview,
    startVoiceInput,
    stopVoiceInput,
  };
}
