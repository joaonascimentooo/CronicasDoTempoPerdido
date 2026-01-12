import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Character, RankingEntry } from './types';

// Criar novo personagem
export async function createCharacter(character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = doc(collection(db, 'characters'));
    const newCharacter: Character = {
      ...character,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(docRef, {
      ...newCharacter,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return newCharacter;
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    throw error;
  }
}

// Buscar personagem por ID
export async function getCharacter(characterId: string) {
  try {
    const docRef = doc(db, 'characters', characterId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Character;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar personagem:', error);
    throw error;
  }
}

// Buscar todos os personagens de um usuário
export async function getUserCharacters(userId: string) {
  try {
    const q = query(
      collection(db, 'characters'),
      where('userId', '==', userId),
      orderBy('level', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      characters.push({ id: doc.id, ...doc.data() } as Character);
    });
    return characters;
  } catch (error) {
    console.error('Erro ao buscar personagens do usuário:', error);
    throw error;
  }
}

// Atualizar personagem
export async function updateCharacter(characterId: string, updates: Partial<Character>) {
  try {
    const docRef = doc(db, 'characters', characterId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { id: characterId, ...updates };
  } catch (error) {
    console.error('Erro ao atualizar personagem:', error);
    throw error;
  }
}

// Deletar personagem
export async function deleteCharacter(characterId: string) {
  try {
    await deleteDoc(doc(db, 'characters', characterId));
  } catch (error) {
    console.error('Erro ao deletar personagem:', error);
    throw error;
  }
}

// Registrar morte de criatura
export async function killCreature(
  characterId: string,
  creaturesKilled: number = 1,
  experienceGain: number = 0,
  lootGold: number = 0
) {
  try {
    const character = await getCharacter(characterId);
    if (!character) throw new Error('Personagem não encontrado');

    const newLevel = Math.floor((character.experience + experienceGain) / 100) + 1;

    await updateCharacter(characterId, {
      creatureKills: character.creatureKills + creaturesKilled,
      experience: character.experience + experienceGain,
      level: newLevel,
      gold: character.gold + lootGold,
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
      collection(db, 'characters'),
      orderBy('creatureKills', 'desc'),
      limit(limitResults)
    );
    const querySnapshot = await getDocs(q);
    const ranking: RankingEntry[] = [];
    let rank = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Character;
      ranking.push({
        userId: data.userId,
        characterName: data.name,
        characterClass: data.class,
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
export async function getClassRanking(characterClass: string, limitResults: number = 50) {
  try {
    const q = query(
      collection(db, 'characters'),
      where('class', '==', characterClass),
      orderBy('creatureKills', 'desc'),
      limit(limitResults)
    );
    const querySnapshot = await getDocs(q);
    const ranking: RankingEntry[] = [];
    let rank = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Character;
      ranking.push({
        userId: data.userId,
        characterName: data.name,
        characterClass: data.class,
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
    console.error('Erro ao buscar ranking por classe:', error);
    throw error;
  }
}

// Obter top 10 personagens
export async function getTopCharacters(limitResults: number = 10) {
  try {
    const q = query(
      collection(db, 'characters'),
      orderBy('level', 'desc'),
      limit(limitResults)
    );
    const querySnapshot = await getDocs(q);
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      characters.push({ id: doc.id, ...doc.data() } as Character);
    });
    return characters;
  } catch (error) {
    console.error('Erro ao buscar top personagens:', error);
    throw error;
  }
}
