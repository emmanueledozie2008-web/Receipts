import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const captureOptions = {
  scale: 2,
  backgroundColor: '#ffffff',
  useCORS: true,
  allowTaint: false,
  logging: false,
  onclone: (clonedDoc: Document) => {
    // Replace all oklch() color functions with a safe hex fallback
    const fallback = '#ffffff';

    // In <style> tags
    clonedDoc.querySelectorAll('style').forEach((style) => {
      if (style.textContent) {
        style.textContent = style.textContent.replace(/oklch\([^)]*\)/g, fallback);
      }
    });

    // In inline styles
    clonedDoc.querySelectorAll('[style]').forEach((el) => {
      const style = el.getAttribute('style');
      if (style && style.includes('oklch')) {
        el.setAttribute('style', style.replace(/oklch\([^)]*\)/g, fallback));
      }
    });

    // Wait for images
    const images = clonedDoc.querySelectorAll('img');
    return Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  },
};

export const generatePDF = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    const canvas = await html2canvas(element, captureOptions);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('PDF generation failed');
  }
};

export const generateImage = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    const canvas = await html2canvas(element, captureOptions);
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error(`Image generation failed: ${error}`);
  }
};