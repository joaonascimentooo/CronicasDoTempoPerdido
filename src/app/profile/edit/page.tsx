'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '@/lib/profileService';
import { UserProfile } from '@/lib/types';

export default function EditProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    description: '',
    imageUrl: '',
    faction: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      try {
        const userProfile = await getUserProfile(currentUser.uid);
        if (!userProfile) {
          router.push('/profile/setup');
          return;
        }
        setProfile(userProfile);
        setFormData({
          username: userProfile.username,
          description: userProfile.description || '',
          imageUrl: userProfile.imageUrl || '',
          faction: userProfile.faction || '',
        });
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) return;
    if (!formData.username.trim()) {
      alert('Por favor, insira um nome de usuário');
      return;
    }

    setSubmitting(true);

    try {
      await updateUserProfile(user.uid, {
        username: formData.username.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        faction: formData.faction.trim() || undefined,
      });
      router.push('/profile');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    const confirmed = confirm(
      'Tem certeza que deseja deletar seu perfil? Esta ação não pode ser desfeita.'
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteUserProfile(user.uid);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      alert('Erro ao deletar perfil. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-2xl">Carregando...</div>;
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Editar Perfil</h1>
        <p className="text-gray-400">Atualize as informações do seu personagem</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-8 space-y-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-bold mb-2">
            Nome de Usuário *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        {/* Faction */}
        <div>
          <label htmlFor="faction" className="block text-sm font-bold mb-2">
            Facção (Opcional)
          </label>
          <input
            type="text"
            id="faction"
            name="faction"
            value={formData.faction}
            onChange={handleChange}
            placeholder="Sua facção ou grupo"
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-bold mb-2">
            URL do Avatar (Opcional)
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://exemplo.com/avatar.png"
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
          />
          {formData.imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Preview do avatar:</p>
              <img
                src={formData.imageUrl}
                alt="Avatar preview"
                className="max-w-xs max-h-64 rounded border border-gray-600"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-bold mb-2">
            Descrição (Opcional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Conte um pouco sobre seu personagem..."
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Info Box */}
        <div className="bg-gray-700 border border-gray-600 rounded p-4">
          <p className="text-sm text-gray-300">
            <strong>Nota:</strong> Alguns atributos como classe, nível e experiência não podem ser alterados aqui. 
            Eles evoluem conforme você joga.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded font-bold transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 px-6 py-2 rounded font-bold transition"
          >
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-gray-800 border border-red-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-500 mb-4">Zona de Perigo</h3>
        <p className="text-gray-400 mb-4">
          Deletar seu perfil é uma ação irreversível. Todos os seus dados serão permanentemente removidos.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 px-6 py-2 rounded font-bold transition"
        >
          {deleting ? 'Deletando...' : 'Deletar Perfil'}
        </button>
      </div>
    </div>
  );
}
