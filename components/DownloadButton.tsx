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
    
    // Safety white bars to ensure content doesn't "peek" under header/footer lines
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfWidth, 15, 'F');
    pdf.rect(0, pdfHeight - 15, pdfWidth, 15, 'F');

    // Header
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`DeckMaster AI Planner: ${specs.projectName}`, 15, 10);
    pdf.text(`${new Date().toLocaleString()}`, pdfWidth - 15, 10, { align: 'right' });
    
    // Footer
    pdf.text(`Page ${pageNum} of ${totalPages}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    
    // Decorative lines
    pdf.setDrawColor(230, 230, 230);
    pdf.line(15, 12, pdfWidth - 15, 12);
    pdf.line(15, pdfHeight - 15, pdfWidth - 15, pdfHeight - 15);
  };

  const captureAndAddSection = async (pdf: jsPDF, elementId: string, title: string, margin: number) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // 1. Prepare element for capture
    const originalStyle = element.getAttribute('style');
    element.style.height = 'auto';
    element.style.overflow = 'visible';

    // Force show all contents
    const allButton = Array.from(element.querySelectorAll('.no-print button')).find(b => b.textContent?.includes('All')) as HTMLButtonElement;
    if (allButton) allButton.click();

    const hiddenPrintItems = element.querySelectorAll('.print\\:block, .hidden');
    hiddenPrintItems.forEach(el => {
        el.classList.remove('hidden');
        el.classList.add('block');
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200
    });

    // Cleanup element
    if (originalStyle) element.setAttribute('style', originalStyle);
    hiddenPrintItems.forEach(el => {
        if (!el.classList.contains('print:block')) {
            el.classList.add('hidden');
            el.classList.remove('block');
        }
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pdfWidth - (margin * 2);
    const topReserved = 25; 
    const bottomReserved = 20; 
    const usableHeight = pdfHeight - topReserved - bottomReserved;

    const imgWidth = usableWidth;
    const totalImgHeightMm = (canvas.height * imgWidth) / canvas.width;
    const pxPerMm = canvas.width / imgWidth;

    let heightLeftMm = totalImgHeightMm;
    let sY = 0;
    let sectionPageCount = 0;

    while (heightLeftMm > 0) {
      pdf.addPage();
      sectionPageCount++;

      // Section Title only on first page of section
      if (sectionPageCount === 1) {
          pdf.setFontSize(16);
          pdf.setTextColor(30, 41, 59);
          pdf.text(title, margin, 22);
      }

      const currentSliceHeightMm = Math.min(heightLeftMm, usableHeight);
      const currentSliceHeightPx = currentSliceHeightMm * pxPerMm;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = currentSliceHeightPx;
      const ctx = tempCanvas.getContext('2d');
      
      if (ctx) {
          ctx.drawImage(
              canvas,
              0, sY, canvas.width, currentSliceHeightPx, 
              0, 0, canvas.width, currentSliceHeightPx  
          );
          
          const sliceData = tempCanvas.toDataURL('image/jpeg', 0.9);
          const yPos = sectionPageCount === 1 ? topReserved + 2 : 18; 

          pdf.addImage(
              sliceData,
              'JPEG',
              margin,
              yPos,
              imgWidth,
              currentSliceHeightMm
          );
      }

      sY += currentSliceHeightPx;
      heightLeftMm -= currentSliceHeightMm;
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // COVER PAGE
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

      // Subsequent Sections
      await captureAndAddSection(pdf, 'bom-card', 'Output 1: Bill of Materials', margin);
      await captureAndAddSection(pdf, 'tools-card', 'Output 2: Tool Requirements', margin);
      await captureAndAddSection(pdf, 'execution-plan-card', 'Output 3: Execution Plan', margin);
      await captureAndAddSection(pdf, 'cost-estimator-card', 'Output 4: Cost Estimation', margin);
      
      // Footer/Disclaimers Section
      await captureAndAddSection(pdf, 'project-footer', 'Methodology & Disclaimers', margin);

      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let j = 2; j <= totalPages; j++) {
        pdf.setPage(j);
        addPageLayout(pdf, j, totalPages);
      }

      pdf.save(`DeckMaster_Plan_${specs.projectName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Export error:", error);
      alert("Error generating PDF. Please ensure all content is loaded.");
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