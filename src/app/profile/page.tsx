'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getUserProfile } from '@/lib/profileService';
import { UserProfile } from '@/lib/types';

export default function ProfilePage() {
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
        if (userProfile) {
          setProfile(userProfile);
        }
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

  if (!profile) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Meu Perfil</h1>
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Meu Perfil</h1>
          <p className="text-gray-400 mt-2">{profile.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar e Informações Principais */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {profile.imageUrl && (
              <div className="w-full h-80 bg-gray-700 overflow-hidden">
                <img
                  src={profile.imageUrl}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{profile.username}</h2>
              <p className="text-orange-500 font-bold text-lg mb-4">{profile.class}</p>

              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-gray-400 text-sm">Nível</span>
                  <div className="text-3xl font-bold text-orange-500">{profile.level}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Experiência</span>
                  <div className="font-bold">{profile.experience} XP</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${(profile.experience % 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {profile.faction && (
                <div className="pt-4 border-t border-gray-700">
                  <span className="text-gray-400 text-sm">Facção</span>
                  <div className="font-bold">{profile.faction}</div>
                </div>
              )}

              <button
                onClick={() => router.push('/profile/edit')}
                className="w-full mt-6 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded font-bold transition"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas e Informações */}
        <div className="lg:col-span-2 space-y-6">
          {/* Saúde */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Saúde</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">HP</span>
              <span className="font-bold">
                {profile.health}/{profile.maxHealth}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-red-500 h-4 rounded-full"
                style={{
                  width: `${(profile.health / profile.maxHealth) * 100}%`,
                }}
              ></div>
            </div>

            {profile.mana !== undefined && profile.maxMana !== undefined && (
              <>
                <div className="flex items-center justify-between mb-2 mt-4">
                  <span className="text-gray-400">Mana</span>
                  <span className="font-bold">
                    {profile.mana}/{profile.maxMana}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{
                      width: `${(profile.mana / profile.maxMana) * 100}%`,
                    }}
                  ></div>
                </div>
              </>
            )}
          </div>

          {/* Atributos */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Atributos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 text-sm">Força</span>
                <div className="text-2xl font-bold text-red-500">{profile.strength}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Destreza</span>
                <div className="text-2xl font-bold text-green-500">{profile.dexterity}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Constituição</span>
                <div className="text-2xl font-bold text-yellow-500">{profile.constitution}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Inteligência</span>
                <div className="text-2xl font-bold text-blue-500">{profile.intelligence}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Sabedoria</span>
                <div className="text-2xl font-bold text-purple-500">{profile.wisdom}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Carisma</span>
                <div className="text-2xl font-bold text-pink-500">{profile.charisma}</div>
              </div>
            </div>
          </div>

          {/* Estatísticas de Combate */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Estatísticas de Combate</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-gray-400 text-sm">Criaturas Mortas</span>
                <div className="text-2xl font-bold text-orange-500">{profile.creatureKills}</div>
              </div>
              {profile.playerKills !== undefined && (
                <div>
                  <span className="text-gray-400 text-sm">Jogadores Mortos</span>
                  <div className="text-2xl font-bold text-red-500">{profile.playerKills}</div>
                </div>
              )}
              <div>
                <span className="text-gray-400 text-sm">Mortes</span>
                <div className="text-2xl font-bold text-red-600">{profile.deaths}</div>
              </div>
            </div>
          </div>

          {/* Ouro */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Recursos</h3>
            <div>
              <span className="text-gray-400 text-sm">Ouro</span>
              <div className="text-3xl font-bold text-yellow-500">{profile.gold}</div>
            </div>
          </div>

          {/* Descrição */}
          {profile.description && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Sobre</h3>
              <p className="text-gray-300">{profile.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
