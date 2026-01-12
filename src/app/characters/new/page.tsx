'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { createCharacter } from '@/lib/characterService';
import { Character } from '@/lib/types';

const CLASSES = ['Guerreiro', 'Mago', 'Arqueiro', 'Clérigo', 'Ladrão'];

export default function NewCharacter() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    class: 'Guerreiro',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (!currentUser) {
        router.push('/login');
      }
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('stat') ? parseInt(value) : value,
    }));
  };

  const calculateStats = () => {
    const baseHealth = 20 + (formData.constitution - 10) * 2;
    const baseMana = 10 + (formData.intelligence - 10) * 2;
    return { baseHealth, baseMana };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Você precisa estar logado');
      return;
    }

    if (!formData.name.trim()) {
      setError('Nome do personagem é obrigatório');
      return;
    }

    setLoading(true);

    try {
      const { baseHealth, baseMana } = calculateStats();

      const newChar: Omit<Character, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        class: formData.class,
        level: 1,
        experience: 0,
        health: baseHealth,
        maxHealth: baseHealth,
        mana: baseMana,
        maxMana: baseMana,
        strength: formData.strength,
        dexterity: formData.dexterity,
        constitution: formData.constitution,
        intelligence: formData.intelligence,
        wisdom: formData.wisdom,
        charisma: formData.charisma,
        creatureKills: 0,
        deaths: 0,
        gold: 0,
        inventory: [],
        skills: [],
        userId: user.uid,
      };

      await createCharacter(newChar);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar personagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-orange-500">Criar Novo Personagem</h1>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium mb-2">Nome do Personagem</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
              placeholder="Digite o nome do seu personagem"
            />
          </div>


          <div>
            <label className="block text-sm font-medium mb-2">Classe</label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
            >
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>


          <div>
            <h3 className="text-lg font-bold mb-4">Atributos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(
                (stat) => (
                  <div key={stat}>
                    <label className="block text-sm font-medium mb-1 capitalize">
                      {stat === 'strength' && 'Força'}
                      {stat === 'dexterity' && 'Destreza'}
                      {stat === 'constitution' && 'Constituição'}
                      {stat === 'intelligence' && 'Inteligência'}
                      {stat === 'wisdom' && 'Sabedoria'}
                      {stat === 'charisma' && 'Carisma'}
                    </label>
                    <input
                      type="number"
                      name={stat}
                      value={formData[stat as keyof typeof formData]}
                      onChange={handleChange}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )
              )}
            </div>
          </div>


          <div className="bg-gray-900 rounded p-4 border border-gray-600">
            <h3 className="font-bold mb-2">Prévia de Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Saúde Máxima:</span>
                <div className="font-bold text-green-500">{calculateStats().baseHealth} HP</div>
              </div>
              <div>
                <span className="text-gray-400">Mana Máxima:</span>
                <div className="font-bold text-blue-500">{calculateStats().baseMana} MP</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-6 py-3 rounded font-bold transition"
            >
              {loading ? 'Criando...' : 'Criar Personagem'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded font-bold transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
