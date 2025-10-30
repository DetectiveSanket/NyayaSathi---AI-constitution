import { validationResult, body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import Contact from '../models/contact-module.js';
import { sendMail } from '../utils/mailer.js';
import { contactEmailTemplate, contactAutoReplyTemplate } from '../utils/contactTemplate.js';
import { moderateContent, getClientIP } from '../utils/contentModeration.js';

// Rate limiter: 5 requests per minute per IP
export const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: Number(process.env.CONTACT_RATE_LIMIT || 5),
  message: { 
    success: false, 
    message: 'Too many contact requests. Please try again in a minute.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for successful requests to allow legitimate users
  skipSuccessfulRequests: false,
});

// Validation rules
export const contactValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email is too long'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .notEmpty()
    .withMessage('Message cannot be empty'),
];

/**
 * Handle contact form submission
 * @route POST /api/v1/contact
 */
export async function handleContact(req, res) {
  try {
    // 1. Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, email, message } = req.body;
    const ip = getClientIP(req);

    // 2. Content moderation
    const moderationResult = moderateContent({ name, email, message });
    
    if (!moderationResult.isApproved) {
    //   console.log(`⚠️ Content moderation failed for ${email}:`, moderationResult.reasons);
      
      // Still save to DB but mark as spam
      await Contact.create({
        name,
        email,
        message,
        ip,
        status: 'spam',
        moderationFlags: moderationResult.flags,
      });

      return res.status(400).json({ 
        success: false, 
        message: 'Your message could not be processed. Please review and try again.',
        details: moderationResult.reasons.join('. '),
      });
    }

    // 3. Check for duplicate submissions (same email + similar message in last 5 minutes)
    const recentSubmission = await Contact.findOne({
      email,
      message,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (recentSubmission) {
      return res.status(429).json({
        success: false,
        message: 'You have already submitted this message recently. Please wait before submitting again.',
      });
    }

    // 4. Save to database
    const contactEntry = await Contact.create({
      name,
      email,
      message,
      ip,
      status: 'pending',
      moderationFlags: [],
    });

    // console.log(`✅ Contact saved: ${contactEntry._id} from ${email}`);

    // 5. Send email to admin
    try {
      await sendMail({
        to: process.env.CONTACT_TO_EMAIL,
        subject: `NyayaSathi Contact | ${name} <${email}>`,
        html: contactEmailTemplate({ name, email, message }),
        replyTo: email,
      });
    //   console.log(`📧 Admin notification sent for contact ${contactEntry._id}`);
    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', emailError);
      // Don't fail the request if admin email fails
    }

    // 6. Send auto-reply to user (if enabled)
    if (process.env.CONTACT_AUTOREPLY === 'true') {
      try {
        await sendMail({
          to: email,
          subject: 'We received your message — NyayaSathi',
          html: contactAutoReplyTemplate({ name }),
        });
        // console.log(`📧 Auto-reply sent to ${email}`);
      } catch (emailError) {
        console.error('❌ Failed to send auto-reply:', emailError);
        // Don't fail the request if auto-reply fails
      }
    }

    // 7. Success response
    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully! We\'ll get back to you within 24 hours.',
      contactId: contactEntry._id,
    });

  } catch (error) {
    console.error('❌ Contact handler error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get all contact messages (Admin only)
 * @route GET /api/v1/contact
 */
export async function getAllContacts(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = status ? { status } : {};
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const count = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        total: count,
        page: Number(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('❌ Get contacts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contacts',
    });
  }
}

/**
 * Update contact status (Admin only)
 * @route PATCH /api/v1/contact/:id
 */
export async function updateContactStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'spam'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status',
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact status updated',
      data: contact,
    });
  } catch (error) {
    console.error('❌ Update contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update contact',
    });
  }
}
