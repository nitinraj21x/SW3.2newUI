import React, { useCallback, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../../config/emailjs';
import { useI18n } from '../../contexts/I18nContext';

const RegistrationModal = React.memo(({ isOpen, onClose, eventName }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    additionalInfo: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const validateName = (name) => {
    if (name.length < 3) return 'Name must be at least 3 characters';
    if (name.length > 50) return 'Name must be no more than 50 characters';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone) => {
    if (phone && phone.length < 10) return 'Please enter a valid phone number';
    return '';
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    
    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phone = phoneError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Initialize EmailJS
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      
      // Template parameters for event registration
      const templateParams = {
        to_name: "Sewing Circle Team",
        from_name: formData.name,
        from_email: formData.email,
        to_email: "ash.tvm@gmail.com",
        event_name: eventName || "Upcoming Event",
        phone: formData.phone || "Not provided",
        dietary_restrictions: formData.dietaryRestrictions || "None",
        additional_info: formData.additionalInfo || "None",
        message: `New event registration for ${eventName || "Upcoming Event"}:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}
Dietary Restrictions: ${formData.dietaryRestrictions || "None"}
Additional Information: ${formData.additionalInfo || "None"}

Please confirm their registration and send event details.`
      };
      
      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.REGISTRATION_TEMPLATE_ID,
        templateParams
      );
      
      console.log('Registration email sent successfully:', result);
      
      // Send to second email
      const templateParams2 = {
        ...templateParams,
        to_email: "sewingcircleservice@gmail.com"
      };
      
      const result2 = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.REGISTRATION_TEMPLATE_ID,
        templateParams2
      );
      
      console.log('Second registration email sent successfully:', result2);
      
      setNotification({
        type: 'success',
        message: "Registration successful! We'll send you event details soon."
      });
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        dietaryRestrictions: '', 
        additionalInfo: '' 
      });
      
      // Auto close notification and modal after 3 seconds
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = "There was an error submitting your registration. ";
      
      if (error.status === 400) {
        errorMessage += "Configuration error. Please try again later.";
      } else if (error.status === 401) {
        errorMessage += "Authentication failed. Please try again later.";
      } else if (error.status === 404) {
        errorMessage += "Service not found. Please try again later.";
      } else {
        errorMessage += `Error: ${error.text || error.message || 'Unknown error'}`;
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
      
      // Auto close error notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onClose, eventName]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        dietaryRestrictions: '', 
        additionalInfo: '' 
      });
      setErrors({});
      setNotification(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div 
        className="modal-backdrop" 
        onClick={onClose}
      ></div>
      
      {/* Custom Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon-text">
              {notification.type === 'success' ? (
                <CheckCircle size={20} className={`notification-icon ${notification.type}`} />
              ) : (
                <AlertCircle size={20} className={`notification-icon ${notification.type}`} />
              )}
              <p className="notification-text">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="notification-close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      <div className="modal-content animate-fade-in-up">
        <button 
          onClick={onClose}
          className="modal-close"
        >
          <X size={24} />
        </button>
        
        <h3 className="modal-title">Register for Event</h3>
        <p className="modal-subtitle">
          {eventName ? `Join us for ${eventName}` : 'Join us for our upcoming event'}
        </p>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {t('registration.fullName')} *
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Jane Doe" 
              required 
              minLength={3}
              maxLength={50}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('registration.emailAddress')} *</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="jane@example.com" 
              required 
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('registration.phoneNumber')}</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="(555) 123-4567" 
            />
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('registration.specialRequests')}</label>
            <input 
              type="text" 
              name="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Vegetarian, Gluten-free, None" 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Additional Information (Optional)</label>
            <textarea 
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Any questions or special requests?"
              rows={3}
            />
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="form-submit"
          >
            {isSubmitting ? t('registration.registering') : t('registration.register')}
          </button>
        </form>
      </div>
    </div>
  );
});

export default RegistrationModal;