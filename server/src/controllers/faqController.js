import FAQ from '../models/FAQ.js';

// Get all FAQs (public)
export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true })
      .sort({ category: 1, order: 1 });
    
    // Group FAQs by category
    const groupedFAQs = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push({
        id: faq._id,
        question: faq.question,
        answer: faq.answer
      });
      return acc;
    }, {});

    // Convert to array format
    const result = Object.keys(groupedFAQs).map(category => ({
      category,
      questions: groupedFAQs[category]
    }));

    res.status(200).json({
      success: true,
      faqs: result
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQs',
      error: error.message
    });
  }
};

// Get all FAQs for admin (including inactive)
export const getAdminFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find()
      .sort({ category: 1, order: 1 });
    
    res.status(200).json({
      success: true,
      faqs: faqs.map(faq => ({
        id: faq._id,
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching admin FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin FAQs',
      error: error.message
    });
  }
};

// Add new FAQ
export const addFAQ = async (req, res) => {
  try {
    const { category, question, answer, order } = req.body;

    if (!category || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Category, question, and answer are required'
      });
    }

    const faq = new FAQ({
      category,
      question,
      answer,
      order: order || 0
    });

    await faq.save();

    res.status(201).json({
      success: true,
      message: 'FAQ added successfully',
      faq: {
        id: faq._id,
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt
      }
    });
  } catch (error) {
    console.error('Error adding FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add FAQ',
      error: error.message
    });
  }
};

// Update FAQ
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, question, answer, order, isActive } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Update fields
    if (category !== undefined) faq.category = category;
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (order !== undefined) faq.order = order;
    if (isActive !== undefined) faq.isActive = isActive;

    await faq.save();

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      faq: {
        id: faq._id,
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        isActive: faq.isActive,
        updatedAt: faq.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update FAQ',
      error: error.message
    });
  }
};

// Delete FAQ
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await FAQ.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete FAQ',
      error: error.message
    });
  }
};

// Get FAQ categories
export const getFAQCategories = async (req, res) => {
  try {
    const categories = await FAQ.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQ categories',
      error: error.message
    });
  }
};




