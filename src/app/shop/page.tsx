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
import { Wand2, Sword, Shield, Zap, ShoppingCart, Coins, ArrowLeft, ChevronRight, Info } from 'lucide-react';

export default function ShopPage() {
  const [user] = useAuthState(auth);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'weapon' | 'armor' | 'consumable' | 'other'>('all');
  const [buyingItem, setBuyingItem] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedItemForBuy, setSelectedItemForBuy] = useState<ShopItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<ShopItem | null>(null);

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
    ? items.filter(item => item.stock > 0)
    : items.filter(item => item.type === selectedCategory && item.stock > 0);

  const handleBuyItem = (itemId: string) => {
    if (!user || !profile) return;

    const item = items.find(i => i.id === itemId);
    
    if (!item) {
      setMessage({ text: 'Item não encontrado', type: 'error' });
      return;
    }

    // Abrir modal
    setSelectedItemForBuy(item);
    setBuyQuantity(1);
    setShowBuyModal(true);
  };

  const handleConfirmBuy = async () => {
    if (!user || !profile || !selectedItemForBuy) return;

    const totalPrice = selectedItemForBuy.price * buyQuantity;

    if (profile.gold < totalPrice) {
      setMessage({ text: `Ouro insuficiente! Faltam ${totalPrice - profile.gold}`, type: 'error' });
      return;
    }

    try {
      setBuyingItem(selectedItemForBuy.id);
      
      // Comprar múltiplas unidades
      for (let i = 0; i < buyQuantity; i++) {
        const success = await buyItem(user.uid, selectedItemForBuy.id, profile.id);
        if (!success) {
          throw new Error('Erro ao comprar item');
        }
      }

      setMessage({ 
        text: `${buyQuantity}x ${selectedItemForBuy.name} comprado${buyQuantity > 1 ? 's' : ''} com sucesso!`, 
        type: 'success' 
      });
      
      // Atualizar ouro
      setProfile({ ...profile, gold: profile.gold - totalPrice });
      
      // Fechar modal e recarregar itens
      setShowBuyModal(false);
      setSelectedItemForBuy(null);
      const updatedItems = await getShopItems();
      setItems(updatedItems);
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

  const handleShowDetails = (item: ShopItem) => {
    setSelectedItemForDetails(item);
    setShowDetailsModal(true);
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
                  ✨ TABERNA DO SILAS
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

          {/* Descrição temática */}
          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1), y: spring(0) }}>
            {(style) => (
              <div 
                className="mb-8 p-6 bg-gradient-to-r from-stone-800/40 via-amber-900/30 to-stone-800/40 border-2 border-yellow-700/40 rounded-xl backdrop-blur-sm shadow-lg"
                style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
              >
                <p className="text-amber-100 text-lg font-light leading-relaxed">
                  &ldquo;Bem-vindo à Taberna do Silas. Aqui você encontra os itens mais raros e poderosos para sua jornada.
                  Cada objeto foi cuidadosamente selecionado para os Vigias mais corajosos.&rdquo;
                </p>
              </div>
            )}
          </Motion>

          {/* Filtros por categoria */}
          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 100 }), y: spring(0, { delay: 100 }) }}>
            {(style) => (
              <div 
                className="mb-10 flex flex-wrap gap-3"
                style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
              >
                {['all', 'weapon', 'armor', 'consumable', 'other'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category as any)}
                    className={`px-5 py-3 rounded-lg font-bold text-sm transition transform hover:scale-105 ${
                      selectedCategory === category
                        ? 'bg-linear-to-r from-yellow-600 to-amber-600 text-white shadow-lg shadow-yellow-600/40 border border-yellow-500'
                        : 'bg-stone-700/50 border border-yellow-700/40 text-amber-100 hover:bg-stone-600/60 backdrop-blur'
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
                style={{ opacity: spring(1, { delay: index * 30 }), y: spring(0, { delay: index * 30 }) }}
              >
                {(style) => (
                  <div
                    className={`${getRarityBg(item.rarity)} ${getRarityBorder(item.rarity)} border-2 rounded-lg p-6 backdrop-blur-sm transition hover:scale-105 hover:shadow-2xl group`}
                    style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                  >
                    {/* Cabeçalho do item */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-stone-700/60 rounded-lg text-yellow-400">
                          {getItemIcon(item.type)}
                        </div>
                        <div>
                          <h3 className={`font-bold text-lg ${getRarityColor(item.rarity)}`}>
                            {item.name}
                          </h3>
                          <p className="text-xs text-amber-200/70 capitalize font-medium">
                            {item.type === 'weapon' && 'Arma'}
                            {item.type === 'armor' && 'Armadura'}
                            {item.type === 'consumable' && 'Consumível'}
                            {item.type === 'other' && 'Especial'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-amber-100/80 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Efeitos */}
                    {item.effect && (
                      <div className="mb-4 p-3 bg-stone-700/40 rounded-lg border-l-2 border-yellow-500/70">
                        <p className="text-yellow-200 text-sm font-medium">
                          <strong>Efeito:</strong> {item.effect}
                        </p>
                      </div>
                    )}

                    {/* Estatísticas */}
                    {(item.damage || item.defense) && (
                      <div className="mb-4 space-y-2">
                        {item.damage && (
                          <p className="text-red-400 text-sm font-medium">
                            <Sword className="w-4 h-4 inline mr-2" />
                            Dano: <strong>{item.damage}</strong>
                          </p>
                        )}
                        {item.defense && (
                          <p className="text-blue-400 text-sm font-medium">
                            <Shield className="w-4 h-4 inline mr-2" />
                            Defesa: <strong>{item.defense}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Preço e botão */}
                    <div className="pt-4 border-t border-yellow-700/30 mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-yellow-400" />
                          <span className="text-yellow-300 font-bold text-lg">{item.price}</span>
                        </div>
                        <span className="text-xs font-bold text-amber-300 bg-stone-700/60 px-3 py-1 rounded-full">
                          {item.stock} em estoque
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowDetails(item)}
                          className="flex-1 px-5 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 bg-stone-700/60 hover:bg-stone-700 text-amber-200 border border-yellow-700/40 hover:border-yellow-500"
                          title="Ver detalhes"
                        >
                          <Info className="w-4 h-4" />
                          Detalhes
                        </button>
                        <button
                          onClick={() => handleBuyItem(item.id)}
                          disabled={buyingItem === item.id || profile.gold < item.price}
                          className={`flex-1 px-5 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                            profile.gold < item.price
                              ? 'bg-stone-600/40 text-amber-800 cursor-not-allowed opacity-40 border border-stone-600'
                              : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white cursor-pointer border border-yellow-500 hover:shadow-lg hover:shadow-yellow-600/40'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {buyingItem === item.id ? 'Comprando...' : 'Comprar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Motion>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-amber-200/60 text-lg">Nenhum item encontrado nesta categoria</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Compra */}
      {showBuyModal && selectedItemForBuy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Motion
            defaultStyle={{ opacity: 0, scale: 0.9 }}
            style={{ opacity: spring(1), scale: spring(1) }}
          >
            {(style) => (
              <div
                className="bg-gradient-to-br from-stone-800 to-stone-900 border-2 border-yellow-700/60 rounded-xl p-8 max-w-md w-full shadow-2xl"
                style={{ opacity: style.opacity, transform: `scale(${style.scale})` }}
              >
                <h2 className="text-2xl font-bold text-amber-300 mb-2">{selectedItemForBuy.name}</h2>
                <p className="text-amber-100/70 text-sm mb-6">{selectedItemForBuy.description}</p>

                <div className="bg-stone-700/40 border border-yellow-700/30 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-100">Preço por unidade:</span>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 font-bold">{selectedItemForBuy.price}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-amber-100">Estoque disponível:</span>
                    <span className="text-emerald-400 font-bold">{selectedItemForBuy.stock}</span>
                  </div>

                  <div className="border-t border-yellow-700/20 pt-3">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-amber-100">Quantidade:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                          className="w-8 h-8 bg-stone-600/60 hover:bg-stone-600 text-amber-300 rounded-lg font-bold transition"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={selectedItemForBuy.stock}
                          value={buyQuantity}
                          onChange={(e) => setBuyQuantity(Math.max(1, Math.min(selectedItemForBuy.stock, Number(e.target.value))))}
                          className="w-12 text-center bg-stone-800/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                        />
                        <button
                          onClick={() => setBuyQuantity(Math.min(selectedItemForBuy.stock, buyQuantity + 1))}
                          className="w-8 h-8 bg-stone-600/60 hover:bg-stone-600 text-amber-300 rounded-lg font-bold transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-yellow-700/20">
                      <span className="text-amber-100 font-semibold">Total:</span>
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300 font-bold text-lg">
                          {selectedItemForBuy.price * buyQuantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {profile && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-amber-100/70">Seu ouro:</span>
                      <span className={profile.gold >= selectedItemForBuy.price * buyQuantity ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {profile.gold}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="flex-1 bg-stone-700/60 hover:bg-stone-700 text-amber-100 px-6 py-3 rounded-lg font-bold transition border border-yellow-700/40"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmBuy}
                    disabled={buyingItem === selectedItemForBuy.id || (profile && profile.gold < selectedItemForBuy.price * buyQuantity)}
                    className={`flex-1 px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                      profile && profile.gold >= selectedItemForBuy.price * buyQuantity
                        ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white cursor-pointer border border-yellow-500'
                        : 'bg-stone-600/40 text-amber-800 cursor-not-allowed opacity-40 border border-stone-600'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {buyingItem === selectedItemForBuy.id ? 'Comprando...' : 'Confirmar Compra'}
                  </button>
                </div>
              </div>
            )}
          </Motion>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedItemForDetails && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Motion
            defaultStyle={{ opacity: 0, scale: 0.9 }}
            style={{ opacity: spring(1), scale: spring(1) }}
          >
            {(style) => (
              <div
                className="bg-gradient-to-br from-stone-800 to-stone-900 border-2 border-yellow-700/60 rounded-xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                style={{ opacity: style.opacity, transform: `scale(${style.scale})` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-amber-300 mb-2">{selectedItemForDetails.name}</h2>
                    <p className="text-amber-100/70 text-sm">
                      {selectedItemForDetails.type === 'weapon' && '⚔️ Arma'}
                      {selectedItemForDetails.type === 'armor' && '🛡️ Armadura'}
                      {selectedItemForDetails.type === 'consumable' && '⚡ Consumível'}
                      {selectedItemForDetails.type === 'other' && '✨ Especial'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-amber-300 hover:text-amber-200 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-stone-700/40 border border-yellow-700/30 rounded-lg p-6 mb-6 space-y-4">
                  {/* Raridade */}
                  <div>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      selectedItemForDetails.rarity === 'common' ? 'bg-stone-700/50 text-stone-300' :
                      selectedItemForDetails.rarity === 'uncommon' ? 'bg-emerald-700/50 text-emerald-300' :
                      selectedItemForDetails.rarity === 'rare' ? 'bg-blue-700/50 text-blue-300' :
                      selectedItemForDetails.rarity === 'epic' ? 'bg-purple-700/50 text-purple-300' :
                      'bg-yellow-700/50 text-yellow-300'
                    }`}>
                      {selectedItemForDetails.rarity === 'common' && '⚪ Comum'}
                      {selectedItemForDetails.rarity === 'uncommon' && '🟢 Incomum'}
                      {selectedItemForDetails.rarity === 'rare' && '🔵 Raro'}
                      {selectedItemForDetails.rarity === 'epic' && '🟣 Épico'}
                      {selectedItemForDetails.rarity === 'legendary' && '⭐ Lendário'}
                    </span>
                  </div>

                  {/* Descrição */}
                  <div>
                    <p className="text-amber-100/70 text-sm font-semibold mb-2">Descrição</p>
                    <p className="text-gray-200 text-sm leading-relaxed">{selectedItemForDetails.description}</p>
                  </div>

                  {/* Efeito */}
                  {selectedItemForDetails.effect && (
                    <div className="border-t border-yellow-700/20 pt-4">
                      <p className="text-amber-100/70 text-sm font-semibold mb-2">Efeito Especial</p>
                      <p className="text-yellow-300 text-sm">{selectedItemForDetails.effect}</p>
                    </div>
                  )}

                  {/* Estatísticas */}
                  {(selectedItemForDetails.damage || selectedItemForDetails.defense) && (
                    <div className="border-t border-yellow-700/20 pt-4 space-y-2">
                      {selectedItemForDetails.damage && (
                        <div className="flex items-center gap-3">
                          <Sword className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-red-400 text-sm font-semibold">Dano</p>
                            <p className="text-gray-300">{selectedItemForDetails.damage}</p>
                          </div>
                        </div>
                      )}
                      {selectedItemForDetails.defense && (
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-blue-400 text-sm font-semibold">Defesa</p>
                            <p className="text-gray-300">{selectedItemForDetails.defense}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preço e Estoque */}
                  <div className="border-t border-yellow-700/20 pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-amber-100/70 text-sm font-semibold mb-1">Preço</p>
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <p className="text-yellow-300 text-lg font-bold">{selectedItemForDetails.price}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-amber-100/70 text-sm font-semibold mb-1">Estoque</p>
                      <p className={`text-lg font-bold ${selectedItemForDetails.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedItemForDetails.stock > 0 ? `${selectedItemForDetails.stock} disponível` : 'Esgotado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 bg-stone-700/60 hover:bg-stone-700 text-amber-100 px-6 py-3 rounded-lg font-bold transition border border-yellow-700/40"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleBuyItem(selectedItemForDetails.id);
                    }}
                    disabled={selectedItemForDetails.stock <= 0 || (profile && profile.gold < selectedItemForDetails.price)}
                    className={`flex-1 px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                      selectedItemForDetails.stock > 0 && profile && profile.gold >= selectedItemForDetails.price
                        ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white cursor-pointer border border-yellow-500'
                        : 'bg-stone-600/40 text-amber-800 cursor-not-allowed opacity-40 border border-stone-600'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Comprar Agora
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
