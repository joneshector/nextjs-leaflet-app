'use client';
import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    level?: 'page' | 'component';
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

class MapErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details
        console.error('MapErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo,
        });

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    private getErrorType(error: Error | null): string {
        if (!error) return 'Unknown Error';
        
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('leaflet') || errorMessage.includes('map')) {
            return 'Map Rendering Error';
        }
        if (errorMessage.includes('hydration') || errorMessage.includes('hydrate')) {
            return 'Hydration Error';
        }
        if (errorMessage.includes('import') || errorMessage.includes('module')) {
            return 'Import Error';
        }
        if (errorMessage.includes('network') || errorMessage.includes('tile')) {
            return 'Network/Tile Loading Error';
        }
        if (errorMessage.includes('coordinate') || errorMessage.includes('lat') || errorMessage.includes('lng')) {
            return 'Coordinate Error';
        }
        
        return 'Unexpected Error';
    }

    private getErrorMessage(error: Error | null, level: string): string {
        const errorType = this.getErrorType(error);
        
        switch (errorType) {
            case 'Map Rendering Error':
                return level === 'page' 
                    ? 'Failed to load the map application. Please refresh the page.'
                    : 'The map failed to render properly. Please try refreshing the page.';
            case 'Hydration Error':
                return 'The page is having trouble loading. Please refresh your browser.';
            case 'Import Error':
                return 'Some map components failed to load. Please check your connection and refresh.';
            case 'Network/Tile Loading Error':
                return 'Map tiles failed to load. Please check your internet connection.';
            case 'Coordinate Error':
                return 'Invalid location coordinates detected. Using default location.';
            default:
                return level === 'page'
                    ? 'Something went wrong with the map application.'
                    : 'An unexpected error occurred while loading the map.';
        }
    }

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const level = this.props.level || 'component';
            const errorMessage = this.getErrorMessage(this.state.error, level);
            const errorType = this.getErrorType(this.state.error);

            return (
                <div style={{
                    height: level === 'page' ? '50vh' : '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dee2e6',
                    borderRadius: '12px',
                    padding: '2rem',
                    margin: '1rem',
                    textAlign: 'center',
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        color: '#6c757d',
                    }}>
                        🗺️
                    </div>
                    
                    <h3 style={{
                        color: '#495057',
                        marginBottom: '0.5rem',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                    }}>
                        {errorType}
                    </h3>
                    
                    <p style={{
                        color: '#6c757d',
                        marginBottom: '1.5rem',
                        maxWidth: '400px',
                        lineHeight: '1.5',
                    }}>
                        {errorMessage}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#0056b3';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#007bff';
                            }}
                        >
                            Try Again
                        </button>
                        
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#545b62';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#6c757d';
                            }}
                        >
                            Refresh Page
                        </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: '#856404',
                            maxWidth: '100%',
                        }}>
                            <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                                Error Details (Development)
                            </summary>
                            <pre style={{
                                marginTop: '0.5rem',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default MapErrorBoundary; 