import React, { useState } from 'react';
import { DeckSpecs, DeckType, MaterialType } from '../types';

interface InputFormProps {
  onSubmit: (specs: DeckSpecs) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<DeckSpecs>({
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
    if (!formData.zipCode) {
        alert("Zip Code is required for local cost estimation.");
        return;
    }
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Project Specifications
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
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

        {/* Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Primary Function</label>
             <input type="text" name="function" value={formData.function} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Environmental Factors</label>
             <input type="text" name="environment" value={formData.environment} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        
        {/* Expansion */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Future Expansion / Contingency</label>
           <input type="text" name="expansion" value={formData.expansion} onChange={handleChange} placeholder="e.g. Adding a hot tub later" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="border-t border-gray-200 pt-4"></div>

        {/* Types & Materials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Structural Design</label>
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
                    Generating Plan & Estimates...
                </span>
            ) : "Generate Construction Plan"}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
