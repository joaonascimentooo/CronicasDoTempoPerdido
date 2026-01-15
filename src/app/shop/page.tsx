'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getShopItems, getRarityColor, getRarityBg, getRarityBorder, buyItem } from '@/lib/shopService';
import { ShopItem } from '@/lib/shopService';
import { getUserProfile } from '@/lib/profileService';
import { UserProfile } from '@/lib/types';
import { Motion, spring } from '@/lib/MotionWrapper';
import { Wand2, Sword, Shield, Zap, ShoppingCart, Coins, ArrowLeft, ChevronRight } from 'lucide-react';

export default function ShopPage() {
  const [user] = useAuthState(auth);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'weapon' | 'armor' | 'consumable' | 'other'>('all');
  const [buyingItem, setBuyingItem] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showShop, setShowShop] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const shopItems = await getShopItems();
        setItems(shopItems);

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

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.type === selectedCategory);

  const handleBuyItem = async (itemId: string) => {
    if (!user || !profile) return;

    setBuyingItem(itemId);
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
      setMessage({ text: 'Item não encontrado', type: 'error' });
      setBuyingItem(null);
      return;
    }

    if (profile.gold < item.price) {
      setMessage({ text: 'Ouro insuficiente!', type: 'error' });
      setBuyingItem(null);
      return;
    }

    try {
      const success = await buyItem(user.uid, itemId, profile.id);
      if (success) {
        setMessage({ text: `${item.name} comprado com sucesso!`, type: 'success' });
        // Atualizar ouro
        setProfile({ ...profile, gold: profile.gold - item.price });
      } else {
        setMessage({ text: 'Erro ao comprar item', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Erro ao comprar item', type: 'error' });
    } finally {
      setBuyingItem(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Sword className="w-5 h-5" />;
      case 'armor':
        return <Shield className="w-5 h-5" />;
      case 'consumable':
        return <Zap className="w-5 h-5" />;
      default:
        return <Wand2 className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4">Carregando loja...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Você precisa estar autenticado</p>
          <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  // Tela de entrada imersiva
  if (!showShop) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Imagem de fundo em tela cheia */}
        <div className="absolute inset-0">
          <img 
            src="/shop/tavern.png" 
            alt="Taberna do Alquimista" 
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
                <Link href="/" className="inline-flex items-center gap-2 text-orange-300 hover:text-orange-200 transition bg-black/40 px-4 py-2 rounded-lg backdrop-blur">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Voltar</span>
                </Link>
                
                <div className="flex items-center gap-2 bg-black/60 px-6 py-3 rounded-lg backdrop-blur border border-orange-500/30">
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
                  Taberna do <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-300 to-orange-500">Silas</span>
                </h1>

                <p className="text-gray-100 text-lg sm:text-2xl mb-8 leading-relaxed drop-shadow-lg font-light">
                  &ldquo;Bem-vindo ao santuário dos mestres da alquimia. Poções cintilam em frascos antigos, armas lendárias repousam em pedestais dourados. Cada item o tornará mais forte.&rdquo;
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  <div className="bg-black/60 backdrop-blur px-4 py-3 rounded-lg border border-orange-500/30">
                    <p className="text-orange-400 font-bold">⚔️</p>
                    <p className="text-gray-200 text-sm">Armas Épicas</p>
                  </div>
                  <div className="bg-black/60 backdrop-blur px-4 py-3 rounded-lg border border-orange-500/30">
                    <p className="text-orange-400 font-bold">🛡️</p>
                    <p className="text-gray-200 text-sm">Armaduras</p>
                  </div>
                  <div className="bg-black/60 backdrop-blur px-4 py-3 rounded-lg border border-orange-500/30">
                    <p className="text-orange-400 font-bold">🧪</p>
                    <p className="text-gray-200 text-sm">Poções</p>
                  </div>
                  <div className="bg-black/60 backdrop-blur px-4 py-3 rounded-lg border border-orange-500/30">
                    <p className="text-orange-400 font-bold">✨</p>
                    <p className="text-gray-200 text-sm">Artefatos</p>
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
                  onClick={() => setShowShop(true)}
                  className="group relative inline-flex items-center gap-3 bg-linear-to-r from-orange-500 via-orange-500 to-orange-600 hover:from-orange-600 hover:via-orange-600 hover:to-orange-700 text-white px-12 py-6 rounded-lg font-bold text-2xl transition transform hover:scale-110 shadow-2xl hover:shadow-orange-500/60 overflow-hidden border-2 border-orange-300"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent transform group-hover:translate-x-full transition duration-700 -translate-x-full"></div>
                  <span className="relative flex items-center gap-3">
                    Entrar na Loja
                    <ChevronRight className="w-6 h-6 transform group-hover:translate-x-2 transition" />
                  </span>
                </button>

                <p className="text-gray-300 text-center mt-6 drop-shadow-lg">Clique para explorar os tesouros que o aguardam</p>
              </div>
            )}
          </Motion>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background decorativo com a imagem temática */}
      <div className="fixed inset-0 opacity-15 pointer-events-none" style={{
        backgroundImage: 'url(data:image/svg+xml,%3Csvg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"%3E%3Crect fill="%23f59e0b" width="1024" height="1024"/%3E%3C/svg%3E)',
        backgroundAttachment: 'fixed',
      }}></div>

      {/* Decorações de luz */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            
            <Motion defaultStyle={{ opacity: 0 }} style={{ opacity: spring(1) }}>
              {(style) => (
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-purple-400" style={{ opacity: style.opacity }}>
                  ✨ TABERNA MÁGICA
                </h1>
              )}
            </Motion>

            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-600">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-lg">{profile.gold}</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mensagem de feedback */}
          {message && (
            <Motion defaultStyle={{ opacity: 0, y: -20 }} style={{ opacity: spring(1), y: spring(0) }}>
              {(style) => (
                <div 
                  className={`mb-6 p-4 rounded-lg border ${
                    message.type === 'success' 
                      ? 'bg-green-900/30 border-green-500 text-green-200' 
                      : 'bg-red-900/30 border-red-500 text-red-200'
                  }`}
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  {message.text}
                </div>
              )}
            </Motion>
          )}

          {/* Descrição temática */}
          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1), y: spring(0) }}>
            {(style) => (
              <div 
                className="mb-8 p-6 bg-slate-800/50 border border-orange-500/30 rounded-lg backdrop-blur"
                style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
              >
                <p className="text-orange-200 text-lg">
                  &ldquo;Bem-vindo à Taberna do Alquimista. Aqui você encontra os itens mais raros e poderosos para sua jornada.
                  Cada objeto foi cuidadosamente selecionado para os Vigias mais corajosos.&rdquo;
                </p>
              </div>
            )}
          </Motion>

          {/* Filtros por categoria */}
          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 100 }), y: spring(0, { delay: 100 }) }}>
            {(style) => (
              <div 
                className="mb-8 flex flex-wrap gap-2"
                style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
              >
                {['all', 'weapon', 'armor', 'consumable', 'other'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category as any)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {category === 'all' && '📦 Todos'}
                    {category === 'weapon' && '⚔️ Armas'}
                    {category === 'armor' && '🛡️ Armaduras'}
                    {category === 'consumable' && '🧪 Consumíveis'}
                    {category === 'other' && '✨ Especiais'}
                  </button>
                ))}
              </div>
            )}
          </Motion>

          {/* Grid de itens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <Motion
                key={item.id}
                defaultStyle={{ opacity: 0, y: 20 }}
                style={{ opacity: spring(1, { delay: index * 50 }), y: spring(0, { delay: index * 50 }) }}
              >
                {(style) => (
                  <div
                    className={`${getRarityBg(item.rarity)} ${getRarityBorder(item.rarity)} border-2 rounded-lg p-6 backdrop-blur transition hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 group`}
                    style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                  >
                    {/* Cabeçalho do item */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-700/50 rounded-lg text-orange-400">
                          {getItemIcon(item.type)}
                        </div>
                        <div>
                          <h3 className={`font-bold text-lg ${getRarityColor(item.rarity)}`}>
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-400 capitalize">
                            {item.type === 'weapon' && 'Arma'}
                            {item.type === 'armor' && 'Armadura'}
                            {item.type === 'consumable' && 'Consumível'}
                            {item.type === 'other' && 'Especial'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Efeitos */}
                    {item.effect && (
                      <div className="mb-4 p-3 bg-slate-700/50 rounded border-l-2 border-orange-400">
                        <p className="text-orange-200 text-sm">
                          <strong>Efeito:</strong> {item.effect}
                        </p>
                      </div>
                    )}

                    {/* Estatísticas */}
                    {(item.damage || item.defense) && (
                      <div className="mb-4 space-y-1">
                        {item.damage && (
                          <p className="text-red-300 text-sm">
                            <Sword className="w-4 h-4 inline mr-1" />
                            Dano: <strong>+{item.damage}</strong>
                          </p>
                        )}
                        {item.defense && (
                          <p className="text-blue-300 text-sm">
                            <Shield className="w-4 h-4 inline mr-1" />
                            Defesa: <strong>+{item.defense}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Preço e botão */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-lg">{item.price}</span>
                      </div>
                      <button
                        onClick={() => handleBuyItem(item.id)}
                        disabled={buyingItem === item.id || profile.gold < item.price}
                        className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                          profile.gold < item.price
                            ? 'bg-slate-600 text-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {buyingItem === item.id ? 'Comprando...' : 'Comprar'}
                      </button>
                    </div>
                  </div>
                )}
              </Motion>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Nenhum item encontrado nesta categoria</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
