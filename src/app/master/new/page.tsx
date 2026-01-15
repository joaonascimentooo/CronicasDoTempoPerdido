'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { isMasterEmail, createMasterCharacter } from '@/lib/profileService';
import { UserProfile } from '@/lib/types';
import { Motion, spring } from '@/lib/MotionWrapper';

const CLASSES = [
  {
    name: 'Ocultista',
    description: 'Domina a magia oculta e manipula energias paranormais',
    emoji: '🔮',
  },
  {
    name: 'Especialista',
    description: 'Investigador experiente em fenômenos sobrenaturais',
    emoji: '🔍',
  },
  {
    name: 'Combatente',
    description: 'Guerreiro treinado contra entidades paranormais',
    emoji: '⚔️',
  },
];

interface FormData {
  username: string;
  class: string;
  imageUrl?: string;
  description?: string;
}

export default function NewMasterCharacterPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    class: 'Ocultista',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      if (!isMasterEmail(currentUser.email || '')) {
        router.push('/profile');
        return;
      }

      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: value }));
    setImagePreview(value || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username.trim()) {
      setError('Nome do personagem é obrigatório');
      setLoading(false);
      return;
    }

    if (!user) return;

    try {
      const characterData: Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        email: user.email || '',
        username: formData.username,
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
        charisma: 10,
        creatureKills: 0,
        playerKills: 0,
        deaths: 0,
        gold: 100,
        inventory: [],
        skills: [],
        description: formData.description,
        imageUrl: formData.imageUrl,
        isMaster: true,
      };

      await createMasterCharacter(user.uid, characterData);
      router.push('/master');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar personagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 0 }) }}>
          {(style) => (
            <div style={{ opacity: style.opacity }} className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-4">
                Novo Personagem
              </h1>
              <p className="text-gray-400">Crie um novo personagem para controlar sua jornada</p>
            </div>
          )}
        </Motion>

        {/* Form */}
        <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 100 }), y: spring(0, { delay: 100 }) }}>
          {(style) => (
            <form
              onSubmit={handleSubmit}
              style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
              className="space-y-6"
            >
              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-300">{error}</div>
              )}

              {/* Username */}
              <div>
                <label className="block text-gray-300 font-bold mb-3">Nome do Personagem</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Digite o nome do seu personagem"
                  className="w-full bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-lg px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  required
                />
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-gray-300 font-bold mb-3">Escolha Sua Classe</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {CLASSES.map((cls) => (
                    <button
                      key={cls.name}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, class: cls.name }))}
                      className={`p-6 rounded-xl border-2 transition transform hover:scale-105 ${
                        formData.class === cls.name
                          ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500 shadow-lg shadow-orange-500/20'
                          : 'bg-gradient-to-br from-slate-700 to-slate-800 border-orange-500/30 hover:border-orange-500'
                      }`}
                    >
                      <div className="text-4xl mb-2">{cls.emoji}</div>
                      <div className="font-bold text-white mb-2">{cls.name}</div>
                      <div className="text-sm text-gray-400">{cls.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Image URL */}
              <div>
                <label className="block text-gray-300 font-bold mb-3">URL da Imagem do Personagem</label>
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={handleImageChange}
                  placeholder="Cole aqui a URL da imagem"
                  className="w-full bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-lg px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition mb-3"
                />
                {imagePreview && (
                  <div className="bg-slate-700 border border-orange-500/30 rounded-lg p-4">
                    <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-300 font-bold mb-3">Descrição do Personagem</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="Descreva seu personagem..."
                  rows={4}
                  className="w-full bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-lg px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold transition border border-slate-600"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition"
                >
                  {loading ? 'Criando...' : 'Criar Personagem'}
                </button>
              </div>
            </form>
          )}
        </Motion>
      </div>
    </div>
  );
}
