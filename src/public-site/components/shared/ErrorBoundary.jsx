import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryContent 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

// Functional component to use hooks
const ErrorBoundaryContent = ({ error, errorInfo }) => {
  const { t } = useI18n();
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  return (
    <div className="error-boundary">
      <div className="error-boundary-content">
        <h2 className="error-boundary-title">{t('error.somethingWrong')}</h2>
        <p className="error-boundary-message">
          {t('error.unexpectedError')}
        </p>
        <button 
          className="error-boundary-button"
          onClick={handleRefresh}
        >
          {t('error.refreshPage')}
        </button>
        {process.env.NODE_ENV === 'development' && (
          <details className="error-boundary-details">
            <summary>Error Details (Development Only)</summary>
            <pre className="error-boundary-stack">
              {error && error.toString()}
              <br />
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;