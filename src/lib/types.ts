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
  isDeceased?: boolean; // Flag indicando se o personagem está morto
  causeOfDeath?: string; // Causa da morte do personagem
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
  profileId: string; // ID do documento do perfil
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

export interface Team {
  id: string; // ID do documento
  name: string; // Nome da equipe
  description?: string;
  leaderId: string; // ID do criador/líder da equipe
  leaderName: string; // Nome do líder
  members: TeamMember[]; // Membros da equipe
  maxMembers: number; // Número máximo de membros
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  userId: string;
  username: string;
  role: 'leader' | 'member';
  joinedAt: Date;
  isDeceased?: boolean;
}
export interface Mission {
  id: string; // ID do documento
  title: string; // Nome da missão
  description: string; // Descrição completa
  createdBy: string; // ID do mestre que criou
  createdByName: string; // Nome do mestre
  status: 'available' | 'in-progress' | 'completed'; // Status da missão
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'; // Dificuldade
  reward: {
    experience: number;
    gold: number;
    items?: Item[];
  };
  requirements?: {
    minLevel?: number;
    requiredClass?: string[];
    requiredTeam?: boolean;
  };
  acceptedBy?: string[]; // IDs dos usuários que aceitaram
  completedBy?: string[]; // IDs dos usuários que completaram
  createdAt: Date;
  updatedAt: Date;
}