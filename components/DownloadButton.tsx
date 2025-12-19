import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DeckSpecs } from '../types';

interface DownloadButtonProps {
  specs: DeckSpecs;
  dreamDeckUrl: string | null;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ specs, dreamDeckUrl }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const addPageLayout = (pdf: jsPDF, pageNum: number, totalPages: number) => {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Header
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`DeckMaster AI Planner: ${specs.projectName}`, 15, 10);
    pdf.text(`${new Date().toLocaleString()}`, pdfWidth - 15, 10, { align: 'right' });
    
    // Footer
    pdf.setFontSize(8);
    pdf.text(`Page ${pageNum} of ${totalPages}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    
    // Decorative lines
    pdf.setDrawColor(230, 230, 230);
    pdf.line(15, 12, pdfWidth - 15, 12);
    pdf.line(15, pdfHeight - 15, pdfWidth - 15, pdfHeight - 15);
  };

  const captureAndAddSection = async (pdf: jsPDF, elementId: string, title: string, margin: number) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Preparation for capture: Show all items/images for the PDF
    const originalFilter = (element.querySelector('select') as HTMLSelectElement)?.value;
    const filterButtons = element.querySelectorAll('.no-print button');
    
    // For BOMCard specifically: trigger "All" filter if it exists
    const allButton = Array.from(filterButtons).find(b => b.textContent === 'All') as HTMLButtonElement;
    if (allButton) allButton.click();

    // For BuildStepsCard: make all hidden steps visible for printing
    const hiddenSteps = element.querySelectorAll('.print\\:block, .hidden');
    hiddenSteps.forEach(el => {
        el.classList.remove('hidden');
        el.classList.add('block');
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    // Cleanup: restore original state if needed (though we're downloading now)
    hiddenSteps.forEach(el => {
        if (!el.classList.contains('print:block')) {
            el.classList.add('hidden');
            el.classList.remove('block');
        }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pdfWidth - (margin * 2);
    const usableHeight = pdfHeight - 40; // Subtract header/footer space

    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 30; // Start below title

    // Add first chunk of section
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setTextColor(30, 41, 59);
    pdf.text(title, margin, 25);
    
    // Slice image if it's too tall for one page
    let sY = 0; // Source Y in pixels (on canvas)
    const pxToMm = canvas.width / usableWidth; // Ratio to convert mm to canvas px

    while (heightLeft > 0) {
      const pageCanvasHeightMm = Math.min(heightLeft, usableHeight - (position === 30 ? 10 : 0));
      const pageCanvasHeightPx = pageCanvasHeightMm * pxToMm;

      // Draw the chunk
      pdf.addImage(
        imgData, 
        'PNG', 
        margin, 
        position, 
        imgWidth, 
        pageCanvasHeightMm, 
        undefined, 
        'FAST',
        0 // No rotation
      );

      heightLeft -= pageCanvasHeightMm;
      sY += pageCanvasHeightPx;

      if (heightLeft > 0) {
        pdf.addPage();
        position = 20; // Start higher on subsequent pages of the same section
      }
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // 1. COVER PAGE
      pdf.setFillColor(30, 41, 59);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.text("DeckMaster AI", 20, 40);
      pdf.setFontSize(18);
      pdf.setTextColor(96, 165, 250);
      pdf.text("Architectural Construction Plan", 20, 50);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text(specs.projectName, 20, 80);
      
      pdf.setFillColor(51, 65, 85);
      pdf.roundedRect(20, 90, 170, 60, 3, 3, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(200, 200, 200);
      pdf.text("Project Details:", 25, 100);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`Type: ${specs.type}`, 25, 110);
      pdf.text(`Material: ${specs.material}`, 25, 115);
      pdf.text(`Dimensions: ${specs.length}ft x ${specs.width}ft x ${specs.height}ft`, 25, 120);
      pdf.text(`Location: ${specs.zipCode}`, 25, 125);
      pdf.text(`Purpose: ${specs.function}`, 25, 130);
      pdf.text(`Climate: ${specs.environment}`, 25, 135);

      if (dreamDeckUrl) {
         try {
            const img = new Image();
            img.src = dreamDeckUrl;
            await new Promise((resolve) => { img.onload = resolve; });
            pdf.addImage(img, 'PNG', 20, 160, 170, 95.6);
         } catch(e) { console.warn("Image fail", e); }
      }

      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Generated via DeckMaster AI Construction Intelligence", 20, pdfHeight - 10);

      // 2. SUBSEQUENT PAGES (With slicing logic)
      await captureAndAddSection(pdf, 'bom-card', 'Output 1: Bill of Materials', margin);
      await captureAndAddSection(pdf, 'tools-card', 'Output 2: Tool Requirements', margin);
      await captureAndAddSection(pdf, 'execution-plan-card', 'Output 3: Execution Plan', margin);
      await captureAndAddSection(pdf, 'cost-estimator-card', 'Output 4: Cost Estimation', margin);

      // Finalize multi-page layouts (headers/footers)
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let j = 2; j <= totalPages; j++) {
        pdf.setPage(j);
        addPageLayout(pdf, j, totalPages);
      }

      pdf.save(`DeckMaster_Plan_${specs.projectName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Export error:", error);
      alert("Error generating PDF. Please ensure all visualizations are loaded.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 py-3 px-6 rounded-full font-bold text-white shadow-2xl transition-all transform hover:scale-105 active:scale-95 no-print ${
        isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-500/20'
      }`}
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Compiling Architectural PDF...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Architectural PDF
        </>
      )}
    </button>
  );
};

export default DownloadButton;