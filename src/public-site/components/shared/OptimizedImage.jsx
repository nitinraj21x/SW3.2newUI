import React, { useState, useCallback } from 'react';
import { useI18n } from '../../contexts/I18nContext';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
  fallbackSrc,
  ...props 
}) => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback((e) => {
    setIsLoading(false);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    setHasError(true);
    setIsLoading(false);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
      return;
    }
    
    onError?.(e);
  }, [onError, fallbackSrc, currentSrc]);

  if (hasError && !fallbackSrc) {
    return (
      <div className={`image-error ${className}`} {...props}>
        <div className="image-error-content">
          <span className="image-error-text">{t('error.imageFailedToLoad')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`} {...props}>
      {isLoading && (
        <div className="image-loading">
          <div className="image-loading-spinner"></div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        className={`optimized-image ${isLoading ? 'loading' : 'loaded'}`}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
};

export default OptimizedImage;