import React from 'react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <h1 className="text-5xl font-extrabold mb-4">AscendPath</h1>
      <p className="text-xl mb-8 text-indigo-100">Elevate your career journey.</p>
      <div className="flex gap-4">
        <Link to="/auth/login" className="bg-white text-indigo-600 px-6 py-3 rounded font-bold hover:bg-indigo-50 transition">
          Login
        </Link>
        <Link to="/auth/register" className="border border-white text-white px-6 py-3 rounded font-bold hover:bg-white/10 transition">
          Register
        </Link>
      </div>
    </div>
  );
};
