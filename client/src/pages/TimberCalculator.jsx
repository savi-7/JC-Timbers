import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Wood type densities (kg/m³) and typical rates
const WOOD_TYPES = {
  teak: { name: 'Teak', density: 650, defaultRate: 5000 },
  mahogany: { name: 'Mahogany', density: 700, defaultRate: 4500 },
  oak: { name: 'Oak', density: 720, defaultRate: 4000 },
  pine: { name: 'Pine', density: 550, defaultRate: 2500 },
  rosewood: { name: 'Rosewood', density: 850, defaultRate: 6000 },
  cedar: { name: 'Cedar', density: 380, defaultRate: 3000 },
  maple: { name: 'Maple', density: 630, defaultRate: 3500 },
  walnut: { name: 'Walnut', density: 610, defaultRate: 5500 },
};

export default function TimberCalculator() {
  const navigate = useNavigate();
  
  const [inputs, setInputs] = useState({
    length: '',
    breadth: '',
    thickness: '',
    quantity: '1',
    woodType: 'teak',
    lengthUnit: 'feet',
    dimensionUnit: 'inches',
    rateUnit: 'cft',
    customRate: '',
  });

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate inputs
  const validate = () => {
    const newErrors = {};
    
    if (!inputs.length || parseFloat(inputs.length) <= 0) {
      newErrors.length = 'Length must be greater than 0';
    }
    if (!inputs.breadth || parseFloat(inputs.breadth) <= 0) {
      newErrors.breadth = 'Breadth must be greater than 0';
    }
    if (!inputs.thickness || parseFloat(inputs.thickness) <= 0) {
      newErrors.thickness = 'Thickness must be greater than 0';
    }
    if (!inputs.quantity || parseInt(inputs.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate results
  const calculateResults = () => {
    if (!validate()) return;

    const length = parseFloat(inputs.length);
    const breadth = parseFloat(inputs.breadth);
    const thickness = parseFloat(inputs.thickness);
    const quantity = parseInt(inputs.quantity);
    const woodData = WOOD_TYPES[inputs.woodType];
    
    // Convert everything to consistent units for calculation
    let lengthInFeet = length;
    if (inputs.lengthUnit === 'meters') {
      lengthInFeet = length * 3.28084; // Convert meters to feet
    }
    
    let breadthInInches = breadth;
    let thicknessInInches = thickness;
    if (inputs.dimensionUnit === 'cm') {
      breadthInInches = breadth / 2.54; // Convert cm to inches
      thicknessInInches = thickness / 2.54;
    }
    
    // Calculate Volume in Cubic Feet (Cft)
    // Formula: (L × B × T × Qty) / 144
    const volumeCft = (lengthInFeet * breadthInInches * thicknessInInches * quantity) / 144;
    
    // Convert to Cubic Meters (Cbm)
    // 1 Cft = 0.0283168 Cbm
    const volumeCbm = volumeCft * 0.0283168;
    
    // Calculate Weight
    // Weight = Volume (Cbm) × Density (kg/m³)
    const weight = volumeCbm * woodData.density;
    
    // Calculate Cost
    const rate = inputs.customRate ? parseFloat(inputs.customRate) : woodData.defaultRate;
    let cost;
    if (inputs.rateUnit === 'cft') {
      cost = volumeCft * rate;
    } else {
      cost = volumeCbm * rate;
    }
    
    setResults({
      volumeCft: volumeCft.toFixed(4),
      volumeCbm: volumeCbm.toFixed(4),
      weight: weight.toFixed(2),
      cost: cost.toFixed(2),
      rate: rate,
      rateUnit: inputs.rateUnit,
      woodType: woodData.name,
      density: woodData.density,
      quantity: quantity,
      lengthDisplay: `${length} ${inputs.lengthUnit}`,
      breadthDisplay: `${breadth} ${inputs.dimensionUnit}`,
      thicknessDisplay: `${thickness} ${inputs.dimensionUnit}`,
    });
  };

  // Reset form
  const handleReset = () => {
    setInputs({
      length: '',
      breadth: '',
      thickness: '',
      quantity: '1',
      woodType: 'teak',
      lengthUnit: 'feet',
      dimensionUnit: 'inches',
      rateUnit: 'cft',
      customRate: '',
    });
    setResults(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-dark-brown/70 hover:text-accent-red font-paragraph transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-accent-red to-dark-brown p-4 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-dark-brown">
                Timber Calculator
              </h1>
              <p className="text-dark-brown/70 font-paragraph mt-1">
                Calculate volume, weight, and cost for timber products
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-dark-brown/10">
            <h2 className="text-2xl font-heading font-bold text-dark-brown mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Input Dimensions
            </h2>

            <div className="space-y-5">
              {/* Length */}
              <div>
                <label className="block text-sm font-semibold text-dark-brown font-paragraph mb-2">
                  Length <span className="text-accent-red">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="length"
                    value={inputs.length}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="Enter length"
                    className={`flex-1 px-4 py-3 border rounded-xl font-paragraph transition-all ${
                      errors.length
                        ? 'border-red-500 focus:ring-red-500/30'
                        : 'border-dark-brown/20 focus:border-accent-red focus:ring-4 focus:ring-accent-red/30'
                    }`}
                  />
                  <select
                    name="lengthUnit"
                    value={inputs.lengthUnit}
                    onChange={handleChange}
                    className="px-4 py-3 border border-dark-brown/20 rounded-xl font-paragraph focus:border-accent-red focus:ring-4 focus:ring-accent-red/30"
                  >
                    <option value="feet">Feet</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
                {errors.length && <p className="text-red-500 text-sm mt-1">{errors.length}</p>}
              </div>

              {/* Breadth */}
              <div>
                <label className="block text-sm font-semibold text-dark-brown font-paragraph mb-2">
                  Breadth (Width) <span className="text-accent-red">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="breadth"
                    value={inputs.breadth}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="Enter breadth"
                    className={`flex-1 px-4 py-3 border rounded-xl font-paragraph transition-all ${
                      errors.breadth
                        ? 'border-red-500 focus:ring-red-500/30'
                        : 'border-dark-brown/20 focus:border-accent-red focus:ring-4 focus:ring-accent-red/30'
                    }`}
                  />
                  <select
                    name="dimensionUnit"
                    value={inputs.dimensionUnit}
                    onChange={handleChange}
                    className="px-4 py-3 border border-dark-brown/20 rounded-xl font-paragraph focus:border-accent-red focus:ring-4 focus:ring-accent-red/30"
                  >
                    <option value="inches">Inches</option>
                    <option value="cm">CM</option>
                  </select>
                </div>
                {errors.breadth && <p className="text-red-500 text-sm mt-1">{errors.breadth}</p>}
              </div>

              {/* Thickness */}
              <div>
                <label className="block text-sm font-semibold text-dark-brown font-paragraph mb-2">
                  Thickness <span className="text-accent-red">*</span>
                </label>
                <input
                  type="number"
                  name="thickness"
                  value={inputs.thickness}
                  onChange={handleChange}
                  step="0.01"
                  placeholder={`Enter thickness (${inputs.dimensionUnit})`}
                  className={`w-full px-4 py-3 border rounded-xl font-paragraph transition-all ${
                    errors.thickness
                      ? 'border-red-500 focus:ring-red-500/30'
                      : 'border-dark-brown/20 focus:border-accent-red focus:ring-4 focus:ring-accent-red/30'
                  }`}
                />
                {errors.thickness && <p className="text-red-500 text-sm mt-1">{errors.thickness}</p>}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-dark-brown font-paragraph mb-2">
                  Quantity (Pieces) <span className="text-accent-red">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={inputs.quantity}
                  onChange={handleChange}
                  min="1"
                  placeholder="Enter quantity"
                  className={`w-full px-4 py-3 border rounded-xl font-paragraph transition-all ${
                    errors.quantity
                      ? 'border-red-500 focus:ring-red-500/30'
                      : 'border-dark-brown/20 focus:border-accent-red focus:ring-4 focus:ring-accent-red/30'
                  }`}
                />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
              </div>

              {/* Wood Type */}
              <div>
                <label className="block text-sm font-semibold text-dark-brown font-paragraph mb-2">
                  Wood Type <span className="text-accent-red">*</span>
                </label>
                <select
                  name="woodType"
                  value={inputs.woodType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-dark-brown/20 rounded-xl font-paragraph focus:border-accent-red focus:ring-4 focus:ring-accent-red/30"
                >
                  {Object.entries(WOOD_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.name} (Density: {value.density} kg/m³)
                    </option>
                  ))}
                </select>
              </div>

              {/* Rate */}
              <div>
                <label className="block text-sm font-semibold text-dark-brown font-paragraph mb-2">
                  Rate per Unit (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="customRate"
                    value={inputs.customRate}
                    onChange={handleChange}
                    step="0.01"
                    placeholder={`Default: ₹${WOOD_TYPES[inputs.woodType].defaultRate}`}
                    className="flex-1 px-4 py-3 border border-dark-brown/20 rounded-xl font-paragraph focus:border-accent-red focus:ring-4 focus:ring-accent-red/30"
                  />
                  <select
                    name="rateUnit"
                    value={inputs.rateUnit}
                    onChange={handleChange}
                    className="px-4 py-3 border border-dark-brown/20 rounded-xl font-paragraph focus:border-accent-red focus:ring-4 focus:ring-accent-red/30"
                  >
                    <option value="cft">per Cft</option>
                    <option value="cbm">per Cbm</option>
                  </select>
                </div>
                <p className="text-sm text-dark-brown/60 font-paragraph mt-1">
                  Leave empty to use default rate for {WOOD_TYPES[inputs.woodType].name}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={calculateResults}
                  className="flex-1 bg-gradient-to-r from-accent-red to-dark-brown text-cream font-heading font-semibold py-4 rounded-xl hover:from-dark-brown hover:to-accent-red transform hover:scale-[1.02] transition-all shadow-lg"
                >
                  Calculate
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 bg-white border-2 border-dark-brown/20 text-dark-brown font-paragraph font-semibold py-4 rounded-xl hover:border-accent-red hover:bg-light-cream transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-gradient-to-br from-accent-red/5 to-dark-brown/5 rounded-3xl shadow-xl p-6 md:p-8 border border-accent-red/20">
            <h2 className="text-2xl font-heading font-bold text-dark-brown mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculation Results
            </h2>

            {!results ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <svg className="w-24 h-24 text-dark-brown/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-dark-brown/60 font-paragraph text-lg">
                  Enter dimensions and click Calculate to see results
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Input Summary */}
                <div className="bg-white rounded-2xl p-5 border border-dark-brown/10">
                  <h3 className="font-heading font-semibold text-dark-brown mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Input Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm font-paragraph">
                    <div>
                      <span className="text-dark-brown/60">Wood Type:</span>
                      <p className="font-semibold text-dark-brown">{results.woodType}</p>
                    </div>
                    <div>
                      <span className="text-dark-brown/60">Quantity:</span>
                      <p className="font-semibold text-dark-brown">{results.quantity} pieces</p>
                    </div>
                    <div>
                      <span className="text-dark-brown/60">Length:</span>
                      <p className="font-semibold text-dark-brown">{results.lengthDisplay}</p>
                    </div>
                    <div>
                      <span className="text-dark-brown/60">Breadth:</span>
                      <p className="font-semibold text-dark-brown">{results.breadthDisplay}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-dark-brown/60">Thickness:</span>
                      <p className="font-semibold text-dark-brown">{results.thicknessDisplay}</p>
                    </div>
                  </div>
                </div>

                {/* Volume Results */}
                <div className="bg-white rounded-2xl p-5 border border-dark-brown/10">
                  <h3 className="font-heading font-semibold text-dark-brown mb-3">📏 Volume</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-dark-brown/70 font-paragraph">Cubic Feet (Cft):</span>
                      <span className="text-2xl font-heading font-bold text-accent-red">{results.volumeCft}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark-brown/70 font-paragraph">Cubic Meter (Cbm):</span>
                      <span className="text-2xl font-heading font-bold text-accent-red">{results.volumeCbm}</span>
                    </div>
                  </div>
                </div>

                {/* Weight Result */}
                <div className="bg-white rounded-2xl p-5 border border-dark-brown/10">
                  <h3 className="font-heading font-semibold text-dark-brown mb-3">⚖️ Weight</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-dark-brown/70 font-paragraph">Total Weight:</span>
                    <span className="text-3xl font-heading font-bold text-dark-brown">{results.weight} kg</span>
                  </div>
                  <p className="text-sm text-dark-brown/60 font-paragraph mt-2">
                    Based on {results.woodType} density of {results.density} kg/m³
                  </p>
                </div>

                {/* Cost Result */}
                <div className="bg-gradient-to-r from-accent-red to-dark-brown rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Total Cost
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-heading font-bold">₹{results.cost}</span>
                  </div>
                  <p className="text-cream/80 font-paragraph mt-2">
                    @ ₹{results.rate} per {results.rateUnit.toUpperCase()}
                  </p>
                </div>

                {/* Formula Reference */}
                <div className="bg-light-cream rounded-2xl p-5 border border-accent-red/20">
                  <h3 className="font-heading font-semibold text-dark-brown mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Formulas Used
                  </h3>
                  <div className="space-y-2 text-sm font-paragraph text-dark-brown/70">
                    <p>• Volume (Cft) = (L × B × T × Qty) / 144</p>
                    <p>• Volume (Cbm) = Cft × 0.0283168</p>
                    <p>• Weight = Volume (Cbm) × Density</p>
                    <p>• Cost = Volume × Rate</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

