// Document image enhancement and OCR preprocessing simulation

export interface ImageEnhanceResult {
  dataUrl: string;
  readabilityScore: number;
  extractedDrugs: string[];
  findings: string[];
}

export function enhanceDocumentImage(imageSrc: string): Promise<ImageEnhanceResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({
          dataUrl: imageSrc,
          readabilityScore: 78,
          extractedDrugs: ['Metformin 500mg BD', 'Telmisartan 40mg OD'],
          findings: ['Handwritten prescription clearly legible', 'Doctor registration number verified'],
        });
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Enhance contrast and apply slight unsharp mask / adaptive binarization
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // High contrast curve for crisp document text
        const contrastFactor = 1.35;
        let enhanced = contrastFactor * (gray - 128) + 128;
        enhanced = Math.max(0, Math.min(255, enhanced));

        data[i] = enhanced;
        data[i + 1] = enhanced;
        data[i + 2] = enhanced;
      }

      ctx.putImageData(imgData, 0, 0);

      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.9),
        readabilityScore: 94,
        extractedDrugs: [
          'Tab Metformin 500mg - 1 Tab BD (Post meals)',
          'Tab Telmisartan 40mg - 1 Tab OD (Morning)',
          'Tab Atorvastatin 20mg - 1 Tab HS (Night)',
          'Tab Pantoprazole 40mg - 1 Tab OD (Empty stomach)',
        ],
        findings: [
          'Prescription dated: 12-Mar-2026',
          'Diagnoses: T2D, Grade 1 HTN',
          'Next Review: 4 Weeks',
          'Prescribing Doctor: Dr. S. K. Mukherjee, MD (Med), Reg: 44921',
        ],
      });
    };

    img.onerror = () => {
      resolve({
        dataUrl: imageSrc,
        readabilityScore: 82,
        extractedDrugs: ['Metformin 500mg BD', 'Telmisartan 40mg OD'],
        findings: ['Standard prescription detected'],
      });
    };

    img.src = imageSrc;
  });
}
