import React, { useState, useEffect } from 'react';
import { useNotification } from '../NotificationProvider';

export default function CustomCategories() {
  const { showSuccess, showError } = useNotification();
  const [activeCategory, setActiveCategory] = useState('furniture');
  const [customCategories, setCustomCategories] = useState({
    furniture: [],
    timber: [],
    construction: []
  });
  const [newCategory, setNewCategory] = useState({ value: '', label: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    loadCustomCategories();
  }, []);

  const loadCustomCategories = () => {
    try {
      const saved = localStorage.getItem('admin_custom_categories');
      if (saved) {
        setCustomCategories(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading custom categories:', error);
    }
  };

  const saveCustomCategories = (updated) => {
    try {
      localStorage.setItem('admin_custom_categories', JSON.stringify(updated));
      setCustomCategories(updated);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('customCategoriesUpdated', { detail: updated }));
      
      showSuccess('Custom categories saved successfully');
    } catch (error) {
      console.error('Error saving custom categories:', error);
      showError('Failed to save custom categories');
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.value.trim() || !newCategory.label.trim()) {
      showError('Please enter both category value and label');
      return;
    }

    const value = newCategory.value.toLowerCase().trim().replace(/\s+/g, '-');
    const label = newCategory.label.trim();

    // Check for duplicates
    const existing = customCategories[activeCategory].find(
      (cat) => cat.value === value || cat.label.toLowerCase() === label.toLowerCase()
    );

    if (existing) {
      showError('This category already exists');
      return;
    }

    const updated = {
      ...customCategories,
      [activeCategory]: [
        ...customCategories[activeCategory],
        { value, label }
      ]
    };

    saveCustomCategories(updated);
    setNewCategory({ value: '', label: '' });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ value: category.value, label: category.label });
  };

  const handleUpdateCategory = () => {
    if (!newCategory.value.trim() || !newCategory.label.trim()) {
      showError('Please enter both category value and label');
      return;
    }

    const value = newCategory.value.toLowerCase().trim().replace(/\s+/g, '-');
    const label = newCategory.label.trim();

    // Check for duplicates (excluding the one being edited)
    const existing = customCategories[activeCategory].find(
      (cat) => cat.value !== editingCategory.value && 
      (cat.value === value || cat.label.toLowerCase() === label.toLowerCase())
    );

    if (existing) {
      showError('This category already exists');
      return;
    }

    const updated = {
      ...customCategories,
      [activeCategory]: customCategories[activeCategory].map((cat) =>
        cat.value === editingCategory.value ? { value, label } : cat
      )
    };

    saveCustomCategories(updated);
    setEditingCategory(null);
    setNewCategory({ value: '', label: '' });
  };

  const handleDeleteCategory = (categoryValue) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    const updated = {
      ...customCategories,
      [activeCategory]: customCategories[activeCategory].filter(
        (cat) => cat.value !== categoryValue
      )
    };

    saveCustomCategories(updated);
    if (editingCategory?.value === categoryValue) {
      setEditingCategory(null);
      setNewCategory({ value: '', label: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategory({ value: '', label: '' });
  };

  const categoryTypes = {
    furniture: { name: 'Furniture', color: 'purple' },
    timber: { name: 'Timber Products', color: 'blue' },
    construction: { name: 'Construction Materials', color: 'orange' }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Custom Categories</h2>

        {/* Category Type Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {Object.entries(categoryTypes).map(([key, type]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveCategory(key);
                  setEditingCategory(null);
                  setNewCategory({ value: '', label: '' });
                }}
                className={`${
                  activeCategory === key
                    ? `border-${type.color}-500 text-${type.color}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
              >
                {type.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Add/Edit Category Form */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Value (URL-friendly)
              </label>
              <input
                type="text"
                value={newCategory.value}
                onChange={(e) => setNewCategory({ ...newCategory, value: e.target.value })}
                placeholder="e.g., bookshelf, coffee-table"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Lowercase, use hyphens for spaces (e.g., "coffee-table")
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Label (Display Name)
              </label>
              <input
                type="text"
                value={newCategory.label}
                onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                placeholder="e.g., Bookshelf, Coffee Table"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                This is what users will see
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            {editingCategory ? (
              <>
                <button
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Category
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            )}
          </div>
        </div>

        {/* Categories List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {categoryTypes[activeCategory].name} Categories
          </h3>
          {customCategories[activeCategory].length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No custom categories added yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Add your first custom category using the form above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customCategories[activeCategory].map((category) => (
                <div
                  key={category.value}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{category.label}</p>
                      <p className="text-sm text-gray-500 mt-1">{category.value}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.value)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

