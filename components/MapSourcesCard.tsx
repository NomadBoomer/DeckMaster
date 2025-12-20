import React from 'react';

interface MapSourcesCardProps {
  zipCode: string;
  sources: { title: string; uri: string }[];
}

const MapSourcesCard: React.FC<MapSourcesCardProps> = ({ zipCode, sources }) => {
  const mapUrl = `https://www.google.com/maps/embed/v1/search?key=PASTE_API_KEY_OR_USE_IFRAME_FREE&q=hardware+lumber+stores+near+${zipCode}`;
  
  // Note: Using a standard search iframe for demonstration as specific pins require a Maps JS API Key
  const embedUrl = `https://www.google.com/maps?q=lumber+stores+near+${zipCode}&output=embed`;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-700 p-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
           Supplier Network (10 Mile Radius)
        </h3>
      </div>
      
      <div className="flex-grow p-4 space-y-4">
        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
           <iframe 
             width="100%" 
             height="100%" 
             frameBorder="0" 
             style={{ border: 0 }} 
             src={embedUrl} 
             allowFullScreen
           ></iframe>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Verified Supplier Grounding</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.length > 0 ? sources.map((src, i) => (
              <a 
                key={i} 
                href={src.uri} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 p-2 rounded border border-blue-50 bg-blue-50/30 hover:bg-blue-100 transition-colors text-xs font-medium text-blue-800"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                <span className="truncate">{src.title}</span>
              </a>
            )) : (
              <p className="text-xs text-gray-400 italic">Finding local suppliers...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSourcesCard;