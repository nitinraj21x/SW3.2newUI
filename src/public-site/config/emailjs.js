// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create an account and get your keys
// 3. Replace the values below with your actual keys

// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create an account and get your keys
// 3. Set environment variables in your deployment platform
// 4. For local development, create a .env file with these variables

export const EMAILJS_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "Isy0RUOjRl68OwQVx", // Fallback for development
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_cjqvgyo", // Fallback for development
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_xy5rulp", // Contact form template
  REGISTRATION_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_REGISTRATION_TEMPLATE_ID || "template_ptgo7m5", // Event registration template
};

// reCAPTCHA has been removed from the form

// Email Template for EmailJS
// IMPORTANT: Use these EXACT variable names in your EmailJS template:
// - to_name
// - from_name
// - from_email
// - to_email
// - message

/* EmailJS Template Setup:
1. Go to EmailJS Dashboard → Email Templates
2. Edit your template (template_cr9ozdm)
3. Use this EXACT template content:

Subject: New Sewing Circle Member Application

Hello {{to_name}},

You have received a new member application for The Sewing Circle:

Name: {{from_name}}
Email: {{from_email}}

Message:
{{message}}

Best regards,
The Sewing Circle Website

4. In Template Settings:
   - To Email: {{to_email}}
   - From Name: {{from_name}}
   - Reply To: {{from_email}}

5. Make sure your email service is properly connected and verified
*/

// TROUBLESHOOTING 400 ERRORS:
// 1. Double-check Service ID and Template ID are correct
// 2. Ensure template variables match exactly (case-sensitive)
// 3. Verify your email service is connected and working
// 4. Check that your domain is authorized in EmailJS security settings