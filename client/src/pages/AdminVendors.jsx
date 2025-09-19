import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../components/NotificationProvider';

export default function AdminVendors() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  // State management
  const [vendors, setVendors] = useState([]);
  const [woodIntakes, setWoodIntakes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedWoodIntake, setSelectedWoodIntake] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Vendor form data
  const [vendorForm, setVendorForm] = useState({
    name: '',
    contact: {
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    },
    businessDetails: {
      gstNumber: '',
      panNumber: '',
      businessType: 'individual'
    },
    status: 'active'
  });
  
  // Wood intake form data
  const [intakeForm, setIntakeForm] = useState({
    vendorId: '',
    woodDetails: {
      type: 'teak',
      subtype: '',
      dimensions: {
        length: '',
        width: '',
        thickness: '',
        quantity: ''
      },
      quality: 'standard',
      condition: 'good'
    },
    costDetails: {
      unitPrice: '',
      currency: 'INR',
      paymentStatus: 'pending',
      paymentMethod: 'bank_transfer'
    },
    logistics: {
      deliveryDate: '',
      deliveryMethod: 'delivery',
      location: {
        warehouse: '',
        section: '',
        rack: ''
      }
    },
    notes: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [vendorsRes, intakesRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/vendors', { headers }),
        axios.get('http://localhost:5001/api/vendors/intake/all', { headers }),
        axios.get('http://localhost:5001/api/vendors/stats', { headers })
      ]);

      setVendors(vendorsRes.data.vendors);
      setWoodIntakes(intakesRes.data.woodIntakes);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/vendors', vendorForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showSuccess('Vendor created successfully!');
      setShowVendorForm(false);
      setVendorForm({
        name: '',
        contact: { email: '', phone: '', address: { street: '', city: '', state: '', pincode: '', country: 'India' } },
        businessDetails: { gstNumber: '', panNumber: '', businessType: 'individual' },
        status: 'active'
      });
      fetchAllData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create vendor');
    }
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!intakeForm.vendorId) {
      showError('Please select a vendor');
      return;
    }
    
    if (!intakeForm.woodDetails.dimensions.length || 
        !intakeForm.woodDetails.dimensions.width || 
        !intakeForm.woodDetails.dimensions.thickness || 
        !intakeForm.woodDetails.dimensions.quantity) {
      showError('Please fill in all wood dimensions');
      return;
    }
    
    if (!intakeForm.costDetails.unitPrice) {
      showError('Please enter unit price');
      return;
    }
    
    if (!intakeForm.logistics.deliveryDate) {
      showError('Please select delivery date');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Prepare data with proper types
      const formData = {
        ...intakeForm,
        woodDetails: {
          ...intakeForm.woodDetails,
          dimensions: {
            length: parseFloat(intakeForm.woodDetails.dimensions.length),
            width: parseFloat(intakeForm.woodDetails.dimensions.width),
            thickness: parseFloat(intakeForm.woodDetails.dimensions.thickness),
            quantity: parseInt(intakeForm.woodDetails.dimensions.quantity)
          }
        },
        costDetails: {
          ...intakeForm.costDetails,
          unitPrice: parseFloat(intakeForm.costDetails.unitPrice)
        }
      };
      
      const response = await axios.post('http://localhost:5001/api/vendors/intake', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showSuccess('Wood intake logged successfully!');
      setShowIntakeForm(false);
      setIntakeForm({
        vendorId: '',
        woodDetails: { type: 'teak', subtype: '', dimensions: { length: '', width: '', thickness: '', quantity: '' }, quality: 'standard', condition: 'good' },
        costDetails: { unitPrice: '', currency: 'INR', paymentStatus: 'pending', paymentMethod: 'bank_transfer' },
        logistics: { deliveryDate: '', deliveryMethod: 'delivery', location: { warehouse: '', section: '', rack: '' } },
        notes: ''
      });
      fetchAllData();
    } catch (err) {
      console.error('Wood intake error:', err);
      showError(err.response?.data?.message || 'Failed to log wood intake');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Back to Admin Dashboard Button */}
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
              
              {/* Profile Icon with Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mt-1">
                        Admin
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalVendors}</p>
                  <p className="text-xs text-gray-500">{stats.activeVendors} active</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Intakes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalIntakes}</p>
                  <p className="text-xs text-gray-500">{stats.pendingIntakes} pending</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Value</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                  <p className="text-xs text-gray-500">All intakes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Top Vendors</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.topVendors.length}</p>
                  <p className="text-xs text-gray-500">By value</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={() => setShowVendorForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Add New Vendor
          </button>
          <button
            onClick={() => setShowIntakeForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Log Wood Intake
          </button>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Vendors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Intakes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor, index) => (
                  <tr key={vendor._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{vendor.contact.email || 'No email'}</div>
                      <div className="text-gray-500">{vendor.contact.phone}</div>
                      {vendor.contact.address.city && (
                        <div className="text-gray-400 text-xs mt-1">
                          {vendor.contact.address.city}, {vendor.contact.address.state}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{vendor.businessDetails.businessType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{vendor.totalIntake.count} intakes</div>
                      <div className="text-gray-500">{formatCurrency(vendor.totalIntake.value)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                        vendor.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(vendor.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        Edit Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wood Intakes Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Wood Intakes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wood Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {woodIntakes.map((intake, index) => (
                  <tr key={intake._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{intake.vendorId.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{intake.woodDetails.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {intake.woodDetails.dimensions.length}ft × {intake.woodDetails.dimensions.width}" × {intake.woodDetails.dimensions.thickness}"
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intake.woodDetails.dimensions.quantity} pieces</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(intake.costDetails.totalCost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        intake.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        intake.status === 'received' ? 'bg-blue-100 text-blue-800' :
                        intake.status === 'verified' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {intake.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(intake.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedWoodIntake(intake)}
                        className="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        Edit Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Vendor Form Modal */}
      {showVendorForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Vendor</h3>
              <form onSubmit={handleVendorSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={vendorForm.name}
                    onChange={(e) => {
                      const newForm = { ...vendorForm };
                      newForm.name = e.target.value;
                      setVendorForm(newForm);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                  <input
                    type="email"
                    value={vendorForm.contact.email}
                    onChange={(e) => {
                      const newForm = { ...vendorForm };
                      newForm.contact.email = e.target.value;
                      setVendorForm(newForm);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter email (optional for local vendors)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    required
                    value={vendorForm.contact.phone}
                    onChange={(e) => {
                      const newForm = { ...vendorForm };
                      newForm.contact.phone = e.target.value;
                      setVendorForm(newForm);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                {/* Address Fields */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Address Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Street Address</label>
                      <input
                        type="text"
                        value={vendorForm.contact.address.street}
                        onChange={(e) => {
                          const newForm = { ...vendorForm };
                          newForm.contact.address.street = e.target.value;
                          setVendorForm(newForm);
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        value={vendorForm.contact.address.city}
                        onChange={(e) => {
                          const newForm = { ...vendorForm };
                          newForm.contact.address.city = e.target.value;
                          setVendorForm(newForm);
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        value={vendorForm.contact.address.state}
                        onChange={(e) => {
                          const newForm = { ...vendorForm };
                          newForm.contact.address.state = e.target.value;
                          setVendorForm(newForm);
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pincode</label>
                      <input
                        type="text"
                        value={vendorForm.contact.address.pincode}
                        onChange={(e) => {
                          const newForm = { ...vendorForm };
                          newForm.contact.address.pincode = e.target.value;
                          setVendorForm(newForm);
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Pincode"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        type="text"
                        value={vendorForm.contact.address.country}
                        onChange={(e) => {
                          const newForm = { ...vendorForm };
                          newForm.contact.address.country = e.target.value;
                          setVendorForm(newForm);
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Type</label>
                  <select
                    value={vendorForm.businessDetails.businessType}
                    onChange={(e) => {
                      const newForm = { ...vendorForm };
                      newForm.businessDetails.businessType = e.target.value;
                      setVendorForm(newForm);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                
                {/* Status Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={vendorForm.status}
                    onChange={(e) => {
                      const newForm = { ...vendorForm };
                      newForm.status = e.target.value;
                      setVendorForm(newForm);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                
                {/* Business Details */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Business Details (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GST Number</label>
                      <input
                        type="text"
                        value={vendorForm.businessDetails.gstNumber}
                        onChange={(e) => {
                          const newForm = { ...vendorForm };
                          newForm.businessDetails.gstNumber = e.target.value;
                          setVendorForm(newForm);
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="GST Number (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                      <input
                        type="text"
                        value={vendorForm.businessDetails.panNumber}
                        onChange={(e) => {
                          const newForm = { ...vendorForm };
                          newForm.businessDetails.panNumber = e.target.value;
                          setVendorForm(newForm);
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="PAN Number (optional)"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                  >
                    Create Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVendorForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Wood Intake Form Modal */}
      {showIntakeForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Log Wood Intake</h3>
              <form onSubmit={handleIntakeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor</label>
                  <select
                    required
                    value={intakeForm.vendorId}
                    onChange={(e) => {
                      const newForm = { ...intakeForm };
                      newForm.vendorId = e.target.value;
                      setIntakeForm(newForm);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Wood Type</label>
                    <select
                      required
                      value={intakeForm.woodDetails.type}
                      onChange={(e) => {
                        const newForm = { ...intakeForm };
                        newForm.woodDetails.type = e.target.value;
                        setIntakeForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="teak">Teak</option>
                      <option value="rosewood">Rosewood</option>
                      <option value="pine">Pine</option>
                      <option value="oak">Oak</option>
                      <option value="cedar">Cedar</option>
                      <option value="mahogany">Mahogany</option>
                      <option value="bamboo">Bamboo</option>
                      <option value="plywood">Plywood</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={intakeForm.woodDetails.dimensions.quantity}
                      onChange={(e) => {
                        const newForm = { ...intakeForm };
                        newForm.woodDetails.dimensions.quantity = e.target.value;
                        setIntakeForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Number of pieces"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Length (ft)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={intakeForm.woodDetails.dimensions.length}
                      onChange={(e) => {
                        const newForm = { ...intakeForm };
                        newForm.woodDetails.dimensions.length = e.target.value;
                        setIntakeForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Length in feet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Width (inches)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={intakeForm.woodDetails.dimensions.width}
                      onChange={(e) => {
                        const newForm = { ...intakeForm };
                        newForm.woodDetails.dimensions.width = e.target.value;
                        setIntakeForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Width in inches"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Thickness (inches)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={intakeForm.woodDetails.dimensions.thickness}
                      onChange={(e) => {
                        const newForm = { ...intakeForm };
                        newForm.woodDetails.dimensions.thickness = e.target.value;
                        setIntakeForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Thickness in inches"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={intakeForm.costDetails.unitPrice}
                      onChange={(e) => {
                        const newForm = { ...intakeForm };
                        newForm.costDetails.unitPrice = e.target.value;
                        setIntakeForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Price per piece"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                    <input
                      type="date"
                      required
                      value={intakeForm.logistics.deliveryDate}
                      onChange={(e) => {
                        const newForm = { ...intakeForm };
                        newForm.logistics.deliveryDate = e.target.value;
                        setIntakeForm(newForm);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={intakeForm.notes}
                    onChange={(e) => {
                      const newForm = { ...intakeForm };
                      newForm.notes = e.target.value;
                      setIntakeForm(newForm);
                    }}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                  >
                    Log Intake
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIntakeForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Status Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Vendor Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedVendor.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedVendor.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedVendor.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedVendor.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Status</label>
                  <select
                    value={selectedVendor.status}
                    onChange={(e) => {
                      setSelectedVendor({...selectedVendor, status: e.target.value});
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        await axios.put(`http://localhost:5001/api/vendors/${selectedVendor._id}`, {
                          status: selectedVendor.status
                        }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        showSuccess('Vendor status updated successfully!');
                        setSelectedVendor(null);
                        fetchAllData();
                      } catch (err) {
                        showError(err.response?.data?.message || 'Failed to update vendor status');
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Wood Intake Status Modal */}
      {selectedWoodIntake && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Wood Intake Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedWoodIntake.vendorId?.name || 'Unknown Vendor'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Wood Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedWoodIntake.woodDetails?.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedWoodIntake.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedWoodIntake.status === 'received' ? 'bg-blue-100 text-blue-800' :
                    selectedWoodIntake.status === 'verified' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedWoodIntake.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Status</label>
                  <select
                    value={selectedWoodIntake.status}
                    onChange={(e) => {
                      setSelectedWoodIntake({...selectedWoodIntake, status: e.target.value});
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="received">Received</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        await axios.put(`http://localhost:5001/api/vendors/intake/${selectedWoodIntake._id}/status`, {
                          status: selectedWoodIntake.status
                        }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        showSuccess('Wood intake status updated successfully!');
                        setSelectedWoodIntake(null);
                        fetchAllData();
                      } catch (err) {
                        showError(err.response?.data?.message || 'Failed to update wood intake status');
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => setSelectedWoodIntake(null)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
