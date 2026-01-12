'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { createUserProfile, getUserProfile } from '@/lib/profileService';
import { UserProfile } from '@/lib/types';
import { Motion, spring } from 'react-motion';

const CLASSES = ['Ocultista', 'Especialista', 'Combatente'];

const CLASS_DESCRIPTIONS: Record<string, { description: string; emoji: string; color: string }> = {
  Ocultista: { description: 'Manipulador de forças paranormais e magia oculta', emoji: '🔮', color: 'text-purple-400' },
  Especialista: { description: 'Investigador e analista de anomalias paranormais', emoji: '🔬', color: 'text-blue-400' },
  Combatente: { description: 'Guerreiro experiente contra entidades paranormais', emoji: '⚔️', color: 'text-red-400' },
};

export default function SetupProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    class: CLASSES[0],
    imageUrl: '',
    description: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      try {
        const existingProfile = await getUserProfile(currentUser.uid);
        if (existingProfile) {
          router.push('/profile');
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar perfil:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!formData.username.trim()) {
      alert('Por favor, insira um nome de usuário');
      return;
    }

    setSubmitting(true);

    try {
      const profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
        email: user.email || '',
        username: formData.username.trim(),
        class: formData.class,
        level: 1,
        experience: 0,
        health: 100,
        maxHealth: 100,
        mana: formData.class === 'Ocultista' ? 100 : undefined,
        maxMana: formData.class === 'Ocultista' ? 100 : undefined,
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        creatureKills: 0,
        playerKills: 0,
        deaths: 0,
        gold: 100,
        inventory: [],
        skills: [],
        faction: '',
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      await createUserProfile(user.uid, profileData);
      router.push('/profile');
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido. Tente novamente.';
      alert(`Erro ao criar perfil: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-xl text-orange-400 font-bold">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden relative px-6 pt-24">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 w-full max-w-4xl">
          <Motion defaultStyle={{ opacity: 0, y: -40 }} style={{ opacity: spring(1), y: spring(0) }}>
            {(style) => (
              <div className="text-center mb-16" style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-4">
                  Criar Meu Perfil
                </h1>
                <p className="text-gray-300 text-xl max-w-2xl mx-auto">
                  Configure seu personagem e comece sua jornada como agente da V.I.G.I.A.
                </p>
              </div>
            )}
          </Motion>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 200 }), y: spring(0, { delay: 200 }) }}>
              {(style) => (
                <div
                  className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 hover:border-orange-500 rounded-xl p-8 transition"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <label htmlFor="username" className="block text-sm font-bold mb-3 text-orange-400">
                    Nome de Usuário *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Como você quer ser chamado?"
                    className="w-full bg-slate-700/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                    required
                  />
                </div>
              )}
            </Motion>

            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 300 }), y: spring(0, { delay: 300 }) }}>
              {(style) => (
                <div
                  className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 hover:border-orange-500 rounded-xl p-8 transition"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <label htmlFor="class" className="block text-sm font-bold mb-3 text-orange-400">
                    Classe *
                  </label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full bg-slate-700/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                  >
                    {CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  {formData.class && (
                    <p className="text-gray-300 text-sm mt-4 p-4 bg-slate-700/30 rounded-lg border border-orange-500/20">
                      <span className="text-2xl mr-2">{CLASS_DESCRIPTIONS[formData.class].emoji}</span>
                      {CLASS_DESCRIPTIONS[formData.class].description}
                    </p>
                  )}
                </div>
              )}
            </Motion>

            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 400 }), y: spring(0, { delay: 400 }) }}>
              {(style) => (
                <div
                  className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 hover:border-orange-500 rounded-xl p-8 transition"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <label htmlFor="imageUrl" className="block text-sm font-bold mb-3 text-orange-400">
                    URL do Avatar (Opcional)
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://exemplo.com/avatar.png"
                    className="w-full bg-slate-700/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                  />
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-3">Preview do avatar:</p>
                      <img
                        src={formData.imageUrl}
                        alt="Avatar preview"
                        className="max-w-xs max-h-64 rounded-lg border border-orange-500/30 object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </Motion>

            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 500 }), y: spring(0, { delay: 500 }) }}>
              {(style) => (
                <div
                  className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 hover:border-orange-500 rounded-xl p-8 transition"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <label htmlFor="description" className="block text-sm font-bold mb-3 text-orange-400">
                    Descrição (Opcional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Conte um pouco sobre seu personagem..."
                    rows={5}
                    className="w-full bg-slate-700/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition resize-none"
                  />
                </div>
              )}
            </Motion>

            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 600 }), y: spring(0, { delay: 600 }) }}>
              {(style) => (
                <div className="flex gap-4" style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold transition border border-slate-600"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-700 disabled:to-orange-800 text-white px-8 py-3 rounded-lg font-bold transition transform hover:scale-105 shadow-lg"
                  >
                    {submitting ? 'Criando...' : 'Criar Perfil'}
                  </button>
                </div>
              )}
            </Motion>
          </form>
        </div>
      </section>

      {/* Classes Overview Section */}
      <section className="w-full py-24 px-6 bg-slate-800 flex justify-center">
        <div className="w-full max-w-6xl">
          <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 300 }) }}>
            {(style) => (
              <div className="text-center mb-16" style={{ opacity: style.opacity }}>
                <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-4">
                  Escolha Sua Classe
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto"></div>
              </div>
            )}
          </Motion>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {CLASSES.map((cls, index) => (
              <Motion
                key={cls}
                defaultStyle={{ opacity: 0, y: 20 }}
                style={{ opacity: spring(1, { delay: 500 + index * 100 }), y: spring(0, { delay: 500 + index * 100 }) }}
              >
                {(style) => (
                  <div
                    className={`bg-gradient-to-br from-slate-700 to-slate-800 border rounded-xl p-6 transition transform hover:scale-105 cursor-pointer ${
                      formData.class === cls ? 'border-orange-500 shadow-lg shadow-orange-500/50' : 'border-orange-500/30 hover:border-orange-500'
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, class: cls }))}
                    style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                  >
                    <div className="text-4xl mb-3">{CLASS_DESCRIPTIONS[cls].emoji}</div>
                    <h3 className="font-black text-lg text-orange-400 mb-2">{cls}</h3>
                    <p className="text-gray-400 text-sm">{CLASS_DESCRIPTIONS[cls].description}</p>
                  </div>
                )}
              </Motion>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
