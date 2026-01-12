'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange, getCurrentUser } from '@/lib/authService';
import { getUserCharacters } from '@/lib/characterService';
import { Character } from '@/lib/types';
import Link from 'next/link';

export default function Dashboard() {
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
        const userChars = await getUserCharacters(currentUser.uid);
        setCharacters(userChars);
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

  if (!user) {
    return null;
  }

  const totalKills = characters.reduce((sum, char) => sum + char.creatureKills, 0);
  const totalLevel = characters.reduce((sum, char) => sum + char.level, 0);
  const totalGold = characters.reduce((sum, char) => sum + char.gold, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Bem-vindo, {user.displayName || user.email}</h1>
        <p className="text-gray-400">Aqui você pode gerenciar todos os seus personagens</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Total de Personagens</div>
          <div className="text-3xl font-bold text-orange-500">{characters.length}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Total de Criaturas Mortas</div>
          <div className="text-3xl font-bold text-orange-500">{totalKills}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Nível Médio</div>
          <div className="text-3xl font-bold text-orange-500">
            {characters.length > 0 ? Math.floor(totalLevel / characters.length) : 0}
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Ouro Total</div>
          <div className="text-3xl font-bold text-orange-500">{totalGold}</div>
        </div>
      </div>


      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Meus Personagens</h2>
          <Link
            href="/characters/new"
            className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded font-bold transition"
          >
            + Novo Personagem
          </Link>
        </div>

        {characters.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-400 mb-4">Você ainda não tem nenhum personagem</p>
            <Link
              href="/characters/new"
              className="inline-block bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded font-bold transition"
            >
              Criar Primeiro Personagem
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map((char) => (
              <Link
                key={char.id}
                href={`/characters/${char.id}`}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-orange-500 transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{char.name}</h3>
                    <p className="text-gray-400">{char.class}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">Nível {char.level}</div>
                    <div className="text-gray-400 text-sm">XP: {char.experience}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-400 text-sm">Criaturas Mortas</span>
                    <div className="text-xl font-bold text-orange-500">{char.creatureKills}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Mortes</span>
                    <div className="text-xl font-bold text-red-500">{char.deaths}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Ouro</span>
                    <div className="text-xl font-bold text-yellow-500">{char.gold}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Saúde</span>
                    <div className="text-xl font-bold">
                      {char.health}/{char.maxHealth}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${(char.experience % 100)}%`,
                    }}
                  ></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
