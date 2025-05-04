
import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center justify-between mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-primary">
              <Link to="/">Reservation Palace</Link>
            </h1>
            <ThemeToggle />
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-0">
            <Link 
              to="/booking" 
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive("/booking") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary"
              }`}
            >
              Book Table
            </Link>
            <Link 
              to="/customers" 
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive("/customers") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary"
              }`}
            >
              Customers
            </Link>
            <Link 
              to="/tables" 
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive("/tables") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary"
              }`}
            >
              Tables
            </Link>
            <Link 
              to="/slots" 
              className={`px-4 py-2 rounded-md transition-colors ${
                isActive("/slots") 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary"
              }`}
            >
              Time Slots
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
