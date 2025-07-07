import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { AuthService } from '@/services/AuthService';
import { Moon, Sun, Menu, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import logo from '@/assets/images/logo.svg';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isMobile, isMenuOpen, toggleMenu } = useApp();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container max-w-7xl h-16 flex items-center justify-between py-4">
        {/* Logo et Titre */}
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto mr-2" />
            <span className="font-bold text-xl">Gestion Ventes</span>
          </NavLink>
        </div>

        {/* Menu burger (mobile) */}
        {isMobile && (
          <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}

        {/* Navigation */}
        <div className={`nav-links ${isMobile ? (isMenuOpen ? 'open' : 'closed') : 'open'} flex items-center gap-4`}>
          <ul className="flex flex-col md:flex-row gap-4 items-center">
            <li><NavLink to="/" className="nav-link">Accueil</NavLink></li>
            <li><NavLink to="/about" className="nav-link">À propos</NavLink></li>
            <li><NavLink to="/contact" className="nav-link">Contact</NavLink></li>
            <li><NavLink to="/tendances" className="nav-link">Tendances</NavLink></li>
            {user && (
              <NavLink to="/rendez-vous" className="nav-link">
                <Calendar className="w-4 h-4" />
                Rendez-vous
              </NavLink>
            )}
          </ul>

          {/* Actions (Bouton Thème et Connexion/Déconnexion) */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <div className="relative">
                <Avatar
                  className="cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                  <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                </Avatar>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <a href="/profile" className="dropdown-link">
                        Mon Profil
                      </a>
                      <button onClick={handleLogout} className="dropdown-link">
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className="nav-link">Connexion</NavLink>
                <NavLink to="/register" className="nav-link">Inscription</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
