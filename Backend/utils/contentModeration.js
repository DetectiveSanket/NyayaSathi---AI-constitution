/**
 * Content Moderation Utility
 * Checks for banned words and inappropriate content
 */

// List of banned/inappropriate words
const BANNED_WORDS = [
  // Add your banned words here (keep it appropriate for documentation)
  'spam',
  'viagra',
  'casino',
  'lottery',
  'winner',
  'click here',
  'buy now',
  'free money',
  'get rich',
  'work from home',
  'bitcoin mining',
  'crypto scam',
  // Add more based on your requirements
];

// Patterns to detect
const SUSPICIOUS_PATTERNS = {
  excessiveUrls: /https?:\/\/[^\s]+/gi,
  excessiveEmails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  phoneNumbers: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  repeatedChars: /(.)\1{4,}/g, // Same character repeated 5+ times
  excessiveCaps: /[A-Z]{10,}/g, // 10+ consecutive caps
};

/**
 * Check if text contains banned words
 * @param {string} text - Text to check
 * @returns {Object} - Result with isSafe flag and detected words
 */
export function checkBannedWords(text) {
  const lowerText = text.toLowerCase();
  const detected = [];

  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerText)) {
      detected.push(word);
    }
  }

  return {
    isSafe: detected.length === 0,
    detected,
    reason: detected.length > 0 ? 'Contains banned words' : null,
  };
}

/**
 * Check for suspicious patterns
 * @param {string} text - Text to check
 * @returns {Object} - Result with flags and details
 */
export function checkSuspiciousPatterns(text) {
  const flags = [];

  // Check for excessive URLs
  const urls = text.match(SUSPICIOUS_PATTERNS.excessiveUrls);
  if (urls && urls.length > 3) {
    flags.push(`Too many URLs (${urls.length})`);
  }

  // Check for excessive emails
  const emails = text.match(SUSPICIOUS_PATTERNS.excessiveEmails);
  if (emails && emails.length > 2) {
    flags.push(`Multiple email addresses (${emails.length})`);
  }

  // Check for phone numbers
  const phones = text.match(SUSPICIOUS_PATTERNS.phoneNumbers);
  if (phones && phones.length > 1) {
    flags.push(`Multiple phone numbers (${phones.length})`);
  }

  // Check for repeated characters
  if (SUSPICIOUS_PATTERNS.repeatedChars.test(text)) {
    flags.push('Repeated characters detected');
  }

  // Check for excessive caps
  if (SUSPICIOUS_PATTERNS.excessiveCaps.test(text)) {
    flags.push('Excessive capitalization');
  }

  return {
    isSafe: flags.length === 0,
    flags,
    reason: flags.length > 0 ? flags.join(', ') : null,
  };
}

/**
 * Comprehensive content moderation
 * @param {Object} data - Data to moderate
 * @param {string} data.name - Name
 * @param {string} data.email - Email
 * @param {string} data.message - Message
 * @returns {Object} - Moderation result
 */
export function moderateContent({ name, email, message }) {
  const results = {
    isApproved: true,
    flags: [],
    reasons: [],
  };

  // Check message length
  if (message.length < 10) {
    results.isApproved = false;
    results.flags.push('message_too_short');
    results.reasons.push('Message too short');
  }

  if (message.length > 2000) {
    results.isApproved = false;
    results.flags.push('message_too_long');
    results.reasons.push('Message exceeds maximum length');
  }

  // Check name length
  if (name.length < 2 || name.length > 60) {
    results.isApproved = false;
    results.flags.push('invalid_name_length');
    results.reasons.push('Invalid name length');
  }

  // Check for banned words in message
  const bannedCheck = checkBannedWords(message);
  if (!bannedCheck.isSafe) {
    results.isApproved = false;
    results.flags.push('banned_words');
    results.reasons.push(bannedCheck.reason);
  }

  // Check for suspicious patterns
  const patternCheck = checkSuspiciousPatterns(message);
  if (!patternCheck.isSafe) {
    results.isApproved = false;
    results.flags.push('suspicious_patterns');
    results.reasons.push(patternCheck.reason);
  }

  // Check if message is all caps (spam indicator)
  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (capsRatio > 0.7 && message.length > 20) {
    results.isApproved = false;
    results.flags.push('excessive_caps');
    results.reasons.push('Message is mostly capitalized');
  }

  return results;
}

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
export function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}
