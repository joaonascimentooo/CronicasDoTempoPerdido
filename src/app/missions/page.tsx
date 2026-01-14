'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getUserProfile } from '@/lib/profileService';
import { getAvailableMissions, acceptMission, getUserAcceptedMissions } from '@/lib/missionService';
import { UserProfile, Mission } from '@/lib/types';
import Link from 'next/link';
import { Motion, spring } from 'react-motion';
import { Zap } from 'lucide-react';

export default function MissionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const [acceptedMissions, setAcceptedMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'available' | 'accepted'>('available');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      loadMissions(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadMissions = async (userId: string) => {
    try {
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
      }

      const available = await getAvailableMissions();
      setAvailableMissions(available);

      const accepted = await getUserAcceptedMissions(userId);
      setAcceptedMissions(accepted);
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMission = async (missionId: string) => {
    if (!user) return;

    try {
      await acceptMission(missionId, user.uid);
      loadMissions(user.uid);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert('Erro: ' + errorMsg);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-900/50 text-green-300 border border-green-600/60';
      case 'medium':
        return 'bg-blue-900/50 text-blue-300 border border-blue-600/60';
      case 'hard':
        return 'bg-orange-900/50 text-orange-300 border border-orange-600/60';
      case 'legendary':
        return 'bg-purple-900/50 text-purple-300 border border-purple-600/60';
      default:
        return 'bg-gray-900/50 text-gray-300 border border-gray-600/60';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando missões...</div>
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
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="text-orange-400" size={40} />
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                  Missões
                </h1>
              </div>
              <p className="text-gray-400 text-lg">Ajude a proteger o tempo aceitando missões</p>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-500 mx-auto mt-6"></div>
            </div>
          )}
        </Motion>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setFilter('available')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              filter === 'available'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/50'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Disponíveis ({availableMissions.length})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              filter === 'accepted'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/50'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Aceitas ({acceptedMissions.length})
          </button>
        </div>

        {/* Missions Grid */}
        {filter === 'available' ? (
          availableMissions.length === 0 ? (
            <div className="bg-slate-700/50 border border-orange-500/30 rounded-lg p-8 text-center">
              <p className="text-gray-400 text-lg">Nenhuma missão disponível no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableMissions.map((mission) => (
                <Motion
                  key={mission.id}
                  defaultStyle={{ opacity: 0, y: 20 }}
                  style={{ opacity: spring(1), y: spring(0) }}
                >
                  {(style) => (
                    <div
                      style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                      className="bg-gradient-to-br from-slate-700 to-slate-800 border border-orange-500/30 rounded-xl p-6 hover:border-orange-500 transition group"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-orange-400 group-hover:text-orange-300 transition">
                            {mission.title}
                          </h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty.charAt(0).toUpperCase() + mission.difficulty.slice(1)}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">{mission.description}</p>

                      {/* Requirements */}
                      {mission.requirements && (
                        <div className="bg-slate-900/50 rounded-lg p-3 mb-4 text-xs text-gray-300 space-y-1">
                          {mission.requirements.minLevel && (
                            <p>⚔️ Nível mínimo: {mission.requirements.minLevel}</p>
                          )}
                          {mission.requirements.requiredTeam && (
                            <p>👥 Requer equipe</p>
                          )}
                        </div>
                      )}

                      {/* Rewards */}
                      <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-3 mb-4 border border-yellow-700/50">
                        <p className="text-sm font-bold text-yellow-300 mb-1">Recompensas:</p>
                        <div className="flex gap-3 text-sm">
                          <span>⭐ {mission.reward.experience} XP</span>
                          <span>💰 {mission.reward.gold} Ouro</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {acceptedMissions.some(m => m.id === mission.id) && (
                        <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-2 mb-4 text-center">
                          <p className="text-emerald-300 font-semibold text-sm">✓ Missão Aceita</p>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedMission(mission)}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                        >
                          Mais Informações
                        </button>
                        {!acceptedMissions.some(m => m.id === mission.id) ? (
                          <button
                            onClick={() => handleAcceptMission(mission.id)}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-orange-600/50"
                          >
                            Aceitar
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-slate-600 text-gray-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed opacity-60"
                          >
                            Já Aceita
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Motion>
              ))}
            </div>
          )
        ) : acceptedMissions.length === 0 ? (
          <div className="bg-slate-700/50 border border-orange-500/30 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-lg">Você ainda não aceitou nenhuma missão</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedMissions.map((mission) => (
              <Motion
                key={mission.id}
                defaultStyle={{ opacity: 0, y: 20 }}
                style={{ opacity: spring(1), y: spring(0) }}
              >
                {(style) => (
                  <div
                    style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                    className="bg-gradient-to-br from-indigo-700 to-slate-800 border border-indigo-500/30 rounded-xl p-6 group cursor-pointer hover:border-indigo-400 transition"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-indigo-300 group-hover:text-indigo-200 transition">
                          {mission.title}
                        </h3>
                        <p className="text-sm text-gray-500">Em andamento</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getDifficultyColor(mission.difficulty)}`}>
                        {mission.difficulty.charAt(0).toUpperCase() + mission.difficulty.slice(1)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{mission.description}</p>

                    {/* Rewards */}
                    <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-3 mb-4 border border-yellow-700/50">
                      <p className="text-sm font-bold text-yellow-300 mb-1">Recompensas:</p>
                      <div className="flex gap-3 text-sm">
                        <span>⭐ {mission.reward.experience} XP</span>
                        <span>💰 {mission.reward.gold} Ouro</span>
                      </div>
                    </div>

                    <button
                      disabled
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-indigo-300 font-bold py-2 px-4 rounded-lg opacity-75 cursor-not-allowed"
                    >
                      ✓ Missão Aceita
                    </button>
                  </div>
                )}
              </Motion>
            ))}
          </div>
        )}

        {/* Mission Details Modal */}
        {selectedMission && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Motion defaultStyle={{ opacity: 0, scale: 0.95 }} style={{ opacity: spring(1), scale: spring(1) }}>
              {(style) => (
                <div
                  style={{ opacity: style.opacity, transform: `scale(${style.scale})` }}
                  className="bg-slate-800 border border-orange-500/50 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
              <div className="sticky top-0 bg-slate-800 border-b border-orange-500/30 p-6 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedMission.title}</h2>
                  <div className="flex gap-2 items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedMission.difficulty === 'easy'
                        ? 'bg-emerald-900/80 text-emerald-300'
                        : selectedMission.difficulty === 'medium'
                        ? 'bg-yellow-900/80 text-yellow-300'
                        : selectedMission.difficulty === 'hard'
                        ? 'bg-orange-900/80 text-orange-300'
                        : 'bg-red-900/80 text-red-300'
                    }`}>
                      {selectedMission.difficulty === 'easy' ? '⭐ Fácil' :
                       selectedMission.difficulty === 'medium' ? '⭐⭐ Médio' :
                       selectedMission.difficulty === 'hard' ? '⭐⭐⭐ Difícil' :
                       '⭐⭐⭐⭐ Lendário'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMission(null)}
                  className="text-gray-400 hover:text-white transition text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Full Description */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Descrição</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedMission.description}</p>
                </div>

                {/* Requirements */}
                {selectedMission.requirements && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Requisitos</h3>
                    <div className="bg-slate-900/50 rounded-lg p-4 space-y-2 border border-slate-700">
                      {selectedMission.requirements.minLevel && (
                        <p className="text-gray-300">⚔️ <span className="font-semibold">Nível mínimo:</span> {selectedMission.requirements.minLevel}</p>
                      )}
                      {selectedMission.requirements.requiredTeam && (
                        <p className="text-gray-300">👥 <span className="font-semibold">Equipe obrigatória</span></p>
                      )}
                      {!selectedMission.requirements.minLevel && !selectedMission.requirements.requiredTeam && (
                        <p className="text-gray-400 italic">Nenhum requisito especial</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Rewards */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Recompensas</h3>
                  <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-4 border border-yellow-700/50 space-y-2">
                    <p className="text-yellow-300 flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      <span>{selectedMission.reward.experience} Pontos de Experiência</span>
                    </p>
                    <p className="text-yellow-300 flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      <span>{selectedMission.reward.gold} Ouro</span>
                    </p>
                  </div>
                </div>

                {/* Status Info */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm text-gray-400">
                    Status: <span className="text-orange-400 font-semibold">{selectedMission.status}</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Aceitos: {selectedMission.acceptedBy?.length || 0} jogadores
                  </p>
                </div>

                {/* Action Button */}
                {!acceptedMissions.some(m => m.id === selectedMission.id) ? (
                  <button
                    onClick={() => {
                      handleAcceptMission(selectedMission.id);
                      setSelectedMission(null);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-orange-600/50 text-lg"
                  >
                    Aceitar Missão
                  </button>
                ) : (
                  <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-4 text-center">
                    <p className="text-emerald-300 font-semibold">✓ Você já aceitou esta missão</p>
                  </div>
                )}
              </div>
            </div>
              )}
            </Motion>
          </div>
        )}
      </div>
    </div>
  );
}
