import React from 'react';
import { CostEstimate } from '../types';

interface CostEstimatorCardProps {
  estimate: CostEstimate | null;
  loading: boolean;
  zipCode: string;
}

const CostEstimatorCard: React.FC<CostEstimatorCardProps> = ({ estimate, loading, zipCode }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="bg-emerald-700 p-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           Output 4: Real-Time Cost Estimation
        </h3>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                <p className="text-sm text-gray-500 text-center">
                    Searching current material prices in {zipCode}...<br/>
                    Contacting local suppliers via Search...
                </p>
            </div>
        ) : estimate ? (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Materials</p>
                        <p className="text-2xl font-bold text-emerald-800">{estimate.materialTotal}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Est. Pro Labor</p>
                        <p className="text-2xl font-bold text-blue-800">{estimate.laborTotal}</p>
                    </div>
                     <div className="bg-amber-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Contingency</p>
                        <p className="text-2xl font-bold text-amber-800">{estimate.contingency}</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold text-gray-800">Local Pricing Breakdown</h4>
                         <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                             Permits Est: <span className="font-bold text-gray-900">{estimate.permitFees}</span>
                         </div>
                    </div>
                    
                    <div className="overflow-x-auto border rounded-lg border-gray-200">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                                <tr>
                                    <th className="p-3 w-1/2">Item / Category</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Unit Price</th>
                                    <th className="p-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {estimate.breakdown && estimate.breakdown.length > 0 ? (
                                    <>
                                        {estimate.breakdown.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="p-3 font-medium text-gray-800">{row.item}</td>
                                                <td className="p-3 text-center text-gray-600">{row.quantity}</td>
                                                <td className="p-3 text-right text-gray-600">{row.unitPrice}</td>
                                                <td className="p-3 text-right font-bold text-emerald-700">{row.totalPrice}</td>
                                            </tr>
                                        ))}
                                        {/* Total Row */}
                                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                                            <td colSpan={3} className="p-3 text-right font-bold text-gray-800 uppercase tracking-wide">
                                                Estimated Material Total
                                            </td>
                                            <td className="p-3 text-right font-extrabold text-emerald-800 text-lg">
                                                {estimate.materialTotal}
                                            </td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-3 text-center text-gray-400 italic">Detailed breakdown unavailable from local search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {estimate.sources.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-auto">
                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Live Data Sources (Search & Maps)</h5>
                        <div className="flex flex-wrap gap-2">
                            {estimate.sources.map((src, i) => (
                                <a key={i} href={src.uri} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    {src.title}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ) : (
             <p className="text-center text-gray-400 py-10">Submit specs to see local cost estimates.</p>
        )}
      </div>
    </div>
  );
};

export default CostEstimatorCard;
