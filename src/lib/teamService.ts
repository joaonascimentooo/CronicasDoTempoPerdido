import {
  collection,
  doc,
  getDoc,
  getDocs,
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
  leaderName: string,
  maxMembers: number = 5
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
      maxMembers,
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
    const querySnapshot = await getDocs(collection(db, 'teams'));
    
    for (const doc of querySnapshot.docs) {
      const team = doc.data() as Team;
      const isMember = team.members.some((m) => m.userId === userId);
      if (isMember) {
        return { ...team, id: doc.id } as Team;
      }
    }
    
    return null;
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
): Promise<{ alreadyMember: boolean; teamId?: string } | void> {
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
      return { alreadyMember: true, teamId };
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

    return { alreadyMember: false, teamId };
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

// Atualizar número máximo de membros (apenas o líder)
export async function updateTeamMaxMembers(
  teamId: string,
  userId: string,
  newMaxMembers: number
): Promise<void> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      throw new Error('Equipe não encontrada');
    }

    const team = teamSnap.data() as Team;

    if (team.leaderId !== userId) {
      throw new Error('Apenas o líder pode editar a equipe');
    }

    if (newMaxMembers < team.members.length) {
      throw new Error(
        `Não é possível reduzir para ${newMaxMembers} membros. A equipe tem ${team.members.length} membros atualmente.`
      );
    }

    await updateDoc(teamRef, {
      maxMembers: newMaxMembers,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar equipe:', error);
    throw error;
  }
}

// Expulsar membro da equipe (apenas o líder)
export async function removeMemberFromTeam(
  teamId: string,
  leaderId: string,
  memberToRemoveId: string
): Promise<void> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      throw new Error('Equipe não encontrada');
    }

    const team = teamSnap.data() as Team;

    if (team.leaderId !== leaderId) {
      throw new Error('Apenas o líder pode expulsar membros');
    }

    // Não permitir expulsar o líder
    if (team.leaderId === memberToRemoveId) {
      throw new Error('Não é possível expulsar o líder');
    }

    const updatedMembers = team.members.filter((m) => m.userId !== memberToRemoveId);

    await updateDoc(teamRef, {
      members: updatedMembers,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao expulsar membro:', error);
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
