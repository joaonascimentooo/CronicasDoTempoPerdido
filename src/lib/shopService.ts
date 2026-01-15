import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Item } from '@/lib/types';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'other';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price: number;
  quantity?: number;
  damage?: number;
  defense?: number;
  imageUrl?: string;
  effect?: string; // Descrição de efeito especial
}

const shopItemsData: ShopItem[] = [
  // Armas
  {
    id: 'sword-iron',
    name: 'Espada de Ferro',
    description: 'Uma espada comum feita de ferro puro',
    type: 'weapon',
    rarity: 'common',
    price: 100,
    damage: 5,
    effect: 'Dano: +5'
  },
  {
    id: 'sword-steel',
    name: 'Espada de Aço',
    description: 'Uma arma bem equilibrada forjada em aço fino',
    type: 'weapon',
    rarity: 'uncommon',
    price: 250,
    damage: 8,
    effect: 'Dano: +8'
  },
  {
    id: 'dagger-venom',
    name: 'Punhal Envenenado',
    description: 'Lâmina fina untada com veneno paralisante',
    type: 'weapon',
    rarity: 'rare',
    price: 500,
    damage: 6,
    effect: 'Paralisa inimigos por 2 turnos'
  },
  {
    id: 'staff-arcane',
    name: 'Cajado Arcano',
    description: 'Uma varinha antiga que canaliza a magia primordial',
    type: 'weapon',
    rarity: 'epic',
    price: 1500,
    damage: 10,
    effect: 'Aumenta Inteligência em +3, Dano Mágico: +15'
  },
  
  // Armaduras
  {
    id: 'armor-leather',
    name: 'Armadura de Couro',
    description: 'Proteção leve e flexível',
    type: 'armor',
    rarity: 'common',
    price: 150,
    defense: 3,
    effect: 'Defesa: +3'
  },
  {
    id: 'armor-chain',
    name: 'Armadura de Malha',
    description: 'Proteção sólida em forma de anéis metálicos',
    type: 'armor',
    rarity: 'uncommon',
    price: 350,
    defense: 6,
    effect: 'Defesa: +6'
  },
  {
    id: 'armor-plate',
    name: 'Armadura de Placas',
    description: 'Proteção pesada e resistente',
    type: 'armor',
    rarity: 'rare',
    price: 800,
    defense: 10,
    effect: 'Defesa: +10'
  },
  {
    id: 'armor-mystical',
    name: 'Armadura Mística',
    description: 'Feita de um material raro que absorve magia',
    type: 'armor',
    rarity: 'epic',
    price: 2000,
    defense: 12,
    effect: 'Defesa: +12, Resistência Mágica: +20%'
  },

  // Consumíveis
  {
    id: 'potion-health-small',
    name: 'Poção de Cura Menor',
    description: 'Recupera 30 pontos de vida',
    type: 'consumable',
    rarity: 'common',
    price: 50,
    quantity: 1,
    effect: 'Cura: +30 HP'
  },
  {
    id: 'potion-health-medium',
    name: 'Poção de Cura',
    description: 'Recupera 80 pontos de vida',
    type: 'consumable',
    rarity: 'uncommon',
    price: 120,
    quantity: 1,
    effect: 'Cura: +80 HP'
  },
  {
    id: 'potion-mana',
    name: 'Frasco de Mana',
    description: 'Restaura 50 pontos de mana',
    type: 'consumable',
    rarity: 'uncommon',
    price: 150,
    quantity: 1,
    effect: 'Recupera: +50 Mana'
  },
  {
    id: 'potion-strength',
    name: 'Elixir da Força',
    description: 'Aumenta força em +5 por 10 minutos',
    type: 'consumable',
    rarity: 'rare',
    price: 300,
    quantity: 1,
    effect: 'Força: +5 (10 min)'
  },
  {
    id: 'potion-invincibility',
    name: 'Poção da Invencibilidade',
    description: 'Torna o usuário invulnerável por 1 minuto',
    type: 'consumable',
    rarity: 'epic',
    price: 1000,
    quantity: 1,
    effect: 'Invulnerabilidade: 60s'
  },

  // Itens especiais
  {
    id: 'crystal-mana',
    name: 'Cristal de Mana',
    description: 'Uma gema brilhante que contém energia mágica pura',
    type: 'other',
    rarity: 'rare',
    price: 400,
    effect: 'Componente alquímico'
  },
  {
    id: 'rune-strength',
    name: 'Runa de Força',
    description: 'Uma runa antiga que concede poder bruto',
    type: 'other',
    rarity: 'epic',
    price: 750,
    effect: 'Aumenta Força permanentemente em +2'
  },
];

export async function getShopItems(): Promise<ShopItem[]> {
  return shopItemsData;
}

export async function getShopItem(itemId: string): Promise<ShopItem | null> {
  return shopItemsData.find(item => item.id === itemId) || null;
}

export async function buyItem(userId: string, itemId: string, profileId: string): Promise<boolean> {
  try {
    const item = await getShopItem(itemId);
    if (!item) return false;

    const userRef = doc(db, 'profiles', profileId);
    const userDoc = await (await import('firebase/firestore')).getDoc(userRef);
    
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    const currentGold = userData.gold || 0;
    
    if (currentGold < item.price) {
      throw new Error('Ouro insuficiente');
    }

    // Criar item do inventário
    const inventoryItem: Item = {
      id: `${itemId}-${Date.now()}`,
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      description: item.description,
      quantity: item.quantity || 1,
      damage: item.damage,
      defense: item.defense,
    };

    // Atualizar perfil do usuário
    await updateDoc(userRef, {
      gold: currentGold - item.price,
      inventory: arrayUnion(inventoryItem),
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error('Erro ao comprar item:', error);
    return false;
  }
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-400';
    case 'uncommon':
      return 'text-green-400';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-400';
    case 'legendary':
      return 'text-yellow-400';
    default:
      return 'text-white';
  }
}

export function getRarityBg(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-900';
    case 'uncommon':
      return 'bg-green-900/20';
    case 'rare':
      return 'bg-blue-900/20';
    case 'epic':
      return 'bg-purple-900/20';
    case 'legendary':
      return 'bg-yellow-900/20';
    default:
      return 'bg-slate-900';
  }
}

export function getRarityBorder(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'border-gray-600';
    case 'uncommon':
      return 'border-green-600';
    case 'rare':
      return 'border-blue-600';
    case 'epic':
      return 'border-purple-600';
    case 'legendary':
      return 'border-yellow-600';
    default:
      return 'border-slate-600';
  }
}
