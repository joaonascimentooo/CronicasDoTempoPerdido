'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getUserProfile } from '@/lib/profileService';
import { getUserTeam, getAllTeams, createTeam, joinTeam, leaveTeam, deleteTeam } from '@/lib/teamService';
import { UserProfile, Team } from '@/lib/types';
import { Motion, spring } from 'react-motion';

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

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

    try {
      await createTeam(
        teamName,
        teamDescription,
        user.uid,
        profile.username
      );
      setShowCreateModal(false);
      setTeamName('');
      setTeamDescription('');
      loadTeamData(user.uid);
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      alert('Erro ao criar equipe');
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!user || !profile) return;

    try {
      await joinTeam(teamId, user.uid, profile.username);
      setShowJoinModal(false);
      loadTeamData(user.uid);
    } catch (error) {
      console.error('Erro ao entrar na equipe:', error);
      alert('Erro ao entrar na equipe');
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
                      {myTeam.members.map((member) => (
                        <div
                          key={member.userId}
                          className="bg-slate-700/50 rounded-lg p-3 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-white font-bold">{member.username}</p>
                            <p className="text-gray-400 text-sm">
                              {member.role === 'leader' ? '👑 Líder' : 'Membro'}
                            </p>
                          </div>
                        </div>
                      ))}
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-orange-400 mb-6">Criar Equipe</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nome da Equipe</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ex: Guardiões da Noite"
                  className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-orange-500 border border-slate-600"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Descrição (Opcional)</label>
                <textarea
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Descrição da equipe..."
                  className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg resize-none h-24 focus:outline-none focus:border-orange-500 border border-slate-600"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setTeamName('');
                  setTeamDescription('');
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTeam}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition"
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
