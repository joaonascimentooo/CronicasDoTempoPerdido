'use client';

import { useEffect, useState } from 'react';
import { getGlobalRanking, getClassRanking, getTopProfiles } from '@/lib/profileService';
import { RankingEntry, UserProfile } from '@/lib/types';

const CLASSES = ['Ocultista', 'Especialista', 'Combatente'];

export default function Ranking() {
  const [rankingType, setRankingType] = useState<'kills' | 'level' | 'class'>('kills');
  const [selectedClass, setSelectedClass] = useState('Ocultista');
  const [ranking, setRanking] = useState<(RankingEntry | UserProfile)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      setLoading(true);
      try {
        let data;
        if (rankingType === 'kills') {
          data = await getGlobalRanking(50);
        } else if (rankingType === 'level') {
          data = await getTopProfiles(50);
        } else {
          data = await getClassRanking(selectedClass, 50);
        }
        setRanking(data);
      } catch (error) {
        console.error('Erro ao carregar ranking:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, [rankingType, selectedClass]);

  const renderRanking = () => {
    if (loading) {
      return <div className="text-center text-gray-400">Carregando...</div>;
    }

    if (ranking.length === 0) {
      return <div className="text-center text-gray-400">Nenhum jogador encontrado</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Jogador</th>
              <th className="px-4 py-3 text-left">Classe</th>
              <th className="px-4 py-3 text-center">Nível</th>
              <th className="px-4 py-3 text-center">Criaturas Mortas</th>
              {rankingType === 'kills' && (
                <>
                  <th className="px-4 py-3 text-center">Seres Mortos</th>
                  <th className="px-4 py-3 text-center">Ouro</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {ranking.map((entry, index) => {
              const isRankingEntry = 'username' in entry && 'rank' in entry;
              return (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-gray-800 transition"
                >
                  <td className="px-4 py-3 font-bold text-orange-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-bold">{isRankingEntry ? entry.username : entry.username}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {isRankingEntry ? entry.userClass : entry.class}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {entry.level}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-orange-500">
                    {entry.creatureKills}
                  </td>
                  {rankingType === 'kills' && isRankingEntry && (
                    <>
                      <td className="px-4 py-3 text-center text-red-500">{entry.deaths}</td>
                      <td className="px-4 py-3 text-center text-yellow-500">{entry.gold}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Ranking Global</h1>
        <p className="text-gray-400">Veja como você se compara com outros jogadores</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setRankingType('kills')}
          className={`px-6 py-2 rounded font-bold transition ${
            rankingType === 'kills'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Por Criaturas Mortas
        </button>
        <button
          onClick={() => setRankingType('level')}
          className={`px-6 py-2 rounded font-bold transition ${
            rankingType === 'level'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Por Nível
        </button>
        <button
          onClick={() => setRankingType('class')}
          className={`px-6 py-2 rounded font-bold transition ${
            rankingType === 'class'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Por Classe
        </button>
      </div>

      {rankingType === 'class' && (
        <div className="flex flex-wrap gap-2">
          {CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-2 rounded transition ${
                selectedClass === cls
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        {renderRanking()}
      </div>
    </div>
  );
}
