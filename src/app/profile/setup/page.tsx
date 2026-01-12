'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { createUserProfile, getUserProfile } from '@/lib/profileService';
import { UserProfile } from '@/lib/types';

const CLASSES = ['Guerreiro', 'Mago', 'Arqueiro', 'Clérigo', 'Ladrão'];

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

      // Verificar se já tem perfil
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
        mana: formData.class === 'Mago' || formData.class === 'Clérigo' ? 100 : undefined,
        maxMana: formData.class === 'Mago' || formData.class === 'Clérigo' ? 100 : undefined,
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
      alert('Erro ao criar perfil. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-2xl">Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Criar Meu Perfil</h1>
        <p className="text-gray-400">Configure seu personagem para começar sua jornada em V.I.G.I.A.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-8 space-y-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-bold mb-2">
            Nome de Usuário *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Como você quer ser chamado?"
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        {/* Class */}
        <div>
          <label htmlFor="class" className="block text-sm font-bold mb-2">
            Classe *
          </label>
          <select
            id="class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-orange-500"
          >
            {CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
          <p className="text-gray-400 text-sm mt-2">
            {formData.class === 'Guerreiro' && 'Especialista em combate corpo a corpo, com muita força e resistência.'}
            {formData.class === 'Mago' && 'Manipulador de magia com inteligência elevada e controle de mana.'}
            {formData.class === 'Arqueiro' && 'Atirador de precisão com destreza excepcional.'}
            {formData.class === 'Clérigo' && 'Curador e guerreiro espiritual com sabedoria e mana.'}
            {formData.class === 'Ladrão' && 'Combatente rápido e silencioso com muita destreza.'}
          </p>
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-bold mb-2">
            URL do Avatar (Opcional)
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://exemplo.com/avatar.png"
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
          />
          {formData.imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Preview do avatar:</p>
              <img
                src={formData.imageUrl}
                alt="Avatar preview"
                className="max-w-xs max-h-64 rounded border border-gray-600"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-bold mb-2">
            Descrição (Opcional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Conte um pouco sobre seu personagem..."
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded font-bold transition"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 px-6 py-2 rounded font-bold transition"
          >
            {submitting ? 'Criando...' : 'Criar Perfil'}
          </button>
        </div>
      </form>

      {/* Class Descriptions */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Sobre as Classes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <strong className="text-orange-500">Guerreiro</strong>
            <p className="text-gray-400">Força bruta e resistência</p>
          </div>
          <div>
            <strong className="text-blue-500">Mago</strong>
            <p className="text-gray-400">Poder mágico e controle</p>
          </div>
          <div>
            <strong className="text-green-500">Arqueiro</strong>
            <p className="text-gray-400">Velocidade e precisão</p>
          </div>
          <div>
            <strong className="text-purple-500">Clérigo</strong>
            <p className="text-gray-400">Cura e proteção divina</p>
          </div>
          <div>
            <strong className="text-red-500">Ladrão</strong>
            <p className="text-gray-400">Rapidez e astúcia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
