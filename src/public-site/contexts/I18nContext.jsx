import React, { createContext, useContext, useState, useCallback } from 'react';

// Translation keys and default values
const translations = {
  en: {
    // Contact Modal
    'contact.getInTouch': 'Get in Touch',
    'contact.connectWithUs': 'Connect with us and join our community',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.success': 'Message sent successfully!',
    'contact.error': 'Failed to send message. Please try again.',
    
    // Registration Modal
    'registration.eventRegistration': 'Event Registration',
    'registration.registerForEvent': 'Register for this event',
    'registration.fullName': 'Full Name',
    'registration.emailAddress': 'Email Address',
    'registration.phoneNumber': 'Phone Number',
    'registration.specialRequests': 'Special Requests or Dietary Restrictions',
    'registration.register': 'Register',
    'registration.registering': 'Registering...',
    'registration.success': 'Registration successful!',
    'registration.error': 'Registration failed. Please try again.',
    
    // Loading messages
    'loading.navigation': 'Loading navigation...',
    'loading.hero': 'Loading hero section...',
    'loading.about': 'Loading about section...',
    'loading.objectives': 'Loading objectives...',
    'loading.vision': 'Loading vision...',
    'loading.future': 'Loading future section...',
    'loading.community': 'Loading community...',
    'loading.events': 'Loading events...',
    'loading.contact': 'Loading contact...',
    'loading.footer': 'Loading footer...',
    'loading.default': 'Loading...',
    
    // Error messages
    'error.somethingWrong': 'Something went wrong',
    'error.unexpectedError': 'We\'re sorry, but something unexpected happened. Please try refreshing the page.',
    'error.refreshPage': 'Refresh Page',
    'error.imageFailedToLoad': 'Image failed to load'
  },
  es: {
    // Contact Modal
    'contact.getInTouch': 'Ponte en Contacto',
    'contact.connectWithUs': 'Conéctate con nosotros y únete a nuestra comunidad',
    'contact.name': 'Nombre',
    'contact.email': 'Correo Electrónico',
    'contact.message': 'Mensaje',
    'contact.send': 'Enviar Mensaje',
    'contact.sending': 'Enviando...',
    'contact.success': '¡Mensaje enviado exitosamente!',
    'contact.error': 'Error al enviar mensaje. Por favor intenta de nuevo.',
    
    // Registration Modal
    'registration.eventRegistration': 'Registro de Evento',
    'registration.registerForEvent': 'Regístrate para este evento',
    'registration.fullName': 'Nombre Completo',
    'registration.emailAddress': 'Dirección de Correo',
    'registration.phoneNumber': 'Número de Teléfono',
    'registration.specialRequests': 'Solicitudes Especiales o Restricciones Dietéticas',
    'registration.register': 'Registrarse',
    'registration.registering': 'Registrando...',
    'registration.success': '¡Registro exitoso!',
    'registration.error': 'Error en el registro. Por favor intenta de nuevo.',
    
    // Loading messages
    'loading.navigation': 'Cargando navegación...',
    'loading.hero': 'Cargando sección principal...',
    'loading.about': 'Cargando sección acerca de...',
    'loading.objectives': 'Cargando objetivos...',
    'loading.vision': 'Cargando visión...',
    'loading.future': 'Cargando sección futuro...',
    'loading.community': 'Cargando comunidad...',
    'loading.events': 'Cargando eventos...',
    'loading.contact': 'Cargando contacto...',
    'loading.footer': 'Cargando pie de página...',
    'loading.default': 'Cargando...',
    
    // Error messages
    'error.somethingWrong': 'Algo salió mal',
    'error.unexpectedError': 'Lo sentimos, pero algo inesperado ocurrió. Por favor intenta refrescar la página.',
    'error.refreshPage': 'Refrescar Página',
    'error.imageFailedToLoad': 'Error al cargar imagen'
  }
};

const I18nContext = createContext();

export const I18nProvider = ({ children, defaultLanguage = 'en' }) => {
  const [language, setLanguage] = useState(defaultLanguage);

  const t = useCallback((key, fallback = key) => {
    return translations[language]?.[key] || translations.en[key] || fallback;
  }, [language]);

  const changeLanguage = useCallback((newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('preferred-language', newLanguage);
    }
  }, []);

  const value = {
    language,
    t,
    changeLanguage,
    availableLanguages: Object.keys(translations)
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nContext;