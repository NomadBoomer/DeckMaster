import React from 'react';
import { ToolCategory } from '../types';

interface ToolsCardProps {
  categories: ToolCategory[];
}

const ToolsCard: React.FC<ToolsCardProps> = ({ categories }) => {
  return (
    <div id="tools-card" className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full">
       <div className="bg-slate-800 p-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 00-1 1v6a1 1 0 01-1 1H9a1 1 0 01-1-1v-6a2 2 0 00-1-1H3a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
           Output 2: Tool Requirements
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
            <tr>
              <th className="p-4 border-b w-1/4">Category</th>
              <th className="p-4 border-b w-1/4">Tool Name</th>
              <th className="p-4 border-b">Usage & Purpose</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {categories.map((cat, idx) => (
              <React.Fragment key={idx}>
                {cat.tools.map((tool, tIdx) => (
                  <tr key={`${idx}-${tIdx}`} className="hover:bg-blue-50 border-b border-gray-100 last:border-0">
                    {tIdx === 0 && (
                      <td className="p-4 font-bold text-slate-600 bg-gray-50/50" rowSpan={cat.tools.length}>
                        {cat.category}
                      </td>
                    )}
                    <td className="p-4 font-semibold text-blue-700">{tool.name}</td>
                    <td className="p-4 text-gray-600 leading-relaxed">{tool.description}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ToolsCard;