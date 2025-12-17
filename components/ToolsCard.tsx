import React from 'react';
import { ToolCategory } from '../types';

interface ToolsCardProps {
  categories: ToolCategory[];
}

const ToolsCard: React.FC<ToolsCardProps> = ({ categories }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full">
       <div className="bg-slate-800 p-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 00-1 1v6a1 1 0 01-1 1H9a1 1 0 01-1-1v-6a2 2 0 00-1-1H3a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
           Output 2: Tool Requirements
        </h3>
      </div>
      <div className="p-4 grid grid-cols-1 gap-4">
        {categories.map((cat, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-bold text-slate-700 mb-2">{cat.category}</h4>
                <div className="flex flex-wrap gap-2">
                    {cat.tools.map((tool, tIdx) => (
                        <span key={tIdx} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 font-medium">
                            {tool}
                        </span>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ToolsCard;
