import React from 'react';
import { CostEstimate } from '../types';
import MapSourcesCard from './MapSourcesCard';

interface CostEstimatorCardProps {
  estimate: CostEstimate | null;
  loading: boolean;
  zipCode: string;
}

const CostEstimatorCard: React.FC<CostEstimatorCardProps> = ({ estimate, loading, zipCode }) => {
  const formatValue = (val: string) => {
    return val.replace(/\.\d{2}/, '').replace(/(\$\d+)\.00/, '$1');
  };

  return (
    <div id="cost-estimator-card" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
        <div className="bg-emerald-700 p-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Output 4: Real-Time Pricing Breakdown
          </h3>
        </div>
        <div className="p-6 flex-grow flex flex-col">
          {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                  <p className="text-sm text-gray-500 text-center">
                      Scraping current item prices near {zipCode}...<br/>
                      Connecting to Home Depot & Lowe's local inventory...
                  </p>
              </div>
          ) : estimate ? (
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-emerald-50 p-4 rounded-lg text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Materials</p>
                          <p className="text-xl font-bold text-emerald-800">{formatValue(estimate.materialTotal)}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Pro Labor</p>
                          <p className="text-xl font-bold text-blue-800">{formatValue(estimate.laborTotal)}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Permits</p>
                          <p className="text-xl font-bold text-purple-800">{formatValue(estimate.permitFees)}</p>
                      </div>
                       <div className="bg-amber-50 p-4 rounded-lg text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Reserve</p>
                          <p className="text-xl font-bold text-amber-800">{formatValue(estimate.contingency)}</p>
                      </div>
                  </div>

                  <div className="overflow-x-auto border rounded-lg border-gray-200">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                              <tr>
                                  <th className="p-3 w-1/2">BOM Item priced individually</th>
                                  <th className="p-3 text-center">Qty</th>
                                  <th className="p-3 text-right">Unit</th>
                                  <th className="p-3 text-right">Total</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {estimate.breakdown.map((row, i) => (
                                  <tr key={i} className="hover:bg-gray-50">
                                      <td className="p-3 font-medium text-gray-800">{row.item}</td>
                                      <td className="p-3 text-center text-gray-600">{row.quantity}</td>
                                      <td className="p-3 text-right text-gray-600">{formatValue(row.unitPrice)}</td>
                                      <td className="p-3 text-right font-bold text-emerald-700">{formatValue(row.totalPrice)}</td>
                                  </tr>
                              ))}
                              <tr className="bg-gray-50 border-t-2 border-gray-200">
                                  <td colSpan={3} className="p-3 text-right font-bold text-gray-800">MATERIAL SUBTOTAL</td>
                                  <td className="p-3 text-right font-extrabold text-emerald-800">{formatValue(estimate.materialTotal)}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
          ) : null}
        </div>
      </div>

      <div className="lg:col-span-1 h-full">
         <MapSourcesCard zipCode={zipCode} sources={estimate?.sources || []} />
      </div>
    </div>
  );
};

export default CostEstimatorCard;