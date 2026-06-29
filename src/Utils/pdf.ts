import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Captures the full receipt at high resolution (4x) by cloning it
 * into a temporary container without clipping.
 */
const captureFullElement = async (element: HTMLElement): Promise<string> => {
  // 1. Wait for fonts to load
  if (document.fonts) {
    await document.fonts.ready;
  }

  // 2. Clone the node with all its children (deep clone)
  const clone = element.cloneNode(true) as HTMLElement;

  // 3. Create a temporary container outside the normal flow
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = 'auto';
  container.style.height = 'auto';
  container.style.overflow = 'visible';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '20px';
  container.style.zIndex = '-1000';
  container.appendChild(clone);
  document.body.appendChild(container);

  // 4. Allow layout to settle
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 5. Get full dimensions of the clone
  const fullWidth = clone.scrollWidth;
  const fullHeight = clone.scrollHeight;

  // 6. Capture the clone at 4x resolution
  const dataUrl = await toPng(clone, {
    backgroundColor: '#ffffff',
    pixelRatio: 4,
    width: fullWidth,
    height: fullHeight,
    cacheBust: true,
  });

  // 7. Remove the temporary container
  document.body.removeChild(container);

  return dataUrl;
};

/**
 * Downloads the receipt as a high‑resolution PNG (full, uncropped).
 */
export const generateImage = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    const dataUrl = await captureFullElement(element);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error('Failed to generate image');
  }
};

/**
 * Downloads the receipt as a PDF (full, high quality).
 */
export const generatePDF = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    const dataUrl = await captureFullElement(element);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
    const pdfHeight = (img.height * pdfWidth) / img.width;
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};