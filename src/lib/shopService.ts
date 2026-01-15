import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, addDoc, deleteDoc, query, where } from 'firebase/firestore';
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
  effect?: string;
  createdBy?: string;
  createdAt?: Date;
}

// Obter todos os itens da loja
export async function getShopItems(): Promise<ShopItem[]> {
  try {
    const shopCollection = collection(db, 'shopItems');
    const snapshot = await getDocs(shopCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ShopItem[];
  } catch (error) {
    console.error('Erro ao obter itens da loja:', error);
    return [];
  }
}

// Obter um item específico
export async function getShopItem(itemId: string): Promise<ShopItem | null> {
  try {
    const items = await getShopItems();
    return items.find(item => item.id === itemId) || null;
  } catch (error) {
    console.error('Erro ao obter item:', error);
    return null;
  }
}

// Adicionar novo item à loja
export async function addShopItem(item: Omit<ShopItem, 'id'>, userId: string): Promise<string> {
  try {
    const shopCollection = collection(db, 'shopItems');
    const docRef = await addDoc(shopCollection, {
      ...item,
      createdBy: userId,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    throw error;
  }
}

// Atualizar item da loja
export async function updateShopItem(itemId: string, updates: Partial<ShopItem>): Promise<void> {
  try {
    const itemRef = doc(db, 'shopItems', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    throw error;
  }
}

// Deletar item da loja
export async function deleteShopItem(itemId: string): Promise<void> {
  try {
    const itemRef = doc(db, 'shopItems', itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    throw error;
  }
}

// Comprar item
export async function buyItem(userId: string, itemId: string, profileId: string): Promise<boolean> {
  try {
    const item = await getShopItem(itemId);
    if (!item) return false;

    const userRef = doc(db, 'profiles', profileId);
    const { getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    const currentGold = userData.gold || 0;
    
    if (currentGold < item.price) {
      throw new Error('Ouro insuficiente');
    }

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
      return 'text-stone-400';
    case 'uncommon':
      return 'text-emerald-400';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-400';
    case 'legendary':
      return 'text-yellow-400';
    default:
      return 'text-amber-100';
  }
}

export function getRarityBg(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'bg-stone-800/40';
    case 'uncommon':
      return 'bg-emerald-900/20';
    case 'rare':
      return 'bg-blue-900/20';
    case 'epic':
      return 'bg-purple-900/20';
    case 'legendary':
      return 'bg-yellow-900/30';
    default:
      return 'bg-stone-900/40';
  }
}

export function getRarityBorder(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'border-stone-600';
    case 'uncommon':
      return 'border-emerald-600/60';
    case 'rare':
      return 'border-blue-600/60';
    case 'epic':
      return 'border-purple-600/60';
    case 'legendary':
      return 'border-yellow-600/60';
    default:
      return 'border-stone-600/50';
  }
}
