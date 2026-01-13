'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGlobalRanking, getClassRanking, getTopProfiles, getDeathsRanking } from '@/lib/profileService';
import { RankingEntry, UserProfile } from '@/lib/types';
import { Motion, spring } from 'react-motion';

const CLASSES = ['Ocultista', 'Especialista', 'Combatente'];

export default function Ranking() {
  const router = useRouter();
  const [rankingType, setRankingType] = useState<'kills' | 'deaths' | 'level' | 'class'>('kills');
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
        } else if (rankingType === 'deaths') {
          data = await getDeathsRanking(50);
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
      return <div className="text-center text-gray-400 py-12">Carregando...</div>;
    }

    if (ranking.length === 0) {
      return <div className="text-center text-gray-400 py-12">Nenhum jogador encontrado</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-orange-500/20 bg-slate-800/50">
              <th className="px-6 py-4 text-left font-bold text-orange-400">#</th>
              <th className="px-6 py-4 text-left font-bold text-orange-400">Jogador</th>
              <th className="px-6 py-4 text-left font-bold text-orange-400">Classe</th>
              <th className="px-6 py-4 text-center font-bold text-orange-400">Nível</th>
              <th className="px-6 py-4 text-center font-bold text-orange-400">Criaturas Mortas</th>
              {rankingType === 'kills' && (
                <>
                  <th className="px-6 py-4 text-center font-bold text-orange-400">Seres Mortos</th>
                </>
              )}
              {rankingType === 'deaths' && (
                <>
                  <th className="px-6 py-4 text-center font-bold text-orange-400">Seres Mortos</th>
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
                  className="border-b border-orange-500/10 hover:bg-orange-500/5 transition"
                >
                  <td className="px-6 py-4 font-bold text-orange-400 text-lg">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    <button
                      onClick={() => router.push(`/profile/view/${isRankingEntry ? entry.profileId : entry.id}`)}
                      className="text-white hover:text-orange-400 transition cursor-pointer"
                    >
                      {isRankingEntry ? entry.username : entry.username}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {isRankingEntry ? entry.userClass : entry.class}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300">
                    {entry.level}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-green-400">
                    {entry.creatureKills}
                  </td>
                  {rankingType === 'kills' && isRankingEntry && (
                    <>
                      <td className="px-6 py-4 text-center text-red-400 font-bold">{entry.deaths}</td>
                    </>
                  )}
                  {rankingType === 'deaths' && isRankingEntry && (
                    <>
                      <td className="px-6 py-4 text-center text-red-400 font-bold">{entry.deaths}</td>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 0 }) }}>
          {(style) => (
            <div style={{ opacity: style.opacity }} className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-4">
                Ranking Global
              </h1>
              <p className="text-gray-400 text-lg">Veja como você se compara com outros agentes</p>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto mt-6"></div>
            </div>
          )}
        </Motion>

        {/* Filter Buttons */}
        <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 100 }) }}>
          {(style) => (
            <div style={{ opacity: style.opacity }} className="flex flex-wrap gap-3 mb-8 justify-center">
              <button
                onClick={() => setRankingType('kills')}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  rankingType === 'kills'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600'
                }`}
              >
                Por Criaturas Mortas
              </button>
              <button
                onClick={() => setRankingType('deaths')}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  rankingType === 'deaths'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600'
                }`}
              >
                Por Seres Mortos
              </button>
              <button
                onClick={() => setRankingType('level')}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  rankingType === 'level'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600'
                }`}
              >
                Por Nível
              </button>
              <button
                onClick={() => setRankingType('class')}
                className={`px-6 py-3 rounded-lg font-bold transition ${
                  rankingType === 'class'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600'
                }`}
              >
                Por Classe
              </button>
            </div>
          )}
        </Motion>

        {/* Class Selection */}
        {rankingType === 'class' && (
          <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 150 }) }}>
            {(style) => (
              <div style={{ opacity: style.opacity }} className="flex flex-wrap gap-3 mb-8 justify-center">
                {CLASSES.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-6 py-2 rounded-lg transition font-bold ${
                      selectedClass === cls
                        ? 'bg-orange-500 text-white border border-orange-400'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            )}
          </Motion>
        )}

        {/* Ranking Table */}
        <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 200 }), y: spring(0, { delay: 200 }) }}>
          {(style) => (
            <div style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }} className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl overflow-hidden shadow-2xl">
              {renderRanking()}
            </div>
          )}
        </Motion>
      </div>
    </div>
  );
}
