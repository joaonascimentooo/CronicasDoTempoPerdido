'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getAgents, recruitAgent, getRarityColor, getRarityBg, getRarityBorder } from '@/lib/recruitmentService';
import { Agent } from '@/lib/recruitmentService';
import { getUserProfile } from '@/lib/profileService';
import { UserProfile } from '@/lib/types';
import { Motion, spring } from '@/lib/MotionWrapper';
import { Zap, ShoppingCart, Coins, ArrowLeft, ChevronRight, Info, Star } from 'lucide-react';

export default function RecruitmentPage() {
  const [user] = useAuthState(auth);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recruitingAgent, setRecruitingAgent] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showRecruit, setShowRecruit] = useState(false);
  const [selectedAgentForDetails, setSelectedAgentForDetails] = useState<Agent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const agentsList = await getAgents();
        setAgents(agentsList);

        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleRecruitAgent = async (agentId: string) => {
    if (!user || !profile) return;

    const agent = agents.find(a => a.id === agentId);
    
    if (!agent) {
      setMessage({ text: 'Agente não encontrado', type: 'error' });
      return;
    }

    if (profile.gold < agent.price) {
      setMessage({ text: `Ouro insuficiente! Faltam ${agent.price - profile.gold}`, type: 'error' });
      return;
    }

    try {
      setRecruitingAgent(agentId);
      const success = await recruitAgent(user.uid, agentId, profile.id);
      
      if (success) {
        setMessage({ 
          text: `${agent.name} recrutado com sucesso!`, 
          type: 'success' 
        });
        
        setProfile({ ...profile, gold: profile.gold - agent.price });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ text: 'Erro ao recrutar agente', type: 'error' });
    } finally {
      setRecruitingAgent(null);
    }
  };

  const handleShowDetails = (agent: Agent) => {
    setSelectedAgentForDetails(agent);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4">Carregando dojo...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Você precisa estar autenticado</p>
          <Link href="/login" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  // Tela de entrada imersiva
  if (!showRecruit) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Imagem de fundo em tela cheia */}
        <div className="absolute inset-0">
          <img 
            src="/shop/dojo.png" 
            alt="Dojo do Jaxon" 
            className="w-full h-full object-cover"
          />
          {/* Overlay gradiente escuro */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/60 to-black/40"></div>
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-transparent to-black/80"></div>
        </div>

        {/* Conteúdo sobreposto */}
        <div className="relative z-10 w-full h-screen flex flex-col items-center justify-between px-4 sm:px-6 py-8">
          {/* Header com botão voltar */}
          <Motion defaultStyle={{ opacity: 0, y: -30 }} style={{ opacity: spring(1), y: spring(0) }}>
            {(style) => (
              <div className="w-full flex justify-between items-center" style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                <Link href="/" className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition bg-black/40 px-4 py-2 rounded-lg backdrop-blur">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Voltar</span>
                </Link>
                
                <div className="flex items-center gap-2 bg-black/60 px-6 py-3 rounded-lg backdrop-blur border border-amber-500/30">
                  <Coins className="w-6 h-6 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-2xl">{profile.gold}</span>
                </div>
              </div>
            )}
          </Motion>

          {/* Conteúdo central */}
          <Motion defaultStyle={{ opacity: 0, scale: 0.9 }} style={{ opacity: spring(1, { delay: 200 }), scale: spring(1, { delay: 200 }) }}>
            {(style) => (
              <div 
                className="text-center max-w-3xl mx-auto"
                style={{ opacity: style.opacity, transform: `scale(${style.scale})` }}
              >
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl">
                  Dojo do <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-300 to-amber-500">Jaxon</span>
                </h1>

                <p className="text-gray-100 text-lg sm:text-2xl mb-8 leading-relaxed drop-shadow-lg font-light">
                  &ldquo;Bem-vindo ao dojo sagrado. Aqui repousam os guerreiros mais hábeis e dedicados. Cada um deles traz consigo técnicas ancestrais e poder inexplorado. Escolha com sabedoria aqueles que se juntem à sua jornada.&rdquo;
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  <div className="bg-black/60 backdrop-blur px-4 py-3 rounded-lg border border-amber-500/30">
                    <p className="text-amber-400 font-bold text-lg">⚔️</p>
                    <p className="text-gray-200 text-sm">Guerreiros</p>
                  </div>
                  <div className="bg-black/60 backdrop-blur px-4 py-3 rounded-lg border border-amber-500/30">
                    <p className="text-amber-400 font-bold text-lg">🥋</p>
                    <p className="text-gray-200 text-sm">Mestres</p>
                  </div>
                  <div className="bg-black/60 backdrop-blur px-4 py-3 rounded-lg border border-amber-500/30">
                    <p className="text-amber-400 font-bold text-lg">✨</p>
                    <p className="text-gray-200 text-sm">Lendários</p>
                  </div>
                  <div className="bg-black/60 backdrop-blur px-4 py-3 rounded-lg border border-amber-500/30">
                    <p className="text-amber-400 font-bold text-lg">🌟</p>
                    <p className="text-gray-200 text-sm">Épicos</p>
                  </div>
                </div>
              </div>
            )}
          </Motion>

          {/* Botão de entrada */}
          <Motion defaultStyle={{ opacity: 0, y: 30 }} style={{ opacity: spring(1, { delay: 400 }), y: spring(0, { delay: 400 }) }}>
            {(style) => (
              <div style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                <button
                  onClick={() => setShowRecruit(true)}
                  className="group relative inline-flex items-center gap-3 bg-linear-to-r from-amber-600 via-amber-600 to-amber-700 hover:from-amber-700 hover:via-amber-700 hover:to-amber-800 text-white px-12 py-6 rounded-lg font-bold text-2xl transition transform hover:scale-110 shadow-2xl hover:shadow-amber-600/60 overflow-hidden border-2 border-amber-300"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent transform group-hover:translate-x-full transition duration-700 -translate-x-full"></div>
                  <span className="relative flex items-center gap-3">
                    Entrar no Dojo
                    <ChevronRight className="w-6 h-6 transform group-hover:translate-x-2 transition" />
                  </span>
                </button>

                <p className="text-gray-300 text-center mt-6 drop-shadow-lg">Clique para recrutar seus agentes</p>
              </div>
            )}
          </Motion>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #3a2f28 0%, #2d1f18 50%, #3a2f28 100%)',
    }}>
      {/* Background com textura */}
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(167, 139, 250, 0.2), transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.2), transparent 50%)',
      }}></div>

      {/* Luzes decorativas - tons quentes e mágicos */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-yellow-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-yellow-700/30 bg-gradient-to-r from-stone-800/60 via-amber-900/40 to-stone-800/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition font-semibold">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            
            <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1) }}>
              {(style) => (
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-yellow-300 to-amber-400" style={{ opacity: style.opacity }}>
                  🥋 DOJO DO TREINADOR
                </h1>
              )}
            </Motion>

            <div className="flex items-center gap-3 bg-stone-900/60 backdrop-blur px-4 py-2 rounded-lg border border-yellow-600/40">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-bold text-lg">{profile.gold}</span>
            </div>
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

          {/* Grid de Agentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {agents.map((agent) => (
              <Motion key={agent.id} defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1), y: spring(0) }}>
                {(style) => (
                  <div
                    className={`${getRarityBg(agent.rarity)} border-2 ${getRarityBorder(agent.rarity)} rounded-lg overflow-hidden backdrop-blur hover:shadow-xl transition-all duration-300 group cursor-pointer`}
                    style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                    onClick={() => handleShowDetails(agent)}
                  >
                    {/* Imagem do Agente */}
                    <div className="relative h-64 overflow-hidden bg-black/40">
                      <img 
                        src={agent.imageUrl} 
                        alt={agent.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                      
                      {/* Raridade Badge */}
                      <div className={`absolute top-3 right-3 flex items-center gap-1 ${getRarityBg(agent.rarity)} px-3 py-1 rounded-full border ${getRarityBorder(agent.rarity)}`}>
                        <Star className="w-4 h-4" />
                        <span className={`text-sm font-bold capitalize ${getRarityColor(agent.rarity)}`}>
                          {agent.rarity}
                        </span>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-amber-200 mb-2">{agent.name}</h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{agent.description}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                        <div className="bg-black/30 px-2 py-1 rounded border border-amber-600/40">
                          <p className="text-amber-300 font-bold">⚔️ STR: {agent.stats.strength}</p>
                        </div>
                        <div className="bg-black/30 px-2 py-1 rounded border border-amber-600/40">
                          <p className="text-amber-300 font-bold">💨 SPD: {agent.stats.speed}</p>
                        </div>
                        <div className="bg-black/30 px-2 py-1 rounded border border-amber-600/40">
                          <p className="text-amber-300 font-bold">🛡️ END: {agent.stats.endurance}</p>
                        </div>
                        <div className="bg-black/30 px-2 py-1 rounded border border-amber-600/40">
                          <p className="text-amber-300 font-bold">🧠 INT: {agent.stats.intelligence}</p>
                        </div>
                      </div>

                      {/* Habilidade Especial */}
                      <div className="bg-purple-900/30 px-3 py-2 rounded border border-purple-600/40 mb-4">
                        <p className="text-purple-300 text-xs font-bold mb-1">Habilidade Especial</p>
                        <p className="text-purple-200 text-xs">{agent.specialAbility}</p>
                      </div>

                      {/* Preço e Botão */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-yellow-400" />
                          <span className="text-yellow-300 font-bold text-lg">{agent.price}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecruitAgent(agent.id);
                          }}
                          disabled={recruitingAgent === agent.id || profile.gold < agent.price}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                            profile.gold >= agent.price && recruitingAgent !== agent.id
                              ? 'bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
                              : 'bg-stone-600/40 text-amber-800 cursor-not-allowed opacity-40'
                          }`}
                        >
                          {recruitingAgent === agent.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Recrutando...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              Recrutar
                            </>
                          )}
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
              <p className="text-amber-300 text-xl font-bold">Nenhum agente disponível no momento</p>
              <p className="text-gray-400 mt-2">Volte mais tarde para novos recrutas</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedAgentForDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Motion defaultStyle={{ opacity: 0, scale: 0.9 }} style={{ opacity: spring(1), scale: spring(1) }}>
            {(style) => (
              <div 
                className="bg-gradient-to-br from-stone-900 to-stone-950 border-2 border-amber-600 rounded-xl max-w-2xl w-full shadow-2xl"
                style={{ opacity: style.opacity, transform: `scale(${style.scale})` }}
              >
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  {/* Imagem */}
                  <div className="relative h-96 rounded-lg overflow-hidden">
                    <img 
                      src={selectedAgentForDetails.imageUrl}
                      alt={selectedAgentForDetails.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Informações Detalhadas */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-3xl font-bold text-amber-300">{selectedAgentForDetails.name}</h2>
                        <div className={`${getRarityBg(selectedAgentForDetails.rarity)} border ${getRarityBorder(selectedAgentForDetails.rarity)} px-3 py-1 rounded-full`}>
                          <p className={`font-bold capitalize ${getRarityColor(selectedAgentForDetails.rarity)}`}>
                            {selectedAgentForDetails.rarity}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-6">{selectedAgentForDetails.description}</p>

                      {/* Stats Completos */}
                      <div className="space-y-3 mb-6">
                        <h3 className="text-amber-200 font-bold mb-3">Estatísticas</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Força</span>
                            <div className="w-32 bg-black/40 rounded-full h-2 border border-amber-600/40">
                              <div 
                                className="bg-linear-to-r from-red-600 to-red-500 h-2 rounded-full" 
                                style={{ width: `${(selectedAgentForDetails.stats.strength / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-amber-300 font-bold w-8 text-right">{selectedAgentForDetails.stats.strength}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Velocidade</span>
                            <div className="w-32 bg-black/40 rounded-full h-2 border border-amber-600/40">
                              <div 
                                className="bg-linear-to-r from-blue-600 to-blue-500 h-2 rounded-full" 
                                style={{ width: `${(selectedAgentForDetails.stats.speed / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-amber-300 font-bold w-8 text-right">{selectedAgentForDetails.stats.speed}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Resistência</span>
                            <div className="w-32 bg-black/40 rounded-full h-2 border border-amber-600/40">
                              <div 
                                className="bg-linear-to-r from-green-600 to-green-500 h-2 rounded-full" 
                                style={{ width: `${(selectedAgentForDetails.stats.endurance / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-amber-300 font-bold w-8 text-right">{selectedAgentForDetails.stats.endurance}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Inteligência</span>
                            <div className="w-32 bg-black/40 rounded-full h-2 border border-amber-600/40">
                              <div 
                                className="bg-linear-to-r from-purple-600 to-purple-500 h-2 rounded-full" 
                                style={{ width: `${(selectedAgentForDetails.stats.intelligence / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-amber-300 font-bold w-8 text-right">{selectedAgentForDetails.stats.intelligence}</span>
                          </div>
                        </div>
                      </div>

                      {/* Habilidade Especial */}
                      <div className="bg-purple-900/30 px-4 py-3 rounded-lg border border-purple-600/40 mb-6">
                        <p className="text-purple-300 font-bold mb-2">✨ Habilidade Especial</p>
                        <p className="text-purple-200">{selectedAgentForDetails.specialAbility}</p>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="flex-1 px-6 py-3 rounded-lg font-bold transition border border-amber-600 text-amber-300 hover:bg-amber-600/20"
                      >
                        Fechar
                      </button>
                      <button
                        onClick={() => {
                          handleRecruitAgent(selectedAgentForDetails.id);
                          setShowDetailsModal(false);
                        }}
                        disabled={recruitingAgent === selectedAgentForDetails.id || (profile && profile.gold < selectedAgentForDetails.price)}
                        className={`flex-1 px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                          selectedAgentForDetails && profile && profile.gold >= selectedAgentForDetails.price
                            ? 'bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border border-amber-500'
                            : 'bg-stone-600/40 text-amber-800 cursor-not-allowed opacity-40 border border-stone-600'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        Recrutar por {selectedAgentForDetails.price}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Motion>
        </div>
      )}
    </div>
  );
}
