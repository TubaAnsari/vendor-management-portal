import React from 'react';
import { ToastContainer } from 'react-toastify';
import VendorsList from './pages/VendorsList';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorInfo: error.toString() };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    // You can log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon-large">🚨</div>
            <h1>Something went wrong</h1>
            <p className="error-message">
              {this.state.errorInfo || 'An unexpected error occurred'}
            </p>
            <p className="error-instruction">
              Please try reloading the page or contact support if the problem persists.
            </p>
            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-reload-large">
                🔄 Reload Page
              </button>
              <button 
                onClick={() => window.history.back()} 
                className="btn-back"
              >
                ← Go Back
              </button>
            </div>
            <details className="error-details">
              <summary>Technical Details</summary>
              <pre>{this.state.errorInfo}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <header className="App-header">
          <nav className="app-nav">
            <div className="nav-brand">
              <h1>Vendor Management System</h1>
            </div>
            <div className="nav-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="nav-refresh"
                title="Refresh"
              >
                ⟳
              </button>
            </div>
          </nav>
        </header>
        
        <main className="App-main">
          <VendorsList />
        </main>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;