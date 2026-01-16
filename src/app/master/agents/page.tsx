'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { isMasterEmail } from '@/lib/profileService';
import { getAgents, createAgent, updateAgent, deleteAgent, Agent } from '@/lib/recruitmentService';
import Link from 'next/link';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';
import { Motion, spring } from '@/lib/MotionWrapper';

export default function AgentsManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    rarity: 'rare' as 'common' | 'rare' | 'epic' | 'legendary',
    specialAbility: '',
    stats: {
      strength: 5,
      speed: 5,
      endurance: 5,
      intelligence: 5,
    }
  });

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
      loadAgents();
    });

    return () => unsubscribe();
  }, [router]);

  const loadAgents = async () => {
    try {
      const agentsList = await getAgents();
      setAgents(agentsList);
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
      alert('Erro ao carregar agentes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.imageUrl.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, {
          ...formData,
          id: editingAgent.id,
          createdAt: editingAgent.createdAt
        } as Agent);
      } else {
        await createAgent(formData as Omit<Agent, 'id' | 'createdAt'>);
      }

      setShowAddModal(false);
      setEditingAgent(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        rarity: 'rare' as 'common' | 'rare' | 'epic' | 'legendary',
        specialAbility: '',
        stats: {
          strength: 5,
          speed: 5,
          endurance: 5,
          intelligence: 5,
        }
      });

      await loadAgents();
      alert(editingAgent ? 'Agente atualizado com sucesso!' : 'Agente criado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar agente');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Tem certeza que quer deletar este agente?')) return;

    try {
      await deleteAgent(agentId);
      await loadAgents();
      alert('Agente deletado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar agente');
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      price: agent.price,
      imageUrl: agent.imageUrl,
      rarity: agent.rarity,
      specialAbility: agent.specialAbility,
      stats: agent.stats
    });
    setShowAddModal(true);
  };

  const handleOpenAddModal = () => {
    setEditingAgent(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      rarity: 'rare',
      specialAbility: '',
      stats: {
        strength: 5,
        speed: 5,
        endurance: 5,
        intelligence: 5,
      }
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4">Carregando agentes...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Motion defaultStyle={{ opacity: 0, y: -20 }} style={{ opacity: spring(1), y: spring(0) }}>
          {(style) => (
            <div style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }} className="mb-8">
              <Link 
                href="/master" 
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-4 transition"
              >
                ← Voltar
              </Link>
              <h1 className="text-4xl font-bold text-orange-400 mb-2">Gerenciar Agentes</h1>
              <p className="text-gray-400">Crie e configure os agentes disponíveis para recrutamento</p>
            </div>
          )}
        </Motion>

        {/* Add Agent Button */}
        <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 100 }), y: spring(0, { delay: 100 }) }}>
          {(style) => (
            <div style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }} className="mb-8">
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-bold transition transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Adicionar Agente
              </button>
            </div>
          )}
        </Motion>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Motion key={agent.id} defaultStyle={{ opacity: 0, scale: 0.9 }} style={{ opacity: spring(1), scale: spring(1) }}>
              {(style) => (
                <div
                  className="bg-linear-to-br from-slate-800 to-slate-900 border border-orange-500/30 rounded-lg overflow-hidden shadow-lg hover:shadow-orange-500/30 transition"
                  style={{ opacity: style.opacity, transform: `scale(${style.scale})` }}
                >
                  {/* Agent Image */}
                  <div className="relative h-48 overflow-hidden bg-black">
                    <img 
                      src={agent.imageUrl} 
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/80 px-3 py-1 rounded-full border border-orange-500">
                      <span className="text-sm font-bold text-orange-400 capitalize">{agent.rarity}</span>
                    </div>
                  </div>

                  {/* Agent Info */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-orange-300 mb-2">{agent.name}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{agent.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-slate-700/50 px-2 py-1 rounded">
                        <span className="text-gray-300">⚔️ STR: <span className="text-orange-300 font-bold">{agent.stats.strength}</span></span>
                      </div>
                      <div className="bg-slate-700/50 px-2 py-1 rounded">
                        <span className="text-gray-300">💨 SPD: <span className="text-orange-300 font-bold">{agent.stats.speed}</span></span>
                      </div>
                      <div className="bg-slate-700/50 px-2 py-1 rounded">
                        <span className="text-gray-300">🛡️ END: <span className="text-orange-300 font-bold">{agent.stats.endurance}</span></span>
                      </div>
                      <div className="bg-slate-700/50 px-2 py-1 rounded">
                        <span className="text-gray-300">🧠 INT: <span className="text-orange-300 font-bold">{agent.stats.intelligence}</span></span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                      <span className="text-yellow-400 font-bold">💰 {agent.price}</span>
                      <span className="text-gray-500 text-xs">Ouro</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAgent(agent)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Motion>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">Nenhum agente criado ainda</p>
            <p className="text-gray-500 text-sm mt-2">Clique no botão acima para adicionar o primeiro agente</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Motion defaultStyle={{ opacity: 0, scale: 0.9 }} style={{ opacity: spring(1), scale: spring(1) }}>
            {(style) => (
              <div 
                className="bg-linear-to-br from-slate-800 via-slate-800 to-slate-900 border border-orange-500/40 rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl"
                style={{ opacity: style.opacity, transform: `scale(${style.scale})` }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-orange-400">
                    {editingAgent ? 'Editar Agente' : 'Novo Agente'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingAgent(null);
                    }}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome do agente"
                      className="w-full bg-slate-600/50 border border-slate-500/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Descrição *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do agente"
                      className="w-full bg-slate-600/50 border border-slate-500/50 text-white px-4 py-3 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">URL da Imagem *</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-600/50 border border-slate-500/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2">Preço</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                        min="0"
                        className="w-full bg-slate-600/50 border border-slate-500/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2">Raridade</label>
                      <select
                        value={formData.rarity}
                        onChange={(e) => setFormData({ ...formData, rarity: e.target.value as 'common' | 'rare' | 'epic' | 'legendary' })}
                        className="w-full bg-slate-600/50 border border-slate-500/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                      >
                        <option value="common">Comum</option>
                        <option value="rare">Raro</option>
                        <option value="epic">Épico</option>
                        <option value="legendary">Lendário</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Habilidade Especial</label>
                    <textarea
                      value={formData.specialAbility}
                      onChange={(e) => setFormData({ ...formData, specialAbility: e.target.value })}
                      placeholder="Descreva a habilidade especial"
                      className="w-full bg-slate-600/50 border border-slate-500/50 text-white px-4 py-3 rounded-lg resize-none h-16 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-3">Estatísticas (0-10)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Força</label>
                        <input
                          type="number"
                          value={formData.stats.strength}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            stats: { ...formData.stats, strength: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) }
                          })}
                          min="1"
                          max="10"
                          className="w-full bg-slate-600/50 border border-slate-500/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Velocidade</label>
                        <input
                          type="number"
                          value={formData.stats.speed}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            stats: { ...formData.stats, speed: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) }
                          })}
                          min="1"
                          max="10"
                          className="w-full bg-slate-600/50 border border-slate-500/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Resistência</label>
                        <input
                          type="number"
                          value={formData.stats.endurance}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            stats: { ...formData.stats, endurance: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) }
                          })}
                          min="1"
                          max="10"
                          className="w-full bg-slate-600/50 border border-slate-500/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Inteligência</label>
                        <input
                          type="number"
                          value={formData.stats.intelligence}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            stats: { ...formData.stats, intelligence: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) }
                          })}
                          min="1"
                          max="10"
                          className="w-full bg-slate-600/50 border border-slate-500/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingAgent(null);
                    }}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddAgent}
                    className="flex-1 bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg shadow-orange-600/50"
                  >
                    {editingAgent ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </div>
            )}
          </Motion>
        </div>
      )}
    </div>
  );
}
