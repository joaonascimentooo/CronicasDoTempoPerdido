'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getCharacter, updateCharacter, deleteCharacter, killCreature } from '@/lib/characterService';
import { Character } from '@/lib/types';

export default function CharacterDetail() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [killsAdded, setKillsAdded] = useState(0);
  const [xpAdded, setXpAdded] = useState(0);
  const [goldAdded, setGoldAdded] = useState(0);

  const router = useRouter();
  const params = useParams();
  const characterId = params.id as string;

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const loadCharacter = async () => {
      if (!characterId) return;
      try {
        const char = await getCharacter(characterId);
        if (char) {
          setCharacter(char);
        } else {
          setError('Personagem não encontrado');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar personagem');
      } finally {
        setLoading(false);
      }
    };

    loadCharacter();
  }, [characterId]);

  const handleKillCreature = async () => {
    if (!character || killsAdded <= 0) return;
    try {
      await killCreature(character.id!, killsAdded, xpAdded, goldAdded);
      const updated = await getCharacter(character.id!);
      if (updated) {
        setCharacter(updated);
      }
      setKillsAdded(0);
      setXpAdded(0);
      setGoldAdded(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar morte');
    }
  };

  const handleDeleteCharacter = async () => {
    if (!character || !confirm('Tem certeza que deseja deletar este personagem?')) return;
    try {
      await deleteCharacter(character.id!);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar personagem');
    }
  };

  if (loading) {
    return <div className="text-center text-2xl">Carregando...</div>;
  }

  if (error || !character) {
    return <div className="text-center text-red-500 text-2xl">{error || 'Personagem não encontrado'}</div>;
  }

  const nextLevelXp = (character.level * 100) - (character.experience % 100);
  const xpProgress = (character.experience % 100) / 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{character.name}</h1>
            <p className="text-gray-400 text-lg">{character.class}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-orange-500">Nível {character.level}</div>
            <div className="text-gray-400">XP: {character.experience}</div>
          </div>
        </div>


        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Experiência</span>
            <span className="text-sm text-gray-400">{nextLevelXp} XP para o próximo nível</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-orange-500 h-3 rounded-full transition-all"
              style={{ width: `${xpProgress * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold transition"
          >
            {editMode ? 'Cancelar' : 'Editar'}
          </button>
          <button
            onClick={handleDeleteCharacter}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-bold transition"
          >
            Deletar
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded font-bold transition"
          >
            Voltar
          </button>
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Saúde</div>
          <div className="text-2xl font-bold text-green-500">
            {character.health}/{character.maxHealth}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Mana</div>
          <div className="text-2xl font-bold text-blue-500">
            {character.mana}/{character.maxMana}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Ouro</div>
          <div className="text-2xl font-bold text-yellow-500">{character.gold}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Mortes</div>
          <div className="text-2xl font-bold text-red-500">{character.deaths}</div>
        </div>
      </div>


      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Atributos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <div className="text-gray-400 text-sm mb-1">Força</div>
            <div className="text-3xl font-bold text-red-500">{character.strength}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Destreza</div>
            <div className="text-3xl font-bold text-green-500">{character.dexterity}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Constituição</div>
            <div className="text-3xl font-bold text-yellow-500">{character.constitution}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Inteligência</div>
            <div className="text-3xl font-bold text-blue-500">{character.intelligence}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Sabedoria</div>
            <div className="text-3xl font-bold text-purple-500">{character.wisdom}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Carisma</div>
            <div className="text-3xl font-bold text-pink-500">{character.charisma}</div>
          </div>
        </div>
      </div>


      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Estatísticas de Combate</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-gray-400 text-sm mb-1">Criaturas Mortas</div>
            <div className="text-4xl font-bold text-orange-500">{character.creatureKills}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Taxa de Vitória</div>
            <div className="text-4xl font-bold text-green-500">
              {character.creatureKills + character.deaths > 0
                ? (
                    (character.creatureKills /
                      (character.creatureKills + character.deaths)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>
        </div>
      </div>


      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Registrar Morte de Criatura</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quantas criaturas?</label>
              <input
                type="number"
                value={killsAdded}
                onChange={(e) => setKillsAdded(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Experiência ganha</label>
              <input
                type="number"
                value={xpAdded}
                onChange={(e) => setXpAdded(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ouro obtido</label>
              <input
                type="number"
                value={goldAdded}
                onChange={(e) => setGoldAdded(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
          <button
            onClick={handleKillCreature}
            disabled={killsAdded <= 0}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-6 py-3 rounded font-bold transition"
          >
            Registrar {killsAdded > 0 ? `${killsAdded} Morte${killsAdded !== 1 ? 's' : ''}` : 'Morte'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
