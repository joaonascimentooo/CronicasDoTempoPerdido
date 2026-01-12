'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getUserCharacters } from '@/lib/characterService';
import { Character } from '@/lib/types';
import Link from 'next/link';

export default function CharactersList() {
  const [user, setUser] = useState<User | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
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
        const chars = await getUserCharacters(currentUser.uid);
        setCharacters(chars);
      } catch (error) {
        console.error('Erro ao carregar personagens:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="text-center text-2xl">Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Meus Personagens</h1>
          <p className="text-gray-400 mt-2">Você tem {characters.length} personagem(ns)</p>
        </div>
        <Link
          href="/characters/new"
          className="bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-lg font-bold transition"
        >
          + Novo Personagem
        </Link>
      </div>

      {characters.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-gray-400 mb-6">Você ainda não tem nenhum personagem</p>
          <Link
            href="/characters/new"
            className="inline-block bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-lg font-bold transition"
          >
            Criar Primeiro Personagem
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Link
              key={character.id}
              href={`/characters/${character.id}`}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-orange-500 transition group"
            >
              {character.imageUrl && (
                <div className="w-full h-40 bg-gray-700 overflow-hidden">
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{character.name}</h3>
                    <p className="text-gray-400">{character.class}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">Nível {character.level}</div>
                  </div>
                </div>


                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Experiência</span>
                    <span className="text-xs text-gray-400">{character.experience} XP</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${(character.experience % 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Criaturas</span>
                    <div className="font-bold text-orange-500">{character.creatureKills}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Mortes</span>
                    <div className="font-bold text-red-500">{character.deaths}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Ouro</span>
                    <div className="font-bold text-yellow-500">{character.gold}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Saúde</span>
                    <div className="font-bold">
                      {character.health}/{character.maxHealth}
                    </div>
                  </div>
                </div>

                {character.faction && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <span className="text-xs text-gray-400">Facção</span>
                    <div className="font-bold text-sm">{character.faction}</div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
