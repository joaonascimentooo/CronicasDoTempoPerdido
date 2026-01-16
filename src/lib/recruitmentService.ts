import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

export interface Agent {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stats: {
    strength: number;
    speed: number;
    endurance: number;
    intelligence: number;
  };
  specialAbility: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt: number;
}

export const getAgents = async (): Promise<Agent[]> => {
  try {
    const agentsRef = collection(db, 'agents');
    const querySnapshot = await getDocs(agentsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Agent));
  } catch (error) {
    console.error('Erro ao buscar agentes:', error);
    throw error;
  }
};

export const createAgent = async (agent: Omit<Agent, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const agentsRef = collection(db, 'agents');
    const docRef = await addDoc(agentsRef, {
      ...agent,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar agente:', error);
    throw error;
  }
};

export const updateAgent = async (agentId: string, updates: Partial<Agent>): Promise<void> => {
  try {
    const agentRef = doc(db, 'agents', agentId);
    await updateDoc(agentRef, updates);
  } catch (error) {
    console.error('Erro ao atualizar agente:', error);
    throw error;
  }
};

export const deleteAgent = async (agentId: string): Promise<void> => {
  try {
    const agentRef = doc(db, 'agents', agentId);
    await deleteDoc(agentRef);
  } catch (error) {
    console.error('Erro ao deletar agente:', error);
    throw error;
  }
};

export const recruitAgent = async (userId: string, agentId: string, userProfileId: string): Promise<boolean> => {
  try {
    const agent = await getAgents().then(agents => agents.find(a => a.id === agentId));
    
    if (!agent) {
      throw new Error('Agente não encontrado');
    }

    // Adicionar agente ao perfil do usuário
    const userRef = doc(db, 'users', userProfileId);
    const recruitedsRef = collection(userRef, 'recruitedAgents');
    
    await addDoc(recruitedsRef, {
      agentId,
      agentName: agent.name,
      agentImage: agent.imageUrl,
      recruitedAt: Date.now(),
      level: 1,
      experience: 0
    });

    return true;
  } catch (error) {
    console.error('Erro ao recrutar agente:', error);
    throw error;
  }
};

export const getRecruitedAgents = async (userProfileId: string) => {
  try {
    const userRef = doc(db, 'users', userProfileId);
    const recruitedsRef = collection(userRef, 'recruitedAgents');
    const querySnapshot = await getDocs(recruitedsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar agentes recrutados:', error);
    return [];
  }
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common':
      return 'text-gray-300';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-400';
    case 'legendary':
      return 'text-yellow-400';
    default:
      return 'text-gray-300';
  }
};

export const getRarityBg = (rarity: string): string => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-900/40';
    case 'rare':
      return 'bg-blue-900/40';
    case 'epic':
      return 'bg-purple-900/40';
    case 'legendary':
      return 'bg-yellow-900/40';
    default:
      return 'bg-gray-900/40';
  }
};

export const getRarityBorder = (rarity: string): string => {
  switch (rarity) {
    case 'common':
      return 'border-gray-600';
    case 'rare':
      return 'border-blue-600';
    case 'epic':
      return 'border-purple-600';
    case 'legendary':
      return 'border-yellow-600';
    default:
      return 'border-gray-600';
  }
};
