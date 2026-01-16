'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange, logoutUser } from '@/lib/authService';
import { isMasterEmail } from '@/lib/profileService';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isShopPage = pathname === '/shop';
  const isRecruitmentPage = pathname === '/recruitment';

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

  const navClasses = isShopPage || isRecruitmentPage
    ? 'bg-gradient-to-r from-stone-800/60 via-amber-900/40 to-stone-800/60 border-b border-yellow-700/30 shadow-lg backdrop-blur-md'
    : 'bg-slate-900 border-b border-slate-700 shadow-lg';

  const logoClasses = isShopPage || isRecruitmentPage
    ? 'text-amber-300 hover:text-amber-200 transition'
    : 'text-orange-500 hover:text-orange-400';

  const linkClasses = isShopPage || isRecruitmentPage
    ? 'text-amber-200 hover:text-amber-100'
    : 'text-gray-300 hover:text-orange-400';

  const shopLinkClasses = isShopPage
    ? 'text-yellow-300 border-b-2 border-yellow-400'
    : isRecruitmentPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400';

  const recruitmentLinkClasses = isRecruitmentPage
    ? 'text-yellow-300 border-b-2 border-yellow-400'
    : isShopPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400';

  const emailClasses = isShopPage || isRecruitmentPage
    ? 'text-amber-300/70'
    : 'text-gray-400';

  const buttonClasses = isShopPage || isRecruitmentPage
    ? 'bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 hover:shadow-red-700/50'
    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-red-600/50';

  const registerClasses = isShopPage || isRecruitmentPage
    ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 shadow-lg hover:shadow-yellow-600/50'
    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-600/50';

  return (
    <nav className={`${isShopPage || isRecruitmentPage ? 'bg-gradient-to-r from-stone-800/60 via-amber-900/40 to-stone-800/60 border-b border-yellow-700/30 shadow-lg backdrop-blur-md' : 'bg-slate-900 border-b border-slate-700 shadow-lg'} relative z-50`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className={`text-lg sm:text-2xl font-bold ${isShopPage || isRecruitmentPage ? 'text-amber-300 hover:text-amber-200' : 'text-orange-500 hover:text-orange-400'}`}>
              VIGIA
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
            {loading ? (
              <span className={isShopPage || isRecruitmentPage ? 'text-gray-300' : 'text-gray-400'}>...</span>
            ) : user ? (
              <>
                {isMasterEmail(user.email || '') && (
                  <Link href="/master" className={`${isShopPage || isRecruitmentPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold text-sm lg:text-base`}>
                    Painel Mestre
                  </Link>
                )}
                <Link href="/missions" className={`${isShopPage || isRecruitmentPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold text-sm lg:text-base transition`}>
                  Missões
                </Link>
                <Link href="/ranking" className={`${isShopPage || isRecruitmentPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold text-sm lg:text-base transition`}>
                  Ranking
                </Link>
                <Link href="/team" className={`${isShopPage || isRecruitmentPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold text-sm lg:text-base transition`}>
                  Equipe
                </Link>
                <Link href="/shop" className={`${isShopPage ? 'text-yellow-300 border-b-2 border-yellow-400' : isRecruitmentPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold text-sm lg:text-base transition`}>
                  Loja
                </Link>
                <Link href="/recruitment" className={`${isRecruitmentPage ? 'text-yellow-300 border-b-2 border-yellow-400' : isShopPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold text-sm lg:text-base transition`}>
                  Recrutamento
                </Link>
                <Link href="/profile" className={`${isShopPage || isRecruitmentPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold text-sm lg:text-base transition`}>
                  Meu Perfil
                </Link>
                <div className={`text-xs lg:text-sm ${emailClasses} truncate max-w-xs`}>
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className={`${buttonClasses} px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 text-white font-bold text-sm lg:text-base shadow-lg`}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`${isShopPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold transition text-sm lg:text-base`}>
                  Login
                </Link>
                <Link href="/register" className={`${isShopPage ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 hover:shadow-yellow-600/50' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-600/50'} px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 text-white font-bold text-sm lg:text-base shadow-lg`}>
                  Registrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={isShopPage ? 'text-amber-300 hover:text-amber-200' : 'text-gray-300 hover:text-white'}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 space-y-2">
            {loading ? (
              <span className={`${isShopPage ? 'text-gray-300' : 'text-gray-400'} block`}>...</span>
            ) : user ? (
              <>
                {isMasterEmail(user.email || '') && (
                  <Link 
                    href="/master" 
                    className={`block ${isShopPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold py-2 transition`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Painel Mestre
                  </Link>
                )}
                <Link 
                  href="/missions" 
                  className={`block ${isShopPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold py-2 transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Missões
                </Link>
                <Link 
                  href="/ranking" 
                  className={`block ${isShopPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold py-2 transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Ranking
                </Link>
                <Link 
                  href="/team" 
                  className={`block ${isShopPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold py-2 transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Equipe
                </Link>
                <Link 
                  href="/shop" 
                  className={isShopPage ? `block text-yellow-300 font-bold py-2 transition border-l-4 border-yellow-400 pl-2` : `block text-gray-300 hover:text-orange-400 font-bold py-2 transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Loja
                </Link>
                <Link 
                  href="/recruitment" 
                  className={`block ${isShopPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold py-2 transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Recrutamento
                </Link>
                <Link 
                  href="/profile" 
                  className={`block ${isShopPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold py-2 transition`}
                  onClick={() => setMenuOpen(false)}
                >
                  Meu Perfil
                </Link>
                <div className={`text-xs lg:text-sm ${isShopPage || isRecruitmentPage ? 'text-amber-300/70' : 'text-gray-400'} truncate max-w-xs`}>
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className={`${isShopPage || isRecruitmentPage ? 'bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 hover:shadow-red-700/50' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-red-600/50'} px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 text-white font-bold text-sm lg:text-base shadow-lg`}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={`block ${isShopPage ? 'text-amber-200 hover:text-amber-100' : 'text-gray-300 hover:text-orange-400'} font-bold transition py-2`}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className={`block ${isShopPage ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 hover:shadow-yellow-600/50' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-600/50'} px-4 py-2 rounded-lg transition-all duration-200 text-white font-bold text-center shadow-lg`}
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
