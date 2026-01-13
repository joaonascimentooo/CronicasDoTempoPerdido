'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getUserProfile, isMasterEmail, getMasterCharacters } from '@/lib/profileService';
import { getAllTeams } from '@/lib/teamService';
import { UserProfile, Team } from '@/lib/types';
import { Motion, spring } from 'react-motion';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
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
        let userProfile: UserProfile | null = null;

        // Se for mestre, busca o primeiro personagem ou redireciona
        if (isMasterEmail(currentUser.email || '')) {
          const characters = await getMasterCharacters(currentUser.uid);
          if (characters.length > 0) {
            userProfile = characters[0];
          } else {
            router.push('/master/new');
            return;
          }
        } else {
          // Para jogadores normais, busca seu perfil único
          userProfile = await getUserProfile(currentUser.uid);
        }

        if (userProfile) {
          setProfile(userProfile);
          
          // Carregar equipe do usuário
          try {
            const teams = await getAllTeams();
            const team = teams.find(t => t.members.some(m => m.userId === userProfile.id));
            setUserTeam(team || null);
          } catch (error) {
            console.error('Erro ao carregar equipe:', error);
            setUserTeam(null);
          }
        } else {
          router.push('/profile/setup');
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
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-xl text-orange-400 font-bold">Carregando seu perfil...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden relative px-6">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 text-center max-w-2xl">
          <Motion defaultStyle={{ opacity: 0, y: -20 }} style={{ opacity: spring(1), y: spring(0) }}>
            {(style) => (
              <>
                <div className="text-6xl mb-6" style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                  👤
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-4" style={{ opacity: style.opacity }}>
                  Perfil Vazio
                </h2>
                <p className="text-gray-300 text-lg mb-8" style={{ opacity: style.opacity }}>
                  Você ainda não criou seu perfil. Configure seu personagem para começar sua jornada como agente da V.I.G.I.A.
                </p>
                <button
                  onClick={() => router.push('/profile/setup')}
                  className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-lg"
                  style={{ opacity: style.opacity }}
                >
                  Criar Meu Perfil
                </button>
              </>
            )}
          </Motion>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section com Avatar */}
      <section className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden relative px-6 pt-24">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Avatar */}
            <Motion defaultStyle={{ opacity: 0, x: -40 }} style={{ opacity: spring(1), x: spring(0) }}>
              {(style) => (
                <div style={{ opacity: style.opacity, transform: `translateX(${style.x}px)` }}>
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-2xl overflow-hidden shadow-2xl">
                    {profile.imageUrl ? (
                      <img
                        src={profile.imageUrl}
                        alt={profile.username}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-6xl">
                        👤
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Motion>

            {/* Info */}
            <Motion defaultStyle={{ opacity: 0, x: 40 }} style={{ opacity: spring(1), x: spring(0) }}>
              {(style) => (
                <div style={{ opacity: style.opacity, transform: `translateX(${style.x}px)` }}>
                  <p className="text-orange-400 font-bold text-lg mb-2">{profile.class}</p>
                  <h1 className="text-6xl md:text-7xl font-black text-white mb-4">{profile.username}</h1>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                        Nível {profile.level}
                      </span>
                      <span className="text-gray-400">{userTeam ? userTeam.name : 'Sem Equipe'}</span>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300 text-sm">Experiência</span>
                        <span className="text-orange-400 font-bold">{profile.experience} XP</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden border border-orange-500/30">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full"
                          style={{
                            width: `${(profile.experience % 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {profile.faction && (
                    <p className="text-gray-300 mb-8">
                      <span className="text-orange-400 font-bold">Facção:</span> {profile.faction}
                    </p>
                  )}

                  <div className="flex gap-4">
                    <Link
                      href="/profile/edit"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-bold transition transform hover:scale-105 text-center"
                    >
                      Editar Perfil
                    </Link>
                    <Link
                      href="/team"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-bold transition transform hover:scale-105 text-center"
                    >
                      Ver Equipe
                    </Link>
                  </div>
                </div>
              )}
            </Motion>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-24 px-6 bg-slate-800 flex justify-center">
        <div className="w-full max-w-6xl">
          <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 300 }) }}>
            {(style) => (
              <div className="text-center mb-16" style={{ opacity: style.opacity }}>
                <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-4">
                  Suas Estatísticas
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto"></div>
              </div>
            )}
          </Motion>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Nível', value: profile.level, color: 'text-orange-400' },
              { label: 'Criaturas Mortas', value: profile.creatureKills, color: 'text-orange-400' },
              { label: 'Seres Mortos', value: profile.deaths, color: 'text-red-500' },
              { label: 'Ouro', value: profile.gold, color: 'text-yellow-500' },
            ].map((stat, index) => (
              <Motion
                key={index}
                defaultStyle={{ opacity: 0, y: 20 }}
                style={{ opacity: spring(1, { delay: 400 + index * 100 }), y: spring(0, { delay: 400 + index * 100 }) }}
              >
                {(style) => (
                  <div
                    className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-6 hover:border-orange-500 transition"
                    style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                  >
                    <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                    <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                )}
              </Motion>
            ))}
          </div>
        </div>
      </section>

      {/* Description Section */}
      {profile.description && (
        <section className="w-full py-24 px-6 bg-slate-800 flex justify-center">
          <div className="w-full max-w-4xl">
            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1), y: spring(0) }}>
              {(style) => (
                <div
                  className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-8"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <h3 className="text-3xl font-black text-orange-400 mb-6">Sobre Você</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{profile.description}</p>
                </div>
              )}
            </Motion>
          </div>
        </section>
      )}
    </div>
  );
}
