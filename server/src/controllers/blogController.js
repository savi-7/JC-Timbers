import Blog from '../models/Blog.js';
import { convertImageToBase64, cleanupTempFiles } from '../middleware/blogUpload.js';

// Get all published blogs (public)
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true })
      .sort({ order: 1, publishedAt: -1 })
      .limit(6); // Limit to 6 blogs for homepage display
    
    const result = blogs.map(blog => ({
      id: blog._id,
      title: blog.title,
      excerpt: blog.excerpt,
      author: blog.author,
      publishedAt: blog.publishedAt,
      imageUrl: blog.imageUrl,
      category: blog.category,
      tags: blog.tags
    }));

    res.status(200).json({
      success: true,
      blogs: result
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
};

// Get all blogs for admin (including unpublished)
export const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      blogs: blogs.map(blog => ({
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        author: blog.author,
        imageUrl: blog.imageUrl,
        published: blog.published,
        publishedAt: blog.publishedAt,
        order: blog.order,
        tags: blog.tags,
        category: blog.category,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin blogs',
      error: error.message
    });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      blog: {
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        author: blog.author,
        imageUrl: blog.imageUrl,
        published: blog.published,
        publishedAt: blog.publishedAt,
        order: blog.order,
        tags: blog.tags,
        category: blog.category,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
};

// Add new blog
export const addBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author, published, order, tags, category } = req.body;

    if (!title || !excerpt || !content || !author) {
      return res.status(400).json({
        success: false,
        message: 'Title, excerpt, content, and author are required'
      });
    }

    const blogData = {
      title,
      excerpt,
      content,
      author,
      imageUrl: '',
      published: published || false,
      order: order || 0,
      tags: tags || [],
      category: category || 'General'
    };

    // Process uploaded image if any
    if (req.file) {
      console.log('Processing blog image:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        filename: req.file.filename
      });
      
      // Convert image to base64
      const base64Data = convertImageToBase64(req.file.path);
      if (base64Data) {
        // Store as data URL for easier frontend handling
        blogData.imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
        console.log(`Blog image converted: ${req.file.originalname}, size: ${base64Data.length} chars`);
      } else {
        console.error(`Failed to convert blog image: ${req.file.originalname}`);
      }
      
      // Clean up temporary file
      cleanupTempFiles([req.file]);
    }

    // Set publishedAt if publishing
    if (blogData.published && !req.body.publishedAt) {
      blogData.publishedAt = new Date();
    }

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      success: true,
      message: 'Blog added successfully',
      blog: {
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        author: blog.author,
        imageUrl: blog.imageUrl,
        published: blog.published,
        publishedAt: blog.publishedAt,
        order: blog.order,
        tags: blog.tags,
        category: blog.category,
        createdAt: blog.createdAt
      }
    });
  } catch (error) {
    console.error('Error adding blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add blog',
      error: error.message
    });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Process uploaded image if any
    if (req.file) {
      console.log('Processing blog image update:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        filename: req.file.filename
      });
      
      // Convert image to base64
      const base64Data = convertImageToBase64(req.file.path);
      if (base64Data) {
        // Store as data URL for easier frontend handling
        updateData.imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
        console.log(`Blog image updated: ${req.file.originalname}, size: ${base64Data.length} chars`);
      } else {
        console.error(`Failed to convert blog image: ${req.file.originalname}`);
      }
      
      // Clean up temporary file
      cleanupTempFiles([req.file]);
    }

    // Set publishedAt if publishing for the first time
    if (updateData.published && !blog.published && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        blog[key] = updateData[key];
      }
    });

    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      blog: {
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        author: blog.author,
        imageUrl: blog.imageUrl,
        published: blog.published,
        publishedAt: blog.publishedAt,
        order: blog.order,
        tags: blog.tags,
        category: blog.category,
        updatedAt: blog.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message
    });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message
    });
  }
};

// Get blog categories
export const getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { published: true });
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog categories',
      error: error.message
    });
  }
};
