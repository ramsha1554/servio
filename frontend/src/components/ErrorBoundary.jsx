import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#fff9f6] text-center p-4">
                    <h1 className="text-4xl font-bold text-[#ff4d2d] mb-4">Oops! Something went wrong.</h1>
                    <p className="text-gray-600 mb-6">We're sorry for the inconvenience. Please try reloading the page.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-[#ff4d2d] text-white rounded-md hover:bg-[#e04328] transition-colors cursor-pointer"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
