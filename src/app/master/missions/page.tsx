'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { isMasterEmail } from '@/lib/profileService';
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Motion, spring } from '@/lib/MotionWrapper';
import { ArrowLeft, Plus, Trash2, Edit2, X } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  reward: { experience: number; gold: number };
  status: 'available' | 'active' | 'completed';
  requirements?: { minLevel?: number; requiredClass?: string[]; requiredTeam?: boolean };
  createdAt: any;
  updatedAt: any;
  createdBy?: string;
  createdByName?: string;
  acceptedBy?: any[];
  completedBy?: any[];
}

export default function MissionsManagement() {
  const [user] = useAuthState(auth);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState<Partial<Mission>>({
    title: '',
    description: '',
    difficulty: 'medium',
    status: 'available',
    reward: { experience: 0, gold: 0 },
    requirements: { minLevel: 1 },
  });

  useEffect(() => {
    loadMissions();
  }, [user]);

  const loadMissions = async () => {
    if (!user || !isMasterEmail(user.email || '')) return;

    try {
      const missionsCollection = collection(db, 'missions');
      const snapshot = await getDocs(missionsCollection);
      const missionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mission[];
      setMissions(missionsData);
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !formData.title || !formData.description || formData.difficulty === undefined || !formData.reward) {
      setMessage({ text: 'Preencha todos os campos obrigatórios', type: 'error' });
      return;
    }

    try {
      if (editingId) {
        const missionRef = doc(db, 'missions', editingId);
        await updateDoc(missionRef, {
          ...formData,
          updatedAt: new Date(),
        });
        setMessage({ text: 'Missão atualizada com sucesso!', type: 'success' });
      } else {
        // Para criar nova, usar createMission
        setMessage({ text: 'Use a página de criar nova missão', type: 'error' });
        return;
      }

      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
        status: 'available',
        reward: { experience: 0, gold: 0 },
        requirements: { minLevel: 1 },
      });
      setEditingId(null);
      setShowForm(false);
      loadMissions();
    } catch (error) {
      console.error('Erro ao salvar missão:', error);
      setMessage({ text: 'Erro ao salvar missão', type: 'error' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleEdit = (mission: Mission) => {
    setFormData(mission);
    setEditingId(mission.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      difficulty: 'medium',
      status: 'available',
      reward: { experience: 0, gold: 0 },
      requirements: { minLevel: 1 },
    });
  };

  const handleDelete = async (missionId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta missão?')) return;

    try {
      await deleteDoc(doc(db, 'missions', missionId));
      setMessage({ text: 'Missão deletada com sucesso!', type: 'success' });
      loadMissions();
    } catch (error) {
      setMessage({ text: 'Erro ao deletar missão', type: 'error' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  if (!user || !isMasterEmail(user.email || '')) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-100 mb-4">Você não tem permissão para acessar esta página</p>
          <Link href="/master" className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg">
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #3a2f28 0%, #2d1f18 50%, #3a2f28 100%)',
    }}>
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-yellow-700/30 bg-gradient-to-r from-stone-800/60 via-amber-900/40 to-stone-800/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/master" className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition font-semibold">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-yellow-300 to-amber-400">
              ✨ GERENCIAR MISSÕES
            </h1>

            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) handleCancel();
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition"
            >
              <Plus className="w-5 h-5" />
              {showForm && editingId === null ? 'Cancelar' : 'Nova Missão'}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Mensagem de feedback */}
          {message && (
            <Motion defaultStyle={{ opacity: 0, y: -20 }} style={{ opacity: spring(1), y: spring(0) }}>
              {(style) => (
                <div 
                  className={`mb-6 p-4 rounded-lg border ${
                    message.type === 'success' 
                      ? 'bg-emerald-900/40 border-emerald-500/60 text-emerald-200' 
                      : 'bg-rose-900/40 border-rose-500/60 text-rose-200'
                  }`}
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  {message.text}
                </div>
              )}
            </Motion>
          )}

          {/* Formulário */}
          {showForm && (
            <Motion defaultStyle={{ opacity: 0, y: -20 }} style={{ opacity: spring(1), y: spring(0) }}>
              {(style) => (
                <div 
                  className="mb-8 p-6 bg-stone-800/60 border-2 border-yellow-700/40 rounded-xl backdrop-blur-sm"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-amber-300">
                      {editingId ? 'Editar Missão' : 'Nova Missão'}
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="text-amber-300 hover:text-amber-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Título *</label>
                        <input
                          type="text"
                          value={formData.title || ''}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-yellow-500"
                          placeholder="Título da missão"
                        />
                      </div>

                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Dificuldade *</label>
                        <select
                          value={formData.difficulty || 'medium'}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                        >
                          <option value="easy">Fácil</option>
                          <option value="medium">Médio</option>
                          <option value="hard">Difícil</option>
                          <option value="legendary">Lendário</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Status *</label>
                        <select
                          value={formData.status || 'available'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                        >
                          <option value="available">Disponível</option>
                          <option value="active">Ativa</option>
                          <option value="completed">Completa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Recompensa (XP) *</label>
                        <input
                          type="number"
                          value={formData.reward?.experience || 0}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            reward: { experience: Number(e.target.value), gold: formData.reward?.gold || 0 } 
                          })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Recompensa (Ouro) *</label>
                        <input
                          type="number"
                          value={formData.reward?.gold || 0}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            reward: { experience: formData.reward?.experience || 0, gold: Number(e.target.value) } 
                          })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Nível Mínimo</label>
                        <input
                          type="number"
                          value={formData.requirements?.minLevel || 1}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            requirements: { ...formData.requirements, minLevel: Number(e.target.value) } 
                          })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-amber-100 font-semibold mb-2">Descrição *</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-yellow-500 resize-none"
                        placeholder="Descrição da missão"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-6 py-3 rounded-lg font-bold transition"
                      >
                        {editingId ? 'Atualizar Missão' : 'Criar Missão'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 bg-stone-700/50 hover:bg-stone-600/50 text-amber-100 px-6 py-3 rounded-lg font-bold transition border border-yellow-700/40"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </Motion>
          )}

          {/* Lista de missões */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-amber-300 mt-4">Carregando missões...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-amber-200 font-semibold">
                  Total de missões: <span className="text-yellow-300">{missions.length}</span>
                </p>
              </div>

              {missions.length === 0 ? (
                <div className="text-center py-12 bg-stone-800/30 border-2 border-yellow-700/40 rounded-xl">
                  <p className="text-amber-200/60 text-lg">Nenhuma missão criada ainda</p>
                  <p className="text-amber-200/50 mt-2">Clique em "Nova Missão" para criar a primeira</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {missions.map((mission, index) => (
                    <Motion
                      key={mission.id}
                      defaultStyle={{ opacity: 0, y: 20 }}
                      style={{ opacity: spring(1, { delay: index * 30 }), y: spring(0, { delay: index * 30 }) }}
                    >
                      {(style) => (
                        <div
                          className="p-6 bg-stone-800/40 border-2 border-yellow-700/40 rounded-lg backdrop-blur-sm"
                          style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-yellow-300">{mission.title}</h3>
                              <p className="text-xs text-amber-200/70 capitalize">
                                {mission.difficulty === 'easy' && '⭐ Fácil'}
                                {mission.difficulty === 'medium' && '⭐⭐ Médio'}
                                {mission.difficulty === 'hard' && '⭐⭐⭐ Difícil'}
                                {mission.difficulty === 'legendary' && '⭐⭐⭐⭐ Lendário'}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              mission.status === 'available' ? 'bg-emerald-600/30 text-emerald-300' :
                              mission.status === 'active' ? 'bg-blue-600/30 text-blue-300' :
                              'bg-gray-600/30 text-gray-300'
                            }`}>
                              {mission.status === 'available' && 'Disponível'}
                              {mission.status === 'active' && 'Ativa'}
                              {mission.status === 'completed' && 'Completa'}
                            </span>
                          </div>

                          <p className="text-amber-100/80 text-sm mb-3 line-clamp-2">{mission.description}</p>

                          <div className="mb-4 space-y-1 text-sm">
                            <p className="text-yellow-200">💰 Ouro: {mission.reward?.gold || 0}</p>
                            <p className="text-blue-300">⭐ XP: {mission.reward?.experience || 0}</p>
                            {mission.requirements?.minLevel && (
                              <p className="text-amber-300">📊 Nível Mín: {mission.requirements.minLevel}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-yellow-700/30">
                            <button
                              onClick={() => handleEdit(mission)}
                              className="p-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(mission.id)}
                              className="p-2 bg-red-600/40 hover:bg-red-600/60 text-red-300 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Motion>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
