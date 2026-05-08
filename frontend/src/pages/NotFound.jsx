import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary-50 px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-neutral-600 mb-8">404 — Page not found</p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20"
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
