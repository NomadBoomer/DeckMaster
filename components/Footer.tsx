
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="project-footer" className="max-w-6xl mx-auto px-4 mt-20 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-8">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Methodology & Intelligence</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            DeckMaster AI utilizes <b>Google Gemini Intelligence</b> coupled with <b>Real-Time Search Grounding</b>. 
            Pricing is retrieved dynamically from retail inventories of major US retailers (Home Depot, Lowe's) and verified local lumber specialists 
            within a 10-mile radius of the provided Zip Code. Architectural plans are generated based on IBC (International Building Code) best practices 
            but <i>may require local engineer verification</i>.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Legal Disclaimers</h4>
          <ul className="text-[10px] text-gray-500 space-y-2 list-disc pl-4">
            <li><b>Not a Structural Permit:</b> This document is for planning purposes only. All structures must be reviewed by a licensed structural engineer and approved by local building inspectors.</li>
            <li><b>Pricing Fluctuations:</b> Material costs are estimates based on scraped data and can change daily. Local sales taxes are not included.</li>
            <li><b>Labor Estimates:</b> Labor costs are regional averages and do not represent a binding quote from a contractor.</li>
            <li><b>Safety:</b> Always follow OSHA guidelines and manufacturer instructions when handling tools and materials.</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center text-[10px] text-gray-400">
        &copy; {new Date().getFullYear()} DeckMaster AI Architectural Suite. All technical drawings AI-generated.
      </div>
    </footer>
  );
};

export default Footer;
