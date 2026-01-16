'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, logoutUser } from '@/lib/authService';
import { isMasterEmail } from '@/lib/profileService';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function ShopNavbar() {
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
    <nav className="bg-gradient-to-r from-stone-800/60 via-amber-900/40 to-stone-800/60 border-b border-yellow-700/30 shadow-lg backdrop-blur-md relative z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-lg sm:text-2xl font-bold text-amber-300 hover:text-amber-200 transition">
              VIGIA
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
            {loading ? (
              <span className="text-gray-300">...</span>
            ) : user ? (
              <>
                {isMasterEmail(user.email || '') && (
                  <Link href="/master" className="text-amber-200 hover:text-amber-100 font-bold text-sm lg:text-base transition">
                    Painel Mestre
                  </Link>
                )}
                <Link href="/missions" className="text-amber-200 hover:text-amber-100 font-bold text-sm lg:text-base transition">
                  Missões
                </Link>
                <Link href="/ranking" className="text-amber-200 hover:text-amber-100 font-bold text-sm lg:text-base transition">
                  Ranking
                </Link>
                <Link href="/team" className="text-amber-200 hover:text-amber-100 font-bold text-sm lg:text-base transition">
                  Equipe
                </Link>
                <Link href="/shop" className="text-yellow-300 font-bold text-sm lg:text-base transition border-b-2 border-yellow-400">
                  Loja
                </Link>
                <Link href="/profile" className="text-amber-200 hover:text-amber-100 font-bold text-sm lg:text-base transition">
                  Meu Perfil
                </Link>
                <div className="text-xs lg:text-sm text-amber-300/70 truncate max-w-xs">
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 text-white font-bold text-sm lg:text-base shadow-lg hover:shadow-red-700/50"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-amber-200 hover:text-amber-100 font-bold transition text-sm lg:text-base">
                  Login
                </Link>
                <Link href="/register" className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 text-white font-bold text-sm lg:text-base shadow-lg hover:shadow-yellow-600/50">
                  Registrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-amber-300 hover:text-amber-200 transition"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 space-y-2">
            {loading ? (
              <span className="text-gray-300 block">...</span>
            ) : user ? (
              <>
                {isMasterEmail(user.email || '') && (
                  <Link 
                    href="/master" 
                    className="block text-amber-200 hover:text-amber-100 font-bold py-2 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Painel Mestre
                  </Link>
                )}
                <Link 
                  href="/missions" 
                  className="block text-amber-200 hover:text-amber-100 font-bold py-2 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Missões
                </Link>
                <Link 
                  href="/ranking" 
                  className="block text-amber-200 hover:text-amber-100 font-bold py-2 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Ranking
                </Link>
                <Link 
                  href="/team" 
                  className="block text-amber-200 hover:text-amber-100 font-bold py-2 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Equipe
                </Link>
                <Link 
                  href="/shop" 
                  className="block text-yellow-300 font-bold py-2 transition border-l-4 border-yellow-400 pl-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Loja
                </Link>
                <Link 
                  href="/profile" 
                  className="block text-amber-200 hover:text-amber-100 font-bold py-2 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Meu Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 px-4 py-2 rounded-lg transition-all duration-200 text-white font-bold text-sm"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block text-amber-200 hover:text-amber-100 font-bold py-2 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-bold text-sm"
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
