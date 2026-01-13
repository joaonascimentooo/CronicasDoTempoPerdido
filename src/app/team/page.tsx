'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getUserProfile, getProfileById } from '@/lib/profileService';
import { getUserTeam, getAllTeams, createTeam, joinTeam, leaveTeam, deleteTeam } from '@/lib/teamService';
import { UserProfile, Team } from '@/lib/types';
import { Motion, spring } from 'react-motion';

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamMaxMembers, setTeamMaxMembers] = useState('5');

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      loadTeamData(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadTeamData = async (userId: string) => {
    try {
      // Buscar perfil do usuário
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
      }

      // Buscar equipe do usuário
      const team = await getUserTeam(userId);
      setMyTeam(team);

      // Buscar todas as equipes
      const teams = await getAllTeams();
      setAllTeams(teams);

      // Buscar perfis de todos os membros
      if (team) {
        const profiles = new Map<string, UserProfile>();
        for (const member of team.members) {
          try {
            const memberProfile = await getProfileById(member.userId);
            if (memberProfile) {
              profiles.set(member.userId, memberProfile);
            }
          } catch (error) {
            console.error(`Erro ao buscar perfil do membro ${member.userId}:`, error);
          }
        }
        setMemberProfiles(profiles);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!user || !profile || !teamName.trim()) {
      alert('Preencha o nome da equipe');
      return;
    }

    const maxMembers = parseInt(teamMaxMembers);
    if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 20) {
      alert('O número de membros deve estar entre 2 e 20');
      return;
    }

    try {
      await createTeam(
        teamName,
        teamDescription,
        user.uid,
        profile.username,
        maxMembers
      );
      setShowCreateModal(false);
      setTeamName('');
      setTeamDescription('');
      setTeamMaxMembers('5');
      loadTeamData(user.uid);
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      alert('Erro ao criar equipe');
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!user || !profile) return;

    try {
      const result = await joinTeam(teamId, user.uid, profile.username);
      if (result && result.alreadyMember) {
        // Você já é membro, recarregar dados
        loadTeamData(user.uid);
        return;
      }
      loadTeamData(user.uid);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Erro ao entrar na equipe:', errorMsg);
      
      // Tratamento específico de erros
      if (error.code === 'permission-denied') {
        alert('Erro de permissão. Contate o administrador.');
      } else if (error.message?.includes('Equipe não encontrada')) {
        alert('Equipe não encontrada');
      } else if (error.message?.includes('limite de membros')) {
        alert('Esta equipe atingiu o limite de membros');
      } else if (error.message?.includes('já é membro')) {
        alert('Você já é membro desta equipe');
      } else {
        alert('Erro ao entrar na equipe: ' + error.message);
      }
    }
  };

  const handleLeaveTeam = async () => {
    if (!user || !myTeam) return;

    if (!confirm('Tem certeza que deseja sair da equipe?')) return;

    try {
      await leaveTeam(myTeam.id, user.uid);
      loadTeamData(user.uid);
    } catch (error) {
      console.error('Erro ao sair da equipe:', error);
      alert('Erro ao sair da equipe');
    }
  };

  const handleDeleteTeam = async () => {
    if (!user || !myTeam) return;

    if (!confirm('Tem certeza que deseja deletar a equipe?')) return;

    try {
      await deleteTeam(myTeam.id, user.uid);
      loadTeamData(user.uid);
    } catch (error) {
      console.error('Erro ao deletar equipe:', error);
      alert('Erro ao deletar equipe');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1, { delay: 0 }) }}>
          {(style) => (
            <div style={{ opacity: style.opacity }} className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-4">
                Equipes
              </h1>
              <p className="text-gray-400 text-lg">Junte-se ou crie uma equipe com outros agentes</p>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto mt-6"></div>
            </div>
          )}
        </Motion>

        {/* My Team Section */}
        {myTeam ? (
          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 100 }), y: spring(0, { delay: 100 }) }}>
            {(style) => (
              <div style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }} className="mb-16">
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/50 rounded-xl p-8">
                  <h2 className="text-3xl font-bold text-green-400 mb-4">✓ Sua Equipe</h2>
                  <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{myTeam.name}</h3>
                    {myTeam.description && (
                      <p className="text-gray-400 mb-4">{myTeam.description}</p>
                    )}
                    <p className="text-gray-300 mb-4">
                      Líder: <span className="text-orange-400 font-bold">{myTeam.leaderName}</span>
                    </p>
                    <p className="text-gray-300">
                      Membros: <span className="text-orange-400 font-bold">{myTeam.members.length}/{myTeam.maxMembers}</span>
                    </p>
                  </div>

                  {/* Members List */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-300 mb-3">Membros:</h4>
                    <div className="space-y-2">
                      {myTeam.members.map((member) => {
                        const memberProfile = memberProfiles.get(member.userId);
                        const isDeceased = memberProfile?.isDeceased || false;
                        
                        return (
                          <button
                            key={member.userId}
                            onClick={() => router.push(`/profile/view/${member.userId}`)}
                            className={`w-full text-left rounded-lg p-3 flex justify-between items-center transition border ${
                              isDeceased
                                ? 'bg-red-900/30 border-red-700/50 hover:bg-red-900/50'
                                : 'bg-green-900/30 border-green-700/50 hover:bg-green-900/50'
                            }`}
                          >
                            <div>
                              <p className="text-white font-bold hover:text-orange-400 transition">{member.username}</p>
                              <p className="text-gray-400 text-sm">
                                {member.role === 'leader' ? '👑 Líder' : 'Membro'}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                              isDeceased
                                ? 'bg-red-900/50 text-red-400 border border-red-600/50'
                                : 'bg-green-900/50 text-green-400 border border-green-600/50'
                            }`}>
                              {isDeceased ? '💀 Morto' : '❤️ Vivo'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    {myTeam.leaderId === user?.uid && (
                      <button
                        onClick={handleDeleteTeam}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                      >
                        Deletar Equipe
                      </button>
                    )}
                    {myTeam.leaderId !== user?.uid && (
                      <button
                        onClick={handleLeaveTeam}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition"
                      >
                        Sair da Equipe
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Motion>
        ) : (
          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 100 }), y: spring(0, { delay: 100 }) }}>
            {(style) => (
              <div style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }} className="mb-16">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-lg mb-6">Você não está em nenhuma equipe</p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-lg transition"
                    >
                      Criar Equipe
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Motion>
        )}

        {/* Available Teams Section */}
        {!myTeam && (
          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 200 }), y: spring(0, { delay: 200 }) }}>
            {(style) => (
              <div style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                <h2 className="text-3xl font-bold text-orange-400 mb-8">Equipes Disponíveis</h2>
                {allTeams.length === 0 ? (
                  <div className="bg-slate-700/50 border border-orange-500/30 rounded-lg p-8 text-center">
                    <p className="text-gray-400">Nenhuma equipe disponível no momento</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allTeams.map((team) => (
                      <div
                        key={team.id}
                        className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-6 hover:border-orange-500 transition"
                      >
                        <h3 className="text-xl font-bold text-orange-400 mb-2">{team.name}</h3>
                        {team.description && (
                          <p className="text-gray-400 text-sm mb-4">{team.description}</p>
                        )}
                        <p className="text-gray-300 mb-2">
                          Líder: <span className="text-orange-400 font-bold">{team.leaderName}</span>
                        </p>
                        <p className="text-gray-300 mb-4">
                          Membros: <span className="text-orange-400 font-bold">{team.members.length}/{team.maxMembers}</span>
                        </p>
                        <button
                          onClick={() => handleJoinTeam(team.id)}
                          disabled={team.members.length >= team.maxMembers}
                          className={`w-full font-bold py-2 px-4 rounded-lg transition ${
                            team.members.length >= team.maxMembers
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                        >
                          {team.members.length >= team.maxMembers ? 'Equipe Cheia' : 'Entrar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Motion>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 border border-orange-500/40 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a6 6 0 00-9-5.197V13a7 7 0 0114 0v1h-5.207A6 6 0 0016 18z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-orange-400">Criar Equipe</h3>
              </div>
              <p className="text-gray-400 text-sm ml-13">Reúna seus melhores agentes</p>
            </div>

            <div className="space-y-5 mb-8">
              {/* Nome da Equipe */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Nome da Equipe</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ex: Guardiões da Noite"
                  className="w-full bg-slate-600/50 hover:bg-slate-600/70 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-500/50 transition placeholder-gray-500"
                />
              </div>

              {/* Número Máximo de Membros */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Número Máximo de Membros</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={teamMaxMembers}
                    onChange={(e) => setTeamMaxMembers(e.target.value)}
                    min="2"
                    max="20"
                    placeholder="2-20"
                    className="flex-1 bg-slate-600/50 hover:bg-slate-600/70 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-500/50 transition placeholder-gray-500"
                  />
                  <div className="text-gray-400 text-sm bg-slate-600/30 px-3 py-2 rounded-lg border border-slate-500/30">
                    {parseInt(teamMaxMembers) > 20 ? '20' : parseInt(teamMaxMembers) < 2 ? '2' : teamMaxMembers}
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Descrição (Opcional)</label>
                <textarea
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Descrição da equipe... (Ex: Uma equipe dedicada ao espionagem)"
                  className="w-full bg-slate-600/50 hover:bg-slate-600/70 text-white px-4 py-3 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-500/50 transition placeholder-gray-500"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setTeamName('');
                  setTeamDescription('');
                  setTeamMaxMembers('5');
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 border border-slate-500/50 hover:border-slate-400/50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTeam}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-orange-500/50 hover:shadow-xl"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
