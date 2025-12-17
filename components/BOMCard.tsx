import React from 'react';
import { BomItem } from '../types';

interface BOMCardProps {
  items: BomItem[];
}

const BOMCard: React.FC<BOMCardProps> = ({ items }) => {
  // Consolidate common notes
  const commonNotes = [
    "Approx. 10% wastage included in quantities.",
    "Ensure all cut ends of pressure treated lumber are sealed with end-grain preservative.",
    "Fasteners should be hot-dipped galvanized or stainless steel."
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="bg-slate-800 p-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
           Output 1: Bill of Materials
        </h3>
      </div>
      <div className="p-0 overflow-x-auto flex-grow">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                <tr>
                    <th className="p-4 border-b">Category</th>
                    <th className="p-4 border-b">Item</th>
                    <th className="p-4 border-b text-center">Qty</th>
                    <th className="p-4 border-b">Specific Notes</th>
                </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
                {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50 border-b border-gray-100 last:border-0">
                        <td className="p-3 pl-4 font-semibold text-gray-500">{item.category}</td>
                        <td className="p-3 font-medium text-gray-900">{item.item}</td>
                        <td className="p-3 text-center font-bold text-blue-600 bg-blue-50/30">{item.quantity}</td>
                        <td className="p-3 text-gray-500 italic text-xs max-w-xs">{item.notes}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      <div className="bg-amber-50 p-3 border-t border-amber-100 text-xs text-amber-800 flex flex-col sm:flex-row sm:gap-6 gap-2">
         <span className="font-bold uppercase tracking-wider shrink-0">General Notes:</span>
         <div className="flex flex-wrap gap-x-4 gap-y-1">
             {commonNotes.map((note, i) => (
                 <span key={i} className="flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                     {note}
                 </span>
             ))}
         </div>
      </div>
    </div>
  );
};

export default BOMCard;
