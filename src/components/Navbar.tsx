'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, logoutUser } from '@/lib/authService';
import { isMasterEmail } from '@/lib/profileService';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setMenuOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-lg sm:text-2xl font-bold text-orange-500 hover:text-orange-400">
              VIGIA
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
            {loading ? (
              <span className="text-gray-400">...</span>
            ) : user ? (
              <>
                {isMasterEmail(user.email || '') && (
                  <Link href="/master" className="text-gray-300 hover:text-orange-400 font-bold text-sm lg:text-base">
                    Painel Mestre
                  </Link>
                )}
                <Link href="/ranking" className="text-gray-300 hover:text-white text-sm lg:text-base">
                  Ranking
                </Link>
                <Link href="/team" className="text-gray-300 hover:text-white text-sm lg:text-base">
                  Equipe
                </Link>
                <Link href="/profile" className="text-gray-300 hover:text-white text-sm lg:text-base">
                  Meu Perfil
                </Link>
                <div className="text-xs lg:text-sm text-gray-400 truncate max-w-xs">
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 lg:px-4 py-2 rounded transition text-sm lg:text-base"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white transition text-sm lg:text-base">
                  Login
                </Link>
                <Link href="/register" className="bg-orange-600 hover:bg-orange-700 px-3 lg:px-4 py-2 rounded transition text-sm lg:text-base">
                  Registrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 space-y-2">
            {loading ? (
              <span className="text-gray-400 block">...</span>
            ) : user ? (
              <>
                {isMasterEmail(user.email || '') && (
                  <Link 
                    href="/master" 
                    className="block text-gray-300 hover:text-orange-400 font-bold py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Painel Mestre
                  </Link>
                )}
                <Link 
                  href="/ranking" 
                  className="block text-gray-300 hover:text-white py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Ranking
                </Link>
                <Link 
                  href="/team" 
                  className="block text-gray-300 hover:text-white py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Equipe
                </Link>
                <Link 
                  href="/profile" 
                  className="block text-gray-300 hover:text-white py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Meu Perfil
                </Link>
                <div className="text-xs text-gray-400 py-2 truncate">
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-sm text-white"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block text-gray-300 hover:text-white transition py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded transition text-white text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Registrar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
