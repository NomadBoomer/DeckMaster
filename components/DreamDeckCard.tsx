import React from 'react';

interface DreamDeckCardProps {
  imageUrl: string | null;
  isLoading: boolean;
}

const DreamDeckCard: React.FC<DreamDeckCardProps> = ({ imageUrl, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="h-64 sm:h-96 bg-gray-200 animate-pulse flex items-center justify-center flex-col gap-4">
           <svg className="w-12 h-12 text-gray-300 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
           <p className="text-gray-400 font-medium">Visualizing your dream deck...</p>
        </div>
      </div>
    );
  }

  if (!imageUrl) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8 transform transition-all hover:shadow-2xl">
      <div className="relative">
        <img 
            src={imageUrl} 
            alt="Your Dream Deck Visualization" 
            className="w-full h-auto object-cover max-h-[500px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white">
                <h2 className="text-3xl font-extrabold tracking-tight">Your Dream Deck</h2>
                <p className="text-gray-200 max-w-xl mt-2 italic">"A deck is more than lumber; it's a sanctuary for shared moments."</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DreamDeckCard;