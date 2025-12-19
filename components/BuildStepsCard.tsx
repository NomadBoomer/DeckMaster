import React, { useState } from 'react';
import { BuildStep } from '../types';
import { generateStepImage } from '../services/geminiService';

interface BuildStepsCardProps {
  steps: BuildStep[];
  deckContext: string;
}

const BuildStepsCard: React.FC<BuildStepsCardProps> = ({ steps, deckContext }) => {
  const [images, setImages] = useState<Record<number, string>>({});
  const [loadingStep, setLoadingStep] = useState<number | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(1);

  const handleGenerateImage = async (e: React.MouseEvent, step: BuildStep) => {
    e.stopPropagation();
    setLoadingStep(step.stepNumber);
    try {
        const base64 = await generateStepImage(step.description, "Deck", deckContext, "Custom Size");
        if (base64) {
            setImages(prev => ({ ...prev, [step.stepNumber]: base64 }));
        }
    } catch (e) {
        console.error("Error generating image", e);
    } finally {
        setLoadingStep(null);
    }
  };

  const toggleStep = (stepNum: number) => {
      setOpenStep(openStep === stepNum ? null : stepNum);
  };

  return (
    <div id="execution-plan-card" className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full">
      <div className="bg-slate-800 p-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
           Output 3: Execution Plan
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {steps.length > 0 ? (
          steps.map((step) => {
            const isOpen = openStep === step.stepNumber;
            return (
                <div key={step.stepNumber} className="bg-white break-inside-avoid">
                    <button 
                        onClick={() => toggleStep(step.stepNumber)}
                        className={`w-full text-left p-4 flex items-center justify-between transition-colors no-print ${isOpen ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold shrink-0 ${isOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-500'}`}>
                                {step.stepNumber}
                            </div>
                            <div>
                                <h4 className={`font-bold ${isOpen ? 'text-blue-900' : 'text-gray-700'}`}>{step.title}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap hidden sm:inline-block">
                                {step.timeEstimate}
                             </span>
                             <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </button>
                    
                    <div className={`p-4 pl-16 pr-6 bg-blue-50/30 ${isOpen ? 'block' : 'hidden md:block print:block'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step {step.stepNumber}</span>
                            <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {step.timeEstimate}
                            </span>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{step.description}</p>
                        
                        {images[step.stepNumber] ? (
                            <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 shadow-inner max-w-lg bg-white">
                                <img src={images[step.stepNumber]} alt={step.title} className="w-full h-auto object-cover" />
                            </div>
                        ) : (
                            <button 
                                onClick={(e) => handleGenerateImage(e, step)}
                                disabled={loadingStep === step.stepNumber}
                                className="text-sm bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-50 font-medium disabled:opacity-50 flex items-center gap-2 no-print"
                            >
                                {loadingStep === step.stepNumber ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Visualizing Technical Detail...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Generate Technical Visualization
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500 italic">No execution steps generated.</div>
        )}
      </div>
    </div>
  );
};

export default BuildStepsCard;
