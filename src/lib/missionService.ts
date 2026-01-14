import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Mission } from './types';

// Criar uma nova missão (apenas mestre)
export async function createMission(
  title: string,
  description: string,
  masterId: string,
  masterName: string,
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary',
  reward: { experience: number; gold: number },
  requirements?: { minLevel?: number; requiredClass?: string[]; requiredTeam?: boolean }
): Promise<string> {
  try {
    const newMission: Omit<Mission, 'id'> = {
      title,
      description,
      createdBy: masterId,
      createdByName: masterName,
      status: 'available',
      difficulty,
      reward,
      requirements,
      acceptedBy: [],
      completedBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'missions'), {
      ...newMission,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar missão:', error);
    throw error;
  }
}

// Buscar todas as missões disponíveis
export async function getAvailableMissions(): Promise<Mission[]> {
  try {
    const q = query(
      collection(db, 'missions'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((mission) => mission.status === 'available') as Mission[];
  } catch (error) {
    console.error('Erro ao buscar missões disponíveis:', error);
    throw error;
  }
}

// Buscar todas as missões
export async function getAllMissions(): Promise<Mission[]> {
  try {
    const q = query(
      collection(db, 'missions'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Mission[];
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    throw error;
  }
}

// Buscar missão por ID
export async function getMissionById(missionId: string): Promise<Mission | null> {
  try {
    const docRef = doc(db, 'missions', missionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Mission;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar missão:', error);
    throw error;
  }
}

// Aceitar uma missão
export async function acceptMission(missionId: string, userId: string): Promise<void> {
  try {
    const missionRef = doc(db, 'missions', missionId);
    const missionSnap = await getDoc(missionRef);

    if (!missionSnap.exists()) {
      throw new Error('Missão não encontrada');
    }

    const mission = missionSnap.data() as Mission;

    // Verificar se já aceitou
    if (mission.acceptedBy?.includes(userId)) {
      throw new Error('Você já aceitou esta missão');
    }

    const updatedAcceptedBy = [...(mission.acceptedBy || []), userId];

    await updateDoc(missionRef, {
      acceptedBy: updatedAcceptedBy,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erro ao aceitar missão:', error);
    throw error;
  }
}

// Completar uma missão
export async function completeMission(missionId: string, userId: string): Promise<void> {
  try {
    const missionRef = doc(db, 'missions', missionId);
    const missionSnap = await getDoc(missionRef);

    if (!missionSnap.exists()) {
      throw new Error('Missão não encontrada');
    }

    const mission = missionSnap.data() as Mission;

    // Verificar se o usuário aceitou a missão
    if (!mission.acceptedBy?.includes(userId)) {
      throw new Error('Você não aceitou esta missão');
    }

    // Verificar se já completou
    if (mission.completedBy?.includes(userId)) {
      throw new Error('Você já completou esta missão');
    }

    const updatedCompletedBy = [...(mission.completedBy || []), userId];

    await updateDoc(missionRef, {
      completedBy: updatedCompletedBy,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erro ao completar missão:', error);
    throw error;
  }
}

// Atualizar missão (apenas mestre criador)
export async function updateMission(
  missionId: string,
  masterId: string,
  updates: Partial<Mission>
): Promise<void> {
  try {
    const missionRef = doc(db, 'missions', missionId);
    const missionSnap = await getDoc(missionRef);

    if (!missionSnap.exists()) {
      throw new Error('Missão não encontrada');
    }

    const mission = missionSnap.data() as Mission;

    if (mission.createdBy !== masterId) {
      throw new Error('Apenas o mestre criador pode atualizar esta missão');
    }

    await updateDoc(missionRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erro ao atualizar missão:', error);
    throw error;
  }
}

// Deletar missão (apenas mestre criador)
export async function deleteMission(missionId: string, masterId: string): Promise<void> {
  try {
    const missionRef = doc(db, 'missions', missionId);
    const missionSnap = await getDoc(missionRef);

    if (!missionSnap.exists()) {
      throw new Error('Missão não encontrada');
    }

    const mission = missionSnap.data() as Mission;

    if (mission.createdBy !== masterId) {
      throw new Error('Apenas o mestre criador pode deletar esta missão');
    }

    await deleteDoc(missionRef);
  } catch (error) {
    console.error('Erro ao deletar missão:', error);
    throw error;
  }
}

// Obter missões aceitas pelo usuário
export async function getUserAcceptedMissions(userId: string): Promise<Mission[]> {
  try {
    const q = query(
      collection(db, 'missions'),
      where('acceptedBy', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Mission[];
  } catch (error) {
    console.error('Erro ao buscar missões do usuário:', error);
    throw error;
  }
}
