import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

self.onmessage = async (e: MessageEvent) => {
  const { file, type } = e.data;

  try {
    let text = '';
    
    if (type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n';
      }
    } else if (
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'application/msword'
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
    } else if (type === 'text/plain') {
      text = await file.text();
    } else {
      throw new Error('Unsupported file type');
    }

    self.postMessage({ success: true, text });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};
