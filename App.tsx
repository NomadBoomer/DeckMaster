import React, { useState } from 'react';
import { DeckSpecs, PlanData, CostEstimate } from './types';
import InputForm from './components/InputForm';
import BOMCard from './components/BOMCard';
import ToolsCard from './components/ToolsCard';
import BuildStepsCard from './components/BuildStepsCard';
import CostEstimatorCard from './components/CostEstimatorCard';
import ChatAssistant from './components/ChatAssistant';
import { generateDeckPlan, estimateDeckCost } from './services/geminiService';

const App: React.FC = () => {
  const [specs, setSpecs] = useState<DeckSpecs | null>(null);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [costData, setCostData] = useState<CostEstimate | null>(null);
  
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingCost, setLoadingCost] = useState(false);

  const handleFormSubmit = async (data: DeckSpecs) => {
    setSpecs(data);
    setLoadingPlan(true);
    setLoadingCost(true);
    setPlanData(null);
    setCostData(null);

    try {
        // 1. Generate Plan (BOM, Tools, Steps)
        const plan = await generateDeckPlan(data);
        setPlanData(plan);
        setLoadingPlan(false);

        // 2. Estimate Costs (Parallel but dependent on BOM somewhat, we pass specs and simplified BOM string)
        const bomSummary = plan.bom.map(i => `${i.quantity} x ${i.item}`).join(', ');
        const cost = await estimateDeckCost(data, bomSummary);
        setCostData(cost);

    } catch (error) {
        console.error("Error generating plan", error);
        alert("There was an error generating your deck plan. Please check your connection and try again.");
    } finally {
        setLoadingPlan(false);
        setLoadingCost(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Hero Header */}
      <header className="bg-slate-900 text-white py-12 px-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">DeckMaster <span className="text-blue-400">AI</span> Planner</h1>
            <p className="text-xl text-gray-300 max-w-2xl">
                Design, specify, and cost your dream deck in minutes using advanced AI, local pricing data, and architectural best practices.
            </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 -mt-8 relative z-20 space-y-8">
        
        {/* Input Section */}
        <section>
             <InputForm onSubmit={handleFormSubmit} isLoading={loadingPlan} />
        </section>

        {/* Outputs Grid - Changed to Single Column Stack for Better Readability */}
        {(planData || loadingPlan) && (
            <section className="grid grid-cols-1 gap-8 animate-fade-in">
                
                {/* 1. BOM (Full Width) */}
                <div className="min-h-[300px]">
                    {loadingPlan ? (
                        <div className="bg-white h-64 rounded-xl shadow p-6 animate-pulse flex flex-col gap-4">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        </div>
                    ) : (
                         <BOMCard items={planData?.bom || []} />
                    )}
                </div>

                {/* 2. Tools (Full Width) */}
                <div>
                     {loadingPlan ? (
                        <div className="bg-white h-40 rounded-xl shadow p-6 animate-pulse flex flex-col gap-4">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="flex gap-2">
                                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ) : (
                        <ToolsCard categories={planData?.tools || []} />
                    )}
                </div>

                {/* 3. Steps (Full Width) */}
                <div>
                     {loadingPlan ? (
                        <div className="bg-white h-96 rounded-xl shadow p-6 animate-pulse">
                             <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
                             <div className="space-y-8">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-40 bg-gray-200 rounded w-full"></div>
                             </div>
                        </div>
                     ) : (
                         <BuildStepsCard 
                            steps={planData?.steps || []} 
                            deckContext={`${specs?.length}x${specs?.width} ${specs?.type} made of ${specs?.material}`}
                         />
                     )}
                </div>

                 {/* 4. Cost Estimator (Full Width) */}
                 <div>
                     <CostEstimatorCard 
                        estimate={costData} 
                        loading={loadingCost} 
                        zipCode={specs?.zipCode || ''} 
                    />
                </div>

            </section>
        )}
      </main>

      <ChatAssistant />
    </div>
  );
};

export default App;
