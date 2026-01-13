'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';
import { Motion, spring } from 'react-motion';
import Link from 'next/link';

export default function ViewProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) return;
      
      try {
        const docRef = doc(db, 'profiles', profileId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
        } else {
          setError('Perfil não encontrado');
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-xl text-orange-400 font-bold">Carregando perfil...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 font-bold mb-4">{error || 'Perfil não encontrado'}</p>
          <Link href="/ranking" className="text-orange-400 hover:text-orange-300 underline">
            Voltar ao Ranking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* Back Button */}
        <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 0 }) }}>
          {(style) => (
            <Link
              href="/ranking"
              style={{ opacity: style.opacity }}
              className="inline-flex items-center text-orange-400 hover:text-orange-300 mb-8 transition"
            >
              ← Voltar ao Ranking
            </Link>
          )}
        </Motion>

        {/* Hero Section */}
        <section className="w-full py-12 px-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-orange-500/30 mb-8">
          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 100 }), y: spring(0, { delay: 100 }) }}>
            {(style) => (
              <div style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }} className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {profile.imageUrl ? (
                    <img
                      src={profile.imageUrl}
                      alt={profile.username}
                      className="w-32 h-32 rounded-lg object-cover border-2 border-orange-500/50"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-4xl font-bold text-white border-2 border-orange-500/50">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-2">
                    {profile.username}
                  </h1>
                  <p className="text-2xl text-orange-400 font-bold mb-4">{profile.class}</p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="bg-slate-700/50 px-4 py-2 rounded-lg border border-orange-500/30">
                      <p className="text-gray-400 text-sm">Nível</p>
                      <p className="text-2xl font-bold text-orange-400">{profile.level}</p>
                    </div>
                    <div className="bg-slate-700/50 px-4 py-2 rounded-lg border border-orange-500/30">
                      <p className="text-gray-400 text-sm">XP</p>
                      <p className="text-2xl font-bold text-blue-400">{profile.experience}</p>
                    </div>
                  </div>
                  {profile.description && (
                    <p className="text-gray-300 mt-4">{profile.description}</p>
                  )}
                </div>
              </div>
            )}
          </Motion>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 px-6 bg-gradient-to-b from-slate-900 to-slate-800 flex justify-center mb-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

        {/* Attributes Section */}
        <section className="w-full py-12 px-6 bg-gradient-to-b from-slate-900 to-slate-800 flex justify-center mb-8">
          <div className="w-full max-w-6xl">
            <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 300 }) }}>
              {(style) => (
                <div className="text-center mb-16" style={{ opacity: style.opacity }}>
                  <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-4">
                    Atributos
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto"></div>
                </div>
              )}
            </Motion>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { name: 'Agilidade', value: profile.dexterity, color: 'text-green-400', icon: '⚡' },
                { name: 'Força', value: profile.strength, color: 'text-red-400', icon: '⚔️' },
                { name: 'Intelecto', value: profile.intelligence, color: 'text-blue-400', icon: '🧠' },
                { name: 'Vigor', value: profile.constitution, color: 'text-yellow-400', icon: '❤️' },
                { name: 'Presença', value: profile.charisma, color: 'text-pink-400', icon: '✨' },
              ].map((attr, index) => (
                <Motion
                  key={index}
                  defaultStyle={{ opacity: 0, y: 20 }}
                  style={{ opacity: spring(1, { delay: 500 + index * 80 }), y: spring(0, { delay: 500 + index * 80 }) }}
                >
                  {(style) => (
                    <div
                      className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 hover:border-orange-500 rounded-xl p-6 transition transform hover:scale-105"
                      style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                    >
                      <div className="text-3xl mb-2">{attr.icon}</div>
                      <p className="text-gray-400 text-sm mb-2">{attr.name}</p>
                      <p className={`text-3xl font-black ${attr.color}`}>{attr.value}</p>
                    </div>
                  )}
                </Motion>
              ))}
            </div>

            {/* Health and Mana */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-400 font-bold">❤️ Saúde</p>
                  <p className="text-gray-400">{profile.health}/{profile.maxHealth}</p>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-red-500/30">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
                    style={{ width: `${(profile.health / profile.maxHealth) * 100}%` }}
                  ></div>
                </div>
              </div>

              {profile.mana !== undefined && profile.maxMana !== undefined && (
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-400 font-bold">🔮 Mana</p>
                    <p className="text-gray-400">{profile.mana}/{profile.maxMana}</p>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-blue-500/30">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all"
                      style={{ width: `${(profile.mana / profile.maxMana) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
