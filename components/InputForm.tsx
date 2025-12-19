import React, { useState } from 'react';
import { DeckSpecs, DeckType, MaterialType } from '../types';

interface InputFormProps {
  onSubmit: (specs: DeckSpecs) => void;
  isLoading: boolean;
}

const DeckTypeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const deckInfo = [
    { type: DeckType.ATTACHED, desc: "Connected directly to the house structure using a ledger board. Most common for main-level access.", icon: "🏠" },
    { type: DeckType.DETACHED, desc: "A free-standing structure not physically connected to the house. Great for garden retreats.", icon: "🌳" },
    { type: DeckType.MULTI_LEVEL, desc: "Connected platforms at different heights, often linked by stairs. Ideal for sloped yards.", icon: "🪜" },
    { type: DeckType.WRAP_AROUND, desc: "Encircles multiple sides of a house. Provides massive deck area and multiple access points.", icon: "🔄" },
    { type: DeckType.POOL, desc: "Designed to surround an above-ground or in-ground pool. Requires specialized slip-resistant materials.", icon: "🏊" },
    { type: DeckType.ROOFTOP, desc: "Built on top of a flat roof or garage. Requires expert load-bearing verification.", icon: "🏙️" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Structural Design Explainer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {deckInfo.map(info => (
            <div key={info.type} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="text-3xl mb-2">{info.icon}</div>
              <h4 className="font-bold text-gray-900 mb-1">{info.type}</h4>
              <p className="text-sm text-gray-600">{info.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50 text-center">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Got it!</button>
        </div>
      </div>
    </div>
  );
};

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<DeckSpecs>({
    projectName: '',
    length: 12,
    width: 12,
    height: 2,
    zipCode: '',
    address: '',
    function: 'Dining and Lounging',
    expansion: 'None',
    environment: 'Four seasons, moderate rain',
    type: DeckType.ATTACHED,
    material: MaterialType.PRESSURE_TREATED,
    railingMatch: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
        alert("Project Name is mandatory for your architectural report.");
        return;
    }
    if (!formData.zipCode) {
        alert("Zip Code is required for local cost estimation.");
        return;
    }
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <DeckTypeModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Project Specifications
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name (Mandatory for PDF Report)</label>
          <input 
            type="text" 
            name="projectName" 
            value={formData.projectName} 
            onChange={handleChange} 
            placeholder="e.g. Smith Family Dream Deck" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            required 
          />
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Length (ft)</label>
            <input type="number" name="length" value={formData.length} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width (ft)</label>
            <input type="number" name="width" value={formData.width} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height Off Grade (ft)</label>
            <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code (Required)</label>
            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="e.g. 90210" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street address for maps precision" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4"></div>

        {/* Types & Materials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">Structural Design</label>
                <button 
                  type="button" 
                  onClick={() => setShowModal(true)}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  title="What's this?"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
            </div>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              {Object.values(DeckType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Choice</label>
            <select name="material" value={formData.material} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              {Object.values(MaterialType).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <input type="checkbox" id="railingMatch" name="railingMatch" checked={formData.railingMatch} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label htmlFor="railingMatch" className="text-sm text-gray-700">Match railing material to decking?</label>
        </div>

        <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all shadow-md ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Your Custom Plan...
                </span>
            ) : "Generate Construction Plan"}
        </button>
      </form>
    </div>
  );
};

export default InputForm;