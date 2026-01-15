'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/authService';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '@/lib/profileService';
import { UserProfile } from '@/lib/types';
import { Motion, spring } from 'react-motion';

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
      router.push('/profile');
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      alert('Erro ao deletar perfil. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-xl text-orange-400 font-bold">Carregando...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden relative px-6 pt-24">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 w-full max-w-4xl">
          <Motion defaultStyle={{ opacity: 0, y: -40 }} style={{ opacity: spring(1), y: spring(0) }}>
            {(style) => (
              <div className="text-center mb-16" style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-500 mb-4">
                  Editar Perfil
                </h1>
                <p className="text-gray-300 text-xl max-w-2xl mx-auto">
                  Atualize as informações do seu personagem
                </p>
              </div>
            )}
          </Motion>

          <form onSubmit={handleSubmit} className="space-y-6 mb-12">
            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 200 }), y: spring(0, { delay: 200 }) }}>
              {(style) => (
                <div
                  className="bg-linear-to-br from-slate-700 to-slate-800 border border-orange-500/30 hover:border-orange-500 rounded-xl p-8 transition"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <label htmlFor="username" className="block text-sm font-bold mb-3 text-orange-400">
                    Nome de Usuário *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-slate-700/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                    required
                  />
                </div>
              )}
            </Motion>

            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 300 }), y: spring(0, { delay: 300 }) }}>
              {(style) => (
                <div
                  className="bg-linear-to-br from-slate-700 to-slate-800 border border-orange-500/30 hover:border-orange-500 rounded-xl p-8 transition"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <label htmlFor="faction" className="block text-sm font-bold mb-3 text-orange-400">
                    Facção (Opcional)
                  </label>
                  <input
                    type="text"
                    id="faction"
                    name="faction"
                    value={formData.faction}
                    onChange={handleChange}
                    placeholder="Sua facção ou grupo"
                    className="w-full bg-slate-700/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                  />
                </div>
              )}
            </Motion>

            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 400 }), y: spring(0, { delay: 400 }) }}>
              {(style) => (
                <div
                  className="bg-linear-to-br from-slate-700 to-slate-800 border border-orange-500/30 hover:border-orange-500 rounded-xl p-8 transition"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <label htmlFor="imageUrl" className="block text-sm font-bold mb-3 text-orange-400">
                    URL do Avatar (Opcional)
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://exemplo.com/avatar.png"
                    className="w-full bg-slate-700/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                  />
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-3">Preview do avatar:</p>
                      <Image
                        src={formData.imageUrl}
                        alt="Avatar preview"
                        width={256}
                        height={256}
                        className="max-w-xs max-h-64 rounded-lg border border-orange-500/30 object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </Motion>

            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 500 }), y: spring(0, { delay: 500 }) }}>
              {(style) => (
                <div
                  className="bg-linear-to-br from-slate-700 to-slate-800 border border-orange-500/30 hover:border-orange-500 rounded-xl p-8 transition"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <label htmlFor="description" className="block text-sm font-bold mb-3 text-orange-400">
                    Descrição (Opcional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Conte um pouco sobre seu personagem..."
                    rows={5}
                    className="w-full bg-slate-700/50 border border-orange-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition resize-none"
                  />
                </div>
              )}
            </Motion>

            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 600 }), y: spring(0, { delay: 600 }) }}>
              {(style) => (
                <div
                  className="bg-slate-700/30 border border-orange-500/20 rounded-xl p-6"
                  style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
                >
                  <p className="text-sm text-gray-300">
                    <strong className="text-orange-400">Nota:</strong> Alguns atributos como classe, nível e experiência não podem ser alterados aqui. 
                    Eles evoluem conforme você joga.
                  </p>
                </div>
              )}
            </Motion>

            <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1, { delay: 700 }), y: spring(0, { delay: 700 }) }}>
              {(style) => (
                <div className="flex gap-4" style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}>
                  <button
                    type="button"
                    onClick={() => router.push('/profile')}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold transition border border-slate-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-700 disabled:to-orange-800 text-white px-8 py-3 rounded-lg font-bold transition transform hover:scale-105 shadow-lg"
                  >
                    {submitting ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              )}
            </Motion>
          </form>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="w-full py-24 px-6 bg-slate-800 flex justify-center">
        <div className="w-full max-w-4xl">
          <Motion defaultStyle={{ opacity: 0, y: 20 }} style={{ opacity: spring(1), y: spring(0) }}>
            {(style) => (
              <div
                className="bg-linear-to-br from-red-950/30 to-red-900/30 border border-red-500/50 hover:border-red-500 rounded-xl p-8 transition"
                style={{ opacity: style.opacity, transform: `translateY(${style.y}px)` }}
              >
                <h3 className="text-3xl font-black text-red-400 mb-4">⚠️ Zona de Perigo</h3>
                <p className="text-gray-300 mb-6">
                  Deletar seu perfil é uma ação irreversível. Todos os seus dados serão permanentemente removidos.
                </p>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-8 py-3 rounded-lg font-bold transition transform hover:scale-105"
                >
                  {deleting ? 'Deletando...' : 'Deletar Perfil'}
                </button>
              </div>
            )}
          </Motion>
        </div>
      </section>
    </div>
  );
}
