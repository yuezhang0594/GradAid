import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { UserButton, SignedIn, SignInButton, SignedOut } from '@clerk/clerk-react';
import { GradAidLogo } from '@/assets/GradAidLogo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-primary text-left">
            <GradAidLogo className="h-8 w-auto" />GradAid
          </h1>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-text-secondary hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/documents" className="text-text-secondary hover:text-primary transition-colors">
              Documents
            </Link>
            <Link to="/universities" className="text-text-secondary hover:text-primary transition-colors">
              Universities
            </Link>
            <Link to="/applications" className="text-text-secondary hover:text-primary transition-colors">
              Applications
            </Link>
          </nav>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton withSignUp={true} />
            </SignedOut>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text-primary focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/dashboard"
                className="text-text-secondary hover:text-primary transition-colors py-2"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/documents"
                className="text-text-secondary hover:text-primary transition-colors py-2"
                onClick={closeMenu}
              >
                Documents
              </Link>
              <Link
                to="/universities"
                className="text-text-secondary hover:text-primary transition-colors py-2"
                onClick={closeMenu}
              >
                Universities
              </Link>
              <Link
                to="/applications"
                className="text-text-secondary hover:text-primary transition-colors py-2"
                onClick={closeMenu}
              >
                Applications
              </Link>

              {/* Auth Section - Mobile */}
              <div className="pt-4 border-t border-border">
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton withSignUp={true} />
                </SignedOut>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
