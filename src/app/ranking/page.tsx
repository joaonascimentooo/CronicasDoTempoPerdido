'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGlobalRanking, getClassRanking, getTopProfiles, getDeathsRanking, getAllProfiles } from '@/lib/profileService';
import { RankingEntry, UserProfile } from '@/lib/types';
import { Motion, spring } from 'react-motion';
import { onAuthChange } from '@/lib/authService';
import { User } from 'firebase/auth';

const CLASSES = ['Ocultista', 'Especialista', 'Combatente'];

export default function Ranking() {
  const router = useRouter();
  const [rankingType, setRankingType] = useState<'kills' | 'deaths' | 'level' | 'class'>('level');
  const [selectedClass, setSelectedClass] = useState('Ocultista');
  const [ranking, setRanking] = useState<(RankingEntry | UserProfile)[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadRanking = async () => {
      setLoading(true);
      try {
        let data;
        if (rankingType === 'kills') {
          data = await getGlobalRanking(10);
        } else if (rankingType === 'deaths') {
          data = await getDeathsRanking(10);
        } else if (rankingType === 'level') {
          data = await getTopProfiles(10);
        } else {
          data = await getClassRanking(selectedClass, 10);
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

  // Buscar personagem por nome
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const allProfiles = await getAllProfiles();
      const filtered = allProfiles.filter(profile =>
        profile.username.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Erro ao buscar:', error);
    }
  };

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
              {rankingType !== 'kills' && <th className="px-6 py-4 text-left font-bold text-orange-400">#</th>}
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
                  {rankingType !== 'kills' && (
                    <td className="px-6 py-4 font-bold text-orange-400 text-lg">
                      {index + 1}
                    </td>
                  )}
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

        {/* Search Bar */}
        <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 50 }) }}>
          {(style) => (
            <div style={{ opacity: style.opacity }} className="mb-8 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Procure seu agente aqui..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-orange-500/30 focus:border-orange-500 focus:outline-none transition"
                />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-orange-500/30 rounded-lg overflow-hidden z-10">
                    {searchResults.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setSearchQuery('');
                          setShowSearchResults(false);
                          router.push(`/profile/view/${profile.id}`);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-orange-500/10 transition flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white font-bold">{profile.username}</p>
                          <p className="text-gray-400 text-sm">{profile.class}</p>
                        </div>
                        <span className="text-gray-400 text-sm">Nível {profile.level}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Motion>

        {/* Info Message for Kills */}
        {rankingType === 'kills' && (
          <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 120 }) }}>
            {(style) => (
              <div style={{ opacity: style.opacity }} className="mb-8 bg-orange-900/20 border border-orange-600/30 rounded-lg p-4 text-center">
                <p className="text-gray-300">
                  <span className="text-orange-400 font-bold">Apenas o Top 10</span> é revelado para manter o mistério...
                  <br/>
                  <span className="text-gray-400 text-sm">Use a busca acima para encontrar seu agente</span>
                </p>
              </div>
            )}
          </Motion>
        )}

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
            </div>
          )}
        </Motion>

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
