'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getMasterCharacters, isMasterEmail, masterDeleteProfile, masterUpdateProfile, getAllProfiles } from '@/lib/profileService';
import { getAllTeams, joinTeam, leaveTeam } from '@/lib/teamService';
import { UserProfile, Team } from '@/lib/types';
import Link from 'next/link';
import { Motion, spring } from 'react-motion';

export default function MasterPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [allCharacters, setAllCharacters] = useState<UserProfile[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<UserProfile[]>([]);
  const [myCharacters, setMyCharacters] = useState<UserProfile[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<UserProfile | null>(null);
  const [characterTeam, setCharacterTeam] = useState<Team | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'my'>('all');

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
      loadCharacters(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadCharacters = async (userId: string) => {
    try {
      // Buscar todos os personagens
      const allChars = await getAllProfiles();
      setAllCharacters(allChars);

      // Buscar apenas os personagens do mestre
      const masterChars = await getMasterCharacters(userId);
      setMyCharacters(masterChars);

      // Buscar todas as equipes
      try {
        const teams = await getAllTeams();
        setAllTeams(teams);
        console.log('Equipes carregadas:', teams);
      } catch (teamError) {
        console.error('Erro ao carregar equipes:', teamError);
        setAllTeams([]);
      }

      // Filtro inicial mostra tudo
      setFilteredCharacters(allChars);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar filtro quando search ou tipo mudar
  useEffect(() => {
    let filtered = filterType === 'all' ? allCharacters : myCharacters;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (char) =>
          char.username.toLowerCase().includes(query) ||
          char.class.toLowerCase().includes(query) ||
          (char.email?.toLowerCase().includes(query) || false)
      );
    }

    setFilteredCharacters(filtered);
  }, [searchQuery, filterType, allCharacters, myCharacters]);

  // Buscar equipe do personagem quando selecionado
  useEffect(() => {
    if (selectedCharacter) {
      const team = allTeams.find(t => t.members.some(m => m.userId === selectedCharacter.id));
      setCharacterTeam(team || null);
    }
  }, [selectedCharacter, allTeams]);

  const handleDeleteCharacter = async (characterId: string) => {
    if (confirm('Tem certeza que deseja deletar este personagem?')) {
      try {
        await masterDeleteProfile(characterId);
        setAllCharacters(allCharacters.filter((c) => c.id !== characterId));
        setMyCharacters(myCharacters.filter((c) => c.id !== characterId));
        setSelectedCharacter(null);
      } catch (error) {
        console.error('Erro ao deletar personagem:', error);
        alert('Erro ao deletar personagem');
      }
    }
  };

  const handleChangeTeam = async (newTeamId: string) => {
    if (!selectedCharacter) return;

    try {
      // Se há uma equipe anterior, remover do personagem
      if (characterTeam) {
        await leaveTeam(characterTeam.id, selectedCharacter.id);
      }

      // Se selecionou uma nova equipe, adicionar
      if (newTeamId) {
        await joinTeam(newTeamId, selectedCharacter.id, selectedCharacter.username);
      }

      // Recarregar dados
      if (user) {
        await loadCharacters(user.uid);
      }
    } catch (error: any) {
      console.error('Erro ao mudar equipe:', error);
      alert('Erro ao mudar equipe: ' + error.message);
    }
  };

  const handleReloadTeams = async () => {
    try {
      const teams = await getAllTeams();
      setAllTeams(teams);
      console.log('Equipes recarregadas:', teams);
      alert('Equipes recarregadas com sucesso!');
    } catch (error) {
      console.error('Erro ao recarregar equipes:', error);
      alert('Erro ao recarregar equipes');
    }
  };

  const handleEditCharacter = (character: UserProfile) => {
    setSelectedCharacter(character);
    setEditData(character);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }

  if (!isMasterEmail(user?.email || '')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full py-6 sm:py-12 px-0 sm:px-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 0 }) }}>
            {(style) => (
              <div style={{ opacity: style.opacity }} className="text-center mb-8 sm:mb-12 px-2">
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-2 sm:mb-4">
                  Painel do Mestre
                </h1>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg">Gerencie seus personagens e controle o jogo</p>
              </div>
            )}
          </Motion>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
            {/* Character List */}
            <div className="lg:col-span-1">
              <Motion defaultStyle={{ opacity: 0, x: -20 }} style={{ opacity: spring(1, { delay: 100 }), x: spring(0, { delay: 100 }) }}>
                {(style) => (
                  <div style={{ opacity: style.opacity, transform: `translateX(${style.x}px)` }}>
<div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-orange-400 mb-3 sm:mb-4">Personagens</h2>

                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Buscar personagem..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-600 text-white px-3 sm:px-4 py-2 rounded-lg mb-3 sm:mb-4 text-sm sm:text-base focus:outline-none focus:border-orange-500 border border-slate-600"
                      />

                      {/* Filter Tabs */}
                      <div className="flex gap-2 mb-3 sm:mb-4">
                        <button
                          onClick={() => setFilterType('all')}
                          className={`flex-1 py-2 px-2 sm:px-3 rounded-lg transition text-xs sm:text-sm font-bold ${
                            filterType === 'all'
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                          }`}
                        >
                          Todos
                        </button>
                        <button
                          onClick={() => setFilterType('my')}
                          className={`flex-1 py-2 px-2 sm:px-3 rounded-lg transition text-xs sm:text-sm font-bold ${
                            filterType === 'my'
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                          }`}
                        >
                          Meus
                        </button>
                      </div>

                      <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                        {filteredCharacters.length > 0 ? (
                          filteredCharacters.map((char) => (
                            <button
                              key={char.id}
                              onClick={() => setSelectedCharacter(char)}
                              className={`w-full text-left p-3 sm:p-4 rounded-lg transition border ${
                                selectedCharacter?.id === char.id
                                  ? char.isDeceased
                                    ? 'bg-red-600/40 border-red-500'
                                    : 'bg-green-600/40 border-green-500'
                                  : char.isDeceased
                                  ? 'bg-red-900/30 border-red-700/50 hover:bg-red-900/50'
                                  : 'bg-green-900/30 border-green-700/50 hover:bg-green-900/50'
                              }`}
                            >
                              <div className="font-bold text-white">{char.username}</div>
                              <div className="text-xs text-gray-500 mb-1">{char.email}</div>
                              <div className="text-sm text-gray-400">{char.class} • Nível {char.level}</div>
                              <div className={`text-xs font-bold mt-2 ${char.isDeceased ? 'text-red-400' : 'text-green-400'}`}>
                                {char.isDeceased ? '💀 Morto' : '❤️ Vivo'}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="text-gray-400 text-center py-4">Nenhum personagem encontrado</div>
                        )}
                      </div>

                      <Link
                        href="/master/new"
                        className="w-full mt-6 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg transition text-center block"
                      >
                        + Novo Personagem
                      </Link>
                    </div>
                  </div>
                )}
              </Motion>
            </div>

            {/* Character Details */}
            <div className="lg:col-span-2">
              {selectedCharacter ? (
                <Motion defaultStyle={{ opacity: 0, x: 20 }} style={{ opacity: spring(1, { delay: 200 }), x: spring(0, { delay: 200 }) }}>
                  {(style) => (
                    <div style={{ opacity: style.opacity, transform: `translateX(${style.x}px)` }}>
                      <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-3 sm:gap-0">
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-orange-400 mb-2">{selectedCharacter.username}</h2>
                            <p className="text-gray-400 text-sm sm:text-base">{selectedCharacter.class}</p>
                          </div>
                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleDeleteCharacter(selectedCharacter.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition flex-1 sm:flex-none text-sm sm:text-base"
                            >
                              Deletar
                            </button>
                            <div className={`px-3 py-1 rounded-lg font-bold text-xs sm:text-sm flex-1 sm:flex-none text-center sm:text-left ${
                              selectedCharacter.isDeceased
                                ? 'bg-red-900/50 text-red-400 border border-red-600/50'
                                : 'bg-green-900/50 text-green-400 border border-green-600/50'
                            }`}>
                              {selectedCharacter.isDeceased ? '💀 Morto' : '❤️ Vivo'}
                            </div>
                          </div>
                        </div>

                        {/* Seletor de Equipe */}
                        <div className="bg-slate-600/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 sm:gap-0">
                            <label className="block text-gray-300 text-sm font-semibold">Equipe</label>
                            <button
                              onClick={handleReloadTeams}
                              className="text-orange-400 hover:text-orange-300 text-xs font-semibold w-full sm:w-auto py-1 px-2 rounded hover:bg-orange-400/10 transition"
                            >
                              🔄 Recarregar
                            </button>
                          </div>
                          
                          {allTeams.length === 0 ? (
                            <div className="bg-slate-700 border border-orange-500/20 rounded-lg p-2 sm:p-3 text-gray-400 text-xs sm:text-sm">
                              Nenhuma equipe disponível. Clique em "Recarregar" para tentar novamente.
                            </div>
                          ) : (
                            <select
                              value={characterTeam?.id || ''}
                              onChange={(e) => handleChangeTeam(e.target.value)}
                              className="w-full bg-slate-700 border border-orange-500/30 text-white px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                            >
                              <option value="">Sem Equipe</option>
                              {allTeams.map((team) => (
                                <option key={team.id} value={team.id}>
                                  {team.name} ({team.members.length}/{team.maxMembers})
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {characterTeam && (
                            <div className="mt-3 text-xs sm:text-sm text-gray-300">
                              <p><span className="font-semibold">Líder:</span> {characterTeam.leaderName}</p>
                              <p><span className="font-semibold">Membros:</span> {characterTeam.members.length}/{characterTeam.maxMembers}</p>
                            </div>
                          )}
                        </div>

                      {selectedCharacter.isDeceased && selectedCharacter.causeOfDeath && (
                        <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                          <p className="text-red-400 font-bold mb-2 text-sm sm:text-base">Causa da Morte:</p>
                          <p className="text-gray-200 text-sm sm:text-base">{selectedCharacter.causeOfDeath}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                          <div className="bg-slate-600/50 p-2 sm:p-4 rounded-lg">
                            <p className="text-gray-400 text-xs sm:text-sm mb-1">Nível</p>
                            <p className="text-2xl sm:text-3xl font-bold text-orange-400">{selectedCharacter.level}</p>
                          </div>
                          <div className="bg-slate-600/50 p-2 sm:p-4 rounded-lg">
                            <p className="text-gray-400 text-xs sm:text-sm mb-1">XP</p>
                            <p className="text-2xl sm:text-3xl font-bold text-blue-400">{selectedCharacter.experience}</p>
                          </div>
                          <div className="bg-slate-600/50 p-2 sm:p-4 rounded-lg">
                            <p className="text-gray-400 text-xs sm:text-sm mb-1">Criaturas</p>
                            <p className="text-2xl sm:text-3xl font-bold text-green-400">{selectedCharacter.creatureKills}</p>
                          </div>
                          <div className="bg-slate-600/50 p-2 sm:p-4 rounded-lg">
                            <p className="text-gray-400 text-xs sm:text-sm mb-1">Mortes</p>
                            <p className="text-2xl sm:text-3xl font-bold text-red-400">{selectedCharacter.deaths}</p>
                          </div>
                          <div className="bg-slate-600/50 p-2 sm:p-4 rounded-lg">
                            <p className="text-gray-400 text-xs sm:text-sm mb-1">Ouro</p>
                            <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{selectedCharacter.gold}</p>
                          </div>
                          <div className="bg-slate-600/50 p-2 sm:p-4 rounded-lg">
                            <p className="text-gray-400 text-xs sm:text-sm mb-1">Saúde</p>
                            <p className="text-2xl sm:text-3xl font-bold text-pink-400">{selectedCharacter.health}/{selectedCharacter.maxHealth}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleEditCharacter(selectedCharacter)}
                          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
                        >
                          Editar Personagem
                        </button>
                      </div>
                    </div>
                  )}
                </Motion>
              ) : (
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-4 sm:p-6 lg:p-8 text-center">
                  <p className="text-gray-400 text-sm sm:text-lg">Selecione um personagem para editar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedCharacter && (
        <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1) }}>
          {(style) => (
            <div style={{ opacity: style.opacity }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6">
              <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20 rounded-2xl max-w-md w-full max-h-screen sm:max-h-96 overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600/30 to-orange-500/20 border-b border-orange-500/30 px-4 sm:px-8 py-4 sm:py-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300 truncate">
                    Editar {selectedCharacter.username}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">Atualize os dados do personagem</p>
                </div>

                <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-orange-300 text-xs font-bold mb-1 uppercase tracking-wide">Nível</label>
                      <input
                        type="number"
                        value={editData.level ?? selectedCharacter.level}
                        onChange={(e) => setEditData({ ...editData, level: parseInt(e.target.value) })}
                        className="w-full bg-slate-700/50 border border-orange-500/30 text-white px-2 sm:px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-orange-300 text-xs font-bold mb-1 uppercase tracking-wide">XP</label>
                      <input
                        type="number"
                        value={editData.experience ?? selectedCharacter.experience}
                        onChange={(e) => setEditData({ ...editData, experience: parseInt(e.target.value) })}
                        className="w-full bg-slate-700/50 border border-orange-500/30 text-white px-2 sm:px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-green-300 text-xs font-bold mb-1 uppercase tracking-wide">Criaturas</label>
                      <input
                        type="number"
                        value={editData.creatureKills ?? selectedCharacter.creatureKills}
                        onChange={(e) => setEditData({ ...editData, creatureKills: parseInt(e.target.value) })}
                        className="w-full bg-slate-700/50 border border-green-500/30 text-white px-2 sm:px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-red-300 text-xs font-bold mb-1 uppercase tracking-wide">Mortes</label>
                      <input
                        type="number"
                        value={editData.deaths ?? selectedCharacter.deaths}
                        onChange={(e) => setEditData({ ...editData, deaths: parseInt(e.target.value) })}
                        className="w-full bg-slate-700/50 border border-red-500/30 text-white px-2 sm:px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-yellow-300 text-xs font-bold mb-1 uppercase tracking-wide">Ouro</label>
                    <input
                      type="number"
                      value={editData.gold ?? selectedCharacter.gold}
                      onChange={(e) => setEditData({ ...editData, gold: parseInt(e.target.value) })}
                      className="w-full bg-slate-700/50 border border-yellow-500/30 text-white px-2 sm:px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition"
                    />
                  </div>

                  {/* Status Section */}
                  <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 border border-slate-600/50 rounded-lg p-3 sm:p-4">
                    <label className="block text-gray-200 text-xs font-bold mb-2 sm:mb-3 uppercase tracking-wide">Status do Personagem</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditData({ ...editData, isDeceased: false, causeOfDeath: '' })}
                        className={`flex-1 py-2 px-2 sm:px-3 rounded-lg transition font-bold text-xs sm:text-sm ${
                          !editData.isDeceased
                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-600/50'
                            : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50 border border-slate-600'
                        }`}
                      >
                        ❤️ Vivo
                      </button>
                      <button
                        onClick={() => setEditData({ ...editData, isDeceased: true })}
                        className={`flex-1 py-2 px-2 sm:px-3 rounded-lg transition font-bold text-xs sm:text-sm ${
                          editData.isDeceased
                            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/50'
                            : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50 border border-slate-600'
                        }`}
                      >
                        💀 Morto
                      </button>
                    </div>
                  </div>

                  {/* Cause of Death */}
                  {editData.isDeceased && (
                    <div className="bg-red-900/20 border border-red-600/40 rounded-lg p-3 sm:p-4">
                      <label className="block text-red-300 text-xs font-bold mb-2 uppercase tracking-wide">Causa da Morte</label>
                      <textarea
                        value={editData.causeOfDeath ?? selectedCharacter.causeOfDeath ?? ''}
                        onChange={(e) => setEditData({ ...editData, causeOfDeath: e.target.value })}
                        placeholder="Descreva a causa da morte do personagem..."
                        className="w-full bg-slate-700/50 border border-red-500/30 text-white px-2 sm:px-3 py-2 rounded-lg resize-none h-16 sm:h-20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex gap-2 sm:gap-3 border-t border-slate-700/50 px-4 sm:px-8 py-3 sm:py-4 bg-slate-900/30">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        if (selectedCharacter && user) {
                          await masterUpdateProfile(selectedCharacter.id, editData);
                          await loadCharacters(user.uid);
                          setShowEditModal(false);
                        }
                      } catch (error) {
                        console.error('Erro ao salvar:', error);
                        alert('Erro ao salvar alterações');
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition shadow-lg shadow-orange-500/50 text-sm sm:text-base"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}
        </Motion>
      )}
    </div>
  );
}
