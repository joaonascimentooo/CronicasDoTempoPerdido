'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { isMasterEmail } from '@/lib/profileService';
import { getShopItems, addShopItem, updateShopItem, deleteShopItem, ShopItem } from '@/lib/shopService';
import { Motion, spring } from '@/lib/MotionWrapper';
import { ArrowLeft, Plus, Trash2, Edit2, X } from 'lucide-react';

export default function ShopItemsManagement() {
  const [user] = useAuthState(auth);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState<Partial<ShopItem>>({
    name: '',
    description: '',
    type: 'weapon',
    rarity: 'common',
    price: 0,
    damage: 0,
    defense: 0,
    effect: '',
  });

  useEffect(() => {
    loadItems();
  }, [user]);

  const loadItems = async () => {
    if (!user || !isMasterEmail(user.email || '')) return;

    try {
      const shopItems = await getShopItems();
      setItems(shopItems);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !formData.name || !formData.description || formData.price === undefined) {
      setMessage({ text: 'Preencha todos os campos obrigatórios', type: 'error' });
      return;
    }

    try {
      if (editingId) {
        await updateShopItem(editingId, formData);
        setMessage({ text: 'Item atualizado com sucesso!', type: 'success' });
      } else {
        await addShopItem(formData as Omit<ShopItem, 'id'>, user.uid);
        setMessage({ text: 'Item adicionado com sucesso!', type: 'success' });
      }

      setFormData({
        name: '',
        description: '',
        type: 'weapon',
        rarity: 'common',
        price: 0,
        damage: 0,
        defense: 0,
        effect: '',
      });
      setEditingId(null);
      setShowForm(false);
      loadItems();
    } catch (error) {
      setMessage({ text: 'Erro ao salvar item', type: 'error' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleEdit = (item: ShopItem) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return;

    try {
      await deleteShopItem(itemId);
      setMessage({ text: 'Item deletado com sucesso!', type: 'success' });
      loadItems();
    } catch (error) {
      setMessage({ text: 'Erro ao deletar item', type: 'error' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      type: 'weapon',
      rarity: 'common',
      price: 0,
      damage: 0,
      defense: 0,
      effect: '',
    });
  };

  if (!user || !isMasterEmail(user.email || '')) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Você não tem permissão para acessar esta página</p>
          <Link href="/master" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #3a2f28 0%, #2d1f18 50%, #3a2f28 100%)',
    }}>
      {/* Background */}
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(167, 139, 250, 0.2), transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.2), transparent 50%)',
      }}></div>

      <div className="fixed top-0 left-0 w-96 h-96 bg-yellow-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-yellow-700/30 bg-gradient-to-r from-stone-800/60 via-amber-900/40 to-stone-800/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/master" className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition font-semibold">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-yellow-300 to-amber-400">
              ✨ GERENCIAR ITENS DA LOJA
            </h1>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white px-6 py-2 rounded-lg font-bold border border-yellow-500"
            >
              <Plus className="w-5 h-5" />
              Novo Item
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
                      {editingId ? 'Editar Item' : 'Novo Item'}
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
                        <label className="block text-amber-100 font-semibold mb-2">Nome *</label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-yellow-500"
                          placeholder="Nome do item"
                        />
                      </div>

                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Preço *</label>
                        <input
                          type="number"
                          value={formData.price || 0}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Tipo *</label>
                        <select
                          value={formData.type || 'weapon'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as ShopItem['type'] })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                        >
                          <option value="weapon">Arma</option>
                          <option value="armor">Armadura</option>
                          <option value="consumable">Consumível</option>
                          <option value="quest">Quest</option>
                          <option value="other">Especial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Raridade *</label>
                        <select
                          value={formData.rarity || 'common'}
                          onChange={(e) => setFormData({ ...formData, rarity: e.target.value as ShopItem['rarity'] })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                        >
                          <option value="common">Comum</option>
                          <option value="uncommon">Incomum</option>
                          <option value="rare">Raro</option>
                          <option value="epic">Épico</option>
                          <option value="legendary">Lendário</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Dano</label>
                        <input
                          type="number"
                          value={formData.damage || 0}
                          onChange={(e) => setFormData({ ...formData, damage: Number(e.target.value) })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-amber-100 font-semibold mb-2">Defesa</label>
                        <input
                          type="number"
                          value={formData.defense || 0}
                          onChange={(e) => setFormData({ ...formData, defense: Number(e.target.value) })}
                          className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-500"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-amber-100 font-semibold mb-2">Descrição *</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-yellow-500 resize-none"
                        placeholder="Descrição do item"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-amber-100 font-semibold mb-2">Efeito</label>
                      <textarea
                        value={formData.effect || ''}
                        onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
                        className="w-full px-4 py-2 bg-stone-900/60 border border-yellow-700/40 rounded-lg text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-yellow-500 resize-none"
                        placeholder="Descrição do efeito especial"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-6 py-3 rounded-lg font-bold transition"
                      >
                        {editingId ? 'Atualizar Item' : 'Criar Item'}
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

          {/* Lista de itens */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-amber-300 mt-4">Carregando itens...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-amber-200 font-semibold">
                  Total de itens: <span className="text-yellow-300">{items.length}</span>
                </p>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 bg-stone-800/30 border-2 border-yellow-700/40 rounded-xl">
                  <p className="text-amber-200/60 text-lg">Nenhum item na loja ainda</p>
                  <p className="text-amber-200/50 mt-2">Clique em "Novo Item" para adicionar o primeiro item</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item, index) => (
                    <Motion
                      key={item.id}
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
                              <h3 className="text-lg font-bold text-yellow-300">{item.name}</h3>
                              <p className="text-xs text-amber-200/70 capitalize">
                                {item.type === 'weapon' && 'Arma'}
                                {item.type === 'armor' && 'Armadura'}
                                {item.type === 'consumable' && 'Consumível'}
                                {item.type === 'quest' && 'Quest'}
                                {item.type === 'other' && 'Especial'}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.rarity === 'common' ? 'bg-stone-600/50 text-stone-300' :
                              item.rarity === 'uncommon' ? 'bg-emerald-600/30 text-emerald-300' :
                              item.rarity === 'rare' ? 'bg-blue-600/30 text-blue-300' :
                              item.rarity === 'epic' ? 'bg-purple-600/30 text-purple-300' :
                              'bg-yellow-600/30 text-yellow-300'
                            }`}>
                              {item.rarity === 'common' && 'Comum'}
                              {item.rarity === 'uncommon' && 'Incomum'}
                              {item.rarity === 'rare' && 'Raro'}
                              {item.rarity === 'epic' && 'Épico'}
                              {item.rarity === 'legendary' && 'Lendário'}
                            </span>
                          </div>

                          <p className="text-amber-100/80 text-sm mb-3 line-clamp-2">{item.description}</p>

                          {item.effect && (
                            <p className="text-yellow-200 text-sm mb-3 border-l-2 border-yellow-500/70 pl-3">
                              <strong>Efeito:</strong> {item.effect}
                            </p>
                          )}

                          <div className="mb-4 space-y-1">
                            {item.damage ? (
                              <p className="text-red-400 text-sm">Dano: +{item.damage}</p>
                            ) : null}
                            {item.defense ? (
                              <p className="text-blue-400 text-sm">Defesa: +{item.defense}</p>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-yellow-700/30">
                            <span className="text-yellow-300 font-bold">{item.price} ouro</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded-lg transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-600/40 hover:bg-red-600/60 text-red-300 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
