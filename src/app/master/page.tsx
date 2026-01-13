'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getMasterCharacters, isMasterEmail, masterDeleteProfile, masterUpdateProfile, getAllProfiles } from '@/lib/profileService';
import { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { Motion, spring } from 'react-motion';

export default function MasterPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [allCharacters, setAllCharacters] = useState<UserProfile[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<UserProfile[]>([]);
  const [myCharacters, setMyCharacters] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<UserProfile | null>(null);
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

      // Filtro inicial mostra tudo
      setFilteredCharacters(allChars);
    } catch (error) {
      console.error('Erro ao carregar personagens:', error);
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
      <div className="w-full py-12 px-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 0 }) }}>
            {(style) => (
              <div style={{ opacity: style.opacity }} className="text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-4">
                  Painel do Mestre
                </h1>
                <p className="text-gray-400 text-lg">Gerencie seus personagens e controle o jogo</p>
              </div>
            )}
          </Motion>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Character List */}
            <div className="lg:col-span-1">
              <Motion defaultStyle={{ opacity: 0, x: -20 }} style={{ opacity: spring(1, { delay: 100 }), x: spring(0, { delay: 100 }) }}>
                {(style) => (
                  <div style={{ opacity: style.opacity, transform: `translateX(${style.x}px)` }}>
                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-6">
                      <h2 className="text-2xl font-bold text-orange-400 mb-4">Personagens</h2>

                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Buscar personagem..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg mb-4 focus:outline-none focus:border-orange-500 border border-slate-600"
                      />

                      {/* Filter Tabs */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setFilterType('all')}
                          className={`flex-1 py-2 px-3 rounded-lg transition text-sm font-bold ${
                            filterType === 'all'
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                          }`}
                        >
                          Todos
                        </button>
                        <button
                          onClick={() => setFilterType('my')}
                          className={`flex-1 py-2 px-3 rounded-lg transition text-sm font-bold ${
                            filterType === 'my'
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                          }`}
                        >
                          Meus
                        </button>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredCharacters.length > 0 ? (
                          filteredCharacters.map((char) => (
                            <button
                              key={char.id}
                              onClick={() => setSelectedCharacter(char)}
                              className={`w-full text-left p-4 rounded-lg transition ${
                                selectedCharacter?.id === char.id
                                  ? 'bg-orange-500/20 border border-orange-500'
                                  : 'bg-slate-600/50 border border-slate-600 hover:border-orange-500/50'
                              }`}
                            >
                              <div className="font-bold text-white">{char.username}</div>
                              <div className="text-xs text-gray-500 mb-1">{char.email}</div>
                              <div className="text-sm text-gray-400">{char.class} • Nível {char.level}</div>
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
                      <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h2 className="text-3xl font-bold text-orange-400 mb-2">{selectedCharacter.username}</h2>
                            <p className="text-gray-400">{selectedCharacter.class}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteCharacter(selectedCharacter.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                          >
                            Deletar
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-600/50 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Nível</p>
                            <p className="text-3xl font-bold text-orange-400">{selectedCharacter.level}</p>
                          </div>
                          <div className="bg-slate-600/50 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">XP</p>
                            <p className="text-3xl font-bold text-blue-400">{selectedCharacter.experience}</p>
                          </div>
                          <div className="bg-slate-600/50 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Criaturas Mortas</p>
                            <p className="text-3xl font-bold text-green-400">{selectedCharacter.creatureKills}</p>
                          </div>
                          <div className="bg-slate-600/50 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Seres Mortos</p>
                            <p className="text-3xl font-bold text-red-400">{selectedCharacter.deaths}</p>
                          </div>
                          <div className="bg-slate-600/50 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Ouro</p>
                            <p className="text-3xl font-bold text-yellow-400">{selectedCharacter.gold}</p>
                          </div>
                          <div className="bg-slate-600/50 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm mb-1">Saúde</p>
                            <p className="text-3xl font-bold text-pink-400">{selectedCharacter.health}/{selectedCharacter.maxHealth}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleEditCharacter(selectedCharacter)}
                          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg transition"
                        >
                          Editar Personagem
                        </button>
                      </div>
                    </div>
                  )}
                </Motion>
              ) : (
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-lg">Selecione um personagem para editar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedCharacter && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-8 max-w-md w-full max-h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold text-orange-400 mb-6">Editar Personagem</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nível</label>
                <input
                  type="number"
                  value={editData.level ?? selectedCharacter.level}
                  onChange={(e) => setEditData({ ...editData, level: parseInt(e.target.value) })}
                  className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Experiência</label>
                <input
                  type="number"
                  value={editData.experience ?? selectedCharacter.experience}
                  onChange={(e) => setEditData({ ...editData, experience: parseInt(e.target.value) })}
                  className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Criaturas Mortas</label>
                <input
                  type="number"
                  value={editData.creatureKills ?? selectedCharacter.creatureKills}
                  onChange={(e) => setEditData({ ...editData, creatureKills: parseInt(e.target.value) })}
                  className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Seres Mortos</label>
                <input
                  type="number"
                  value={editData.deaths ?? selectedCharacter.deaths}
                  onChange={(e) => setEditData({ ...editData, deaths: parseInt(e.target.value) })}
                  className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Ouro</label>
                <input
                  type="number"
                  value={editData.gold ?? selectedCharacter.gold}
                  onChange={(e) => setEditData({ ...editData, gold: parseInt(e.target.value) })}
                  className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    if (selectedCharacter) {
                      await masterUpdateProfile(selectedCharacter.id, editData);
                      await loadCharacters();
                      setShowEditModal(false);
                    }
                  } catch (error) {
                    console.error('Erro ao salvar:', error);
                    alert('Erro ao salvar alterações');
                  }
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
