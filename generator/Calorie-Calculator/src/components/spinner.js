import React from 'react';

const LoadingSpinner = () => (
    <div style={{ height: `calc(100vh - 50px)` }} className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-50 z-50">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

export default LoadingSpinner;
