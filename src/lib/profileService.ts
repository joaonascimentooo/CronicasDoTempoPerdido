import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  collection,
  orderBy,
  limit,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, RankingEntry } from './types';

const MASTER_EMAIL = 'joaonascimento197@gmail.com';

// Verificar se um usuário é mestre
export function isMasterEmail(email: string): boolean {
  return email === MASTER_EMAIL;
}

// Criar ou inicializar perfil de usuário
export async function createUserProfile(
  userId: string,
  profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const newProfile: UserProfile = {
      ...profileData,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Remover campos undefined antes de salvar
    const dataToSave = Object.fromEntries(
      Object.entries({
        ...newProfile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }).filter(([, value]) => value !== undefined)
    );
    
    await setDoc(doc(db, 'profiles', userId), dataToSave);
    return newProfile;
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    throw error;
  }
}

// Buscar perfil do usuário
export async function getUserProfile(userId: string) {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    throw error;
  }
}

// Atualizar perfil do usuário
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    const docRef = doc(db, 'profiles', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { id: userId, ...updates };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
}

// Deletar perfil do usuário
export async function deleteUserProfile(userId: string) {
  try {
    await deleteDoc(doc(db, 'profiles', userId));
  } catch (error) {
    console.error('Erro ao deletar perfil:', error);
    throw error;
  }
}

// Registrar morte de criatura
export async function killCreature(
  userId: string,
  creaturesKilled: number = 1,
  experienceGain: number = 0,
  lootGold: number = 0
) {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) throw new Error('Perfil não encontrado');

    const newLevel = Math.floor((profile.experience + experienceGain) / 100) + 1;

    await updateUserProfile(userId, {
      creatureKills: profile.creatureKills + creaturesKilled,
      experience: profile.experience + experienceGain,
      level: newLevel,
      gold: profile.gold + lootGold,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao registrar morte de criatura:', error);
    throw error;
  }
}

// Obter ranking global
export async function getGlobalRanking(limitResults: number = 100): Promise<RankingEntry[]> {
  try {
    const q = query(
      collection(db, 'profiles'),
      orderBy('creatureKills', 'desc'),
      limit(limitResults)
    );
    const querySnapshot = await getDocs(q);
    const ranking: RankingEntry[] = [];
    let rank = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserProfile;
      ranking.push({
        userId: data.id,
        username: data.username,
        userClass: data.class,
        creatureKills: data.creatureKills,
        playerKills: data.playerKills || 0,
        deaths: data.deaths,
        level: data.level,
        gold: data.gold,
        rank: rank++,
      });
    });
    return ranking;
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    throw error;
  }
}

// Obter ranking por classe
export async function getClassRanking(userClass: string, limitResults: number = 50) {
  try {
    const q = query(
      collection(db, 'profiles'),
      orderBy('creatureKills', 'desc'),
      limit(limitResults)
    );
    const querySnapshot = await getDocs(q);
    const ranking: RankingEntry[] = [];
    let rank = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserProfile;
      if (data.class === userClass) {
        ranking.push({
          userId: data.id,
          username: data.username,
          userClass: data.class,
          creatureKills: data.creatureKills,
          playerKills: data.playerKills || 0,
          deaths: data.deaths,
          level: data.level,
          gold: data.gold,
          rank: rank++,
        });
      }
    });
    return ranking;
  } catch (error) {
    console.error('Erro ao buscar ranking por classe:', error);
    throw error;
  }
}

// Obter top 10 perfis
export async function getTopProfiles(limitResults: number = 10) {
  try {
    const q = query(
      collection(db, 'profiles'),
      orderBy('level', 'desc'),
      limit(limitResults)
    );
    const querySnapshot = await getDocs(q);
    const profiles: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      profiles.push({ id: doc.id, ...doc.data() } as UserProfile);
    });
    return profiles;
  } catch (error) {
    console.error('Erro ao buscar top perfis:', error);
    throw error;
  }
}

// Obter TODOS os perfis (para mestre gerenciar)
export async function getAllProfiles(): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, 'profiles'),
      orderBy('username', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const profiles: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      profiles.push({ id: doc.id, ...doc.data() } as UserProfile);
    });
    return profiles;
  } catch (error) {
    console.error('Erro ao buscar todos os perfis:', error);
    throw error;
  }
}

// Funções para Mestre

// Criar um novo personagem como mestre
export async function createMasterCharacter(
  masterUserId: string,
  characterData: Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
) {
  try {
    const docId = `${masterUserId}_${Date.now()}`;
    const newProfile: UserProfile = {
      ...characterData,
      id: docId,
      userId: masterUserId,
      isMaster: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dataToSave = Object.fromEntries(
      Object.entries({
        ...newProfile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }).filter(([, value]) => value !== undefined)
    );

    await setDoc(doc(db, 'profiles', docId), dataToSave);
    return newProfile;
  } catch (error) {
    console.error('Erro ao criar personagem de mestre:', error);
    throw error;
  }
}

// Obter todos os personagens do mestre
export async function getMasterCharacters(masterUserId: string): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, 'profiles'),
      where('userId', '==', masterUserId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const profiles: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      profiles.push({ id: doc.id, ...doc.data() } as UserProfile);
    });
    return profiles;
  } catch (error) {
    console.error('Erro ao buscar personagens do mestre:', error);
    throw error;
  }
}

// Atualizar qualquer perfil (apenas mestre)
export async function masterUpdateProfile(profileId: string, updates: Partial<UserProfile>) {
  try {
    const docRef = doc(db, 'profiles', profileId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { id: profileId, ...updates };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
}

// Deletar qualquer perfil (apenas mestre)
export async function masterDeleteProfile(profileId: string) {
  try {
    await deleteDoc(doc(db, 'profiles', profileId));
  } catch (error) {
    console.error('Erro ao deletar perfil:', error);
    throw error;
  }
}
