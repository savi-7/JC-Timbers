import Enquiry from '../models/Enquiry.js';
import { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

// User: Submit new enquiry
export const submitEnquiry = async (req, res) => {
    try {
        const { contactName, contactEmail, contactPhone, enquiryType, productId, selectedOptions, customDescription } = req.body;

        if (!enquiryType) {
            return res.status(400).json({ message: 'Enquiry type is required' });
        }

        // Process uploaded images for custom-request
        const customImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (isCloudinaryConfigured()) {
                    const cloudResult = await uploadToCloudinary(file.path);
                    if (cloudResult) {
                        customImages.push({
                            url: cloudResult.url,
                            publicId: cloudResult.publicId
                        });
                    }
                } else {
                    // Simplification for legacy fallback: if Cloudinary is not configured, we might not save image properly
                    // In real production, would use base64 similarly to products.
                    console.warn("Cloudinary not configured for Enquiry uploads.");
                }
            }
        }

        // Parse selected options if sent as string
        let parsedOptions = {};
        if (selectedOptions) {
            try {
                parsedOptions = typeof selectedOptions === 'string' ? JSON.parse(selectedOptions) : selectedOptions;
            } catch (e) {
                console.warn("Failed to parse selectedOptions");
            }
        }

        const newEnquiry = new Enquiry({
            user: req.user.id || req.user._id,
            contactName,
            contactEmail,
            contactPhone,
            enquiryType,
            product: productId || null,
            selectedOptions: parsedOptions,
            customImages,
            customDescription
        });

        await newEnquiry.save();

        res.status(201).json({
            message: 'Enquiry submitted successfully',
            enquiry: newEnquiry
        });
    } catch (error) {
        console.error('Error submitting enquiry:', error);
        res.status(500).json({ message: 'Failed to submit enquiry', error: error.message });
    }
};

// User: Get their own enquiries
export const getMyEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find({ user: req.user.id || req.user._id })
            .populate('product', 'name images')
            .sort({ createdAt: -1 });

        res.json(enquiries);
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        res.status(500).json({ message: 'Failed to fetch enquiries' });
    }
};

// Admin: Get all enquiries
export const getAllEnquiries = async (req, res) => {
    try {
        const { status, type } = req.query;
        const query = {};
        if (status && status !== 'all') query.status = status;
        if (type && type !== 'all') query.enquiryType = type;

        const enquiries = await Enquiry.find(query)
            .populate('product', 'name price images')
            .sort({ createdAt: -1 });

        res.json(enquiries);
    } catch (error) {
        console.error('Error fetching all enquiries:', error);
        res.status(500).json({ message: 'Failed to fetch enquiries' });
    }
};

// Admin: Update enquiry status and add Quote
export const updateEnquiryQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, quotePrice, estimatedDeliveryTime, adminRemarks } = req.body;

        const enquiry = await Enquiry.findById(id);
        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        if (status) enquiry.status = status;

        if (quotePrice !== undefined || estimatedDeliveryTime || adminRemarks) {
            enquiry.quote = {
                price: quotePrice !== undefined ? quotePrice : enquiry.quote?.price,
                estimatedDeliveryTime: estimatedDeliveryTime || enquiry.quote?.estimatedDeliveryTime,
                adminRemarks: adminRemarks || enquiry.quote?.adminRemarks,
                quotedAt: new Date()
            };

            // Auto-update to Quoted if we just provided a quote and it was pending/under review
            if ((enquiry.status === 'Pending' || enquiry.status === 'Under Review') && quotePrice) {
                enquiry.status = 'Quoted';
            }
        }

        await enquiry.save();
        res.json({ message: 'Enquiry updated successfully', enquiry });
    } catch (error) {
        console.error('Error updating enquiry:', error);
        res.status(500).json({ message: 'Failed to update enquiry' });
    }
};

// User: Accept Quote (this changes the status, making it ready to be converted into an Order)
export const acceptQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const enquiry = await Enquiry.findOne({ _id: id, user: req.user.id || req.user._id });

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        if (enquiry.status !== 'Quoted') {
            return res.status(400).json({ message: 'Enquiry is not in a quoted state' });
        }

        enquiry.status = 'Accepted';
        await enquiry.save();

        res.json({ message: 'Quote accepted successfully', enquiry });
    } catch (error) {
        console.error('Error accepting quote:', error);
        res.status(500).json({ message: 'Failed to accept quote' });
    }
};
