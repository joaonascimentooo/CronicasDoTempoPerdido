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
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, RankingEntry } from './types';

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
    await setDoc(doc(db, 'profiles', userId), {
      ...newProfile,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
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
