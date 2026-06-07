import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

const LoadingSpinner = ({ size = 'medium', textKey = 'loading.default' }) => {
  const { t } = useI18n();
  
  const sizeClasses = {
    small: 'loading-spinner-small',
    medium: 'loading-spinner-medium',
    large: 'loading-spinner-large'
  };

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <div className="loading-spinner-circle"></div>
      </div>
      <p className="loading-text">{t(textKey)}</p>
    </div>
  );
};

export default LoadingSpinner;