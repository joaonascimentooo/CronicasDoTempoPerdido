'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getUserProfile } from '@/lib/profileService';
import { UserProfile } from '@/lib/types';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      try {
        const userProfile = await getUserProfile(currentUser.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="text-center text-2xl">Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Bem-vindo, {user.displayName || user.email}</h1>
        <p className="text-gray-400">Aqui você pode gerenciar seu perfil e acompanhar suas estatísticas</p>
      </div>

      {profile ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-1">Nível</div>
              <div className="text-3xl font-bold text-orange-500">{profile.level}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-1">Criaturas Mortas</div>
              <div className="text-3xl font-bold text-orange-500">{profile.creatureKills}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-1">Mortes</div>
              <div className="text-3xl font-bold text-red-500">{profile.deaths}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-1">Ouro Total</div>
              <div className="text-3xl font-bold text-yellow-500">{profile.gold}</div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold">{profile.username}</h2>
                <p className="text-orange-500 font-bold text-lg">{profile.class}</p>
              </div>
              <Link
                href="/profile"
                className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded font-bold transition"
              >
                Ver Perfil Completo
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <span className="text-gray-400 text-sm">Experiência</span>
                <div className="text-2xl font-bold">{profile.experience} XP</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Saúde</span>
                <div className="text-2xl font-bold text-red-500">
                  {profile.health}/{profile.maxHealth}
                </div>
              </div>
              {profile.mana !== undefined && (
                <div>
                  <span className="text-gray-400 text-sm">Mana</span>
                  <div className="text-2xl font-bold text-blue-500">
                    {profile.mana}/{profile.maxMana}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-gray-400 mb-6">Você ainda não criou seu perfil</p>
          <button
            onClick={() => router.push('/profile/setup')}
            className="inline-block bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-lg font-bold transition"
          >
            Criar Meu Perfil
          </button>
        </div>
      )}
    </div>
  );
}
