// Tipos para o sistema de perfil do usuário

export interface UserProfile {
  id: string; // Mesmo ID do documento
  userId: string; // ID do usuário Firebase (proprietário)
  email: string;
  username: string;
  class: string; // Ocultista, Especialista, Combatente
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mana?: number;
  maxMana?: number;
  strength: number; // Força
  dexterity: number; // Agilidade
  constitution: number; // Vigor
  intelligence: number; // Intelecto
  charisma: number; // Presença
  creatureKills: number; // Número de criaturas mortas
  playerKills?: number; // PvP kills
  deaths: number;
  gold: number;
  inventory: Item[];
  skills: Skill[];
  faction?: string; // Facção/Grupo do jogador
  description?: string;
  imageUrl?: string; // URL do avatar/boneco do jogador
  isMaster?: boolean; // Flag indicando se é conta mestre
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'other';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  quantity: number;
  damage?: number; // Para armas
  defense?: number; // Para armaduras
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  experience: number;
  description: string;
}

export interface Creature {
  id: string;
  name: string;
  type: string;
  level: number;
  experience: number;
  loot: Item[];
}

export interface RankingEntry {
  userId: string;
  username: string;
  userClass: string;
  creatureKills: number;
  playerKills: number;
  deaths: number;
  level: number;
  gold: number;
  rank: number;
}
