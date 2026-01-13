'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, logoutUser } from '@/lib/authService';
import { isMasterEmail } from '@/lib/profileService';
import Link from 'next/link';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-orange-500 hover:text-orange-400">
               V.I.G.I.A.
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <span className="text-gray-400">...</span>
            ) : user ? (
              <>
                {isMasterEmail(user.email || '') && (
                  <Link href="/master" className="text-gray-300 hover:text-orange-400 font-bold">
                    Painel Mestre
                  </Link>
                )}
                <Link href="/ranking" className="text-gray-300 hover:text-white">
                  Ranking
                </Link>
                <Link href="/team" className="text-gray-300 hover:text-white">
                  Equipe
                </Link>
                <Link href="/profile" className="text-gray-300 hover:text-white">
                  Meu Perfil
                </Link>
                <div className="text-sm text-gray-400">
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white transition">
                  Login
                </Link>
                <Link href="/register" className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded transition">
                  Registrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
