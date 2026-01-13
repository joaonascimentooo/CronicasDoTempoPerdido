import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Team, TeamMember } from './types';

// Criar uma nova equipe
export async function createTeam(
  teamName: string,
  description: string,
  leaderId: string,
  leaderName: string
): Promise<string> {
  try {
    const newTeam: Omit<Team, 'id'> = {
      name: teamName,
      description,
      leaderId,
      leaderName,
      members: [
        {
          userId: leaderId,
          username: leaderName,
          role: 'leader',
          joinedAt: new Date(),
        },
      ],
      maxMembers: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'teams'), newTeam);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar equipe:', error);
    throw error;
  }
}

// Buscar equipe por ID
export async function getTeam(teamId: string): Promise<Team | null> {
  try {
    const docRef = doc(db, 'teams', teamId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Team;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar equipe:', error);
    throw error;
  }
}

// Buscar equipe de um usuário
export async function getUserTeam(userId: string): Promise<Team | null> {
  try {
    const q = query(
      collection(db, 'teams'),
      where('members', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const teamDoc = querySnapshot.docs[0];
    return { id: teamDoc.id, ...teamDoc.data() } as Team;
  } catch (error) {
    console.error('Erro ao buscar equipe do usuário:', error);
    throw error;
  }
}

// Buscar todas as equipes
export async function getAllTeams(): Promise<Team[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'teams'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Team[];
  } catch (error) {
    console.error('Erro ao buscar equipes:', error);
    throw error;
  }
}

// Entrar em uma equipe
export async function joinTeam(
  teamId: string,
  userId: string,
  username: string
): Promise<void> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      throw new Error('Equipe não encontrada');
    }

    const team = teamSnap.data() as Team;

    // Verificar se já é membro
    const isMember = team.members.some((m) => m.userId === userId);
    if (isMember) {
      throw new Error('Você já é membro desta equipe');
    }

    // Verificar limite de membros
    if (team.members.length >= team.maxMembers) {
      throw new Error('Esta equipe atingiu o limite de membros');
    }

    const newMember: TeamMember = {
      userId,
      username,
      role: 'member',
      joinedAt: new Date(),
    };

    const updatedMembers = [...team.members, newMember];

    await updateDoc(teamRef, {
      members: updatedMembers,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao entrar na equipe:', error);
    throw error;
  }
}

// Sair de uma equipe
export async function leaveTeam(teamId: string, userId: string): Promise<void> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      throw new Error('Equipe não encontrada');
    }

    const team = teamSnap.data() as Team;

    // Não permitir que o líder saia sem transferir liderança
    const isLeader = team.leaderId === userId;
    if (isLeader) {
      throw new Error('O líder não pode sair sem transferir a liderança');
    }

    const updatedMembers = team.members.filter((m) => m.userId !== userId);

    await updateDoc(teamRef, {
      members: updatedMembers,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao sair da equipe:', error);
    throw error;
  }
}

// Deletar uma equipe (apenas o líder)
export async function deleteTeam(teamId: string, userId: string): Promise<void> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      throw new Error('Equipe não encontrada');
    }

    const team = teamSnap.data() as Team;

    if (team.leaderId !== userId) {
      throw new Error('Apenas o líder pode deletar a equipe');
    }

    await deleteDoc(teamRef);
  } catch (error) {
    console.error('Erro ao deletar equipe:', error);
    throw error;
  }
}
