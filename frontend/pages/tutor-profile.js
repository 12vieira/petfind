import React, { useEffect, useState } from 'react';
import { Edit, LogOut, Trash2 } from 'lucide-react';
import Layout from '../src/components/Layout';
import { useRouter } from 'next/router';
import { getMe } from '../src/services/auth';
import { deletePet } from '../src/services/pets';
import { listPets } from '../src/services/pets';
import Image from 'next/image';

export default function PerfilTutor({
  onNavigateToMatches,
  onNavigateToChat,
  onNavigateToPerfil,
  onNavigateToHome,
  onNavigateToEditarPet,
  onNavigateToEditarTutor,
}) {
  const router = useRouter();
  const [tutorData, setTutorData] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatarIdade = (idade) => {
    const idadeNum = parseInt(idade, 10);
    if (isNaN(idadeNum)) return '-';
    if (idadeNum === 0 || idadeNum === 1) return 'Filhote (0-1 ano)';
    if (idadeNum <= 7) return 'Adulto (2-7 anos)';
    return 'Idoso (8+ anos)';
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const user = await getMe();
        const all = await listPets();
        const mine = Array.isArray(all) ? all.filter(p => p.ownerId === user.id) : [];
        if (!mounted) return;
        setTutorData(user);
        setPets(mine);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleSair = () => {
    if (typeof window !== 'undefined' && window.confirm('Deseja realmente sair?')) {
      if (onNavigateToHome) return onNavigateToHome();
      router.push('/');
    }
  };

  const handleEditarPerfil = () => {
    if (onNavigateToEditarTutor) return onNavigateToEditarTutor();
    router.push('/tutor-edit');
  };

  const handleEditarPet = (petId) => {
    if (onNavigateToEditarPet) return onNavigateToEditarPet(petId);
    router.push('/pet-edit');
  };

  const handleExcluirPet = (petId) => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Deseja realmente excluir este pet?')) return;

    (async () => {
      try {
        await deletePet(petId);
        setPets((prev) => prev.filter((p) => p.id !== petId));
        // if tutorData or other parts need update, we could refresh getMe() here
      } catch (err) {
        console.error('Erro ao excluir pet', err);
        alert('Falha ao excluir o pet. Tente novamente.');
      }
    })();
  };

  const goMatches = () => {
    if (onNavigateToMatches) return onNavigateToMatches();
    router.push('/matches');
  };

  return (
    <Layout title="Perfil do Tutor">
      <div className="min-h-screen bg-[#FFF7F1]">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-12 flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold">Meu Perfil</h2>
              <p className="text-[#4a5565]">Gerencie suas informações e seus pets</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={goMatches} className="bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white px-4 py-2 rounded-xl">Ver Matches</button>
              <button onClick={handleSair} className="bg-white px-4 py-3 rounded-2xl flex gap-2">
                <LogOut className="w-5 h-5 text-[#FFA98F]" />
                <span className="text-xl bg-gradient-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent">Sair</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between mb-6">
              <h3 className="text-2xl font-bold">Informações do Tutor</h3>
              <button onClick={handleEditarPerfil} className="flex gap-2" aria-label="Editar perfil do tutor">
                <Edit className="w-5 h-5 text-[#FFA98F]" />
                <span className="text-[#FFA98F]">Editar</span>
              </button>
            </div>

            {loading ? (
              <p className="text-slate-500">Carregando informações...</p>
            ) : (
              <>
                <p><strong>Nome:</strong> {tutorData?.name || tutorData?.nome || '-'}</p>
                <p><strong>Email:</strong> {tutorData?.email || '-'}</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Meus Pets ({pets.length})</h3>
              <button
                onClick={() => router.push('/pet-register')}
                className="px-3 py-2 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white rounded-full"
              >
                Cadastrar Novo Pet
              </button>
            </div>
            {pets.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="text-slate-600">Você ainda não cadastrou pets.</p>
                <button
                  onClick={() => router.push('/pet-register')}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white rounded-full"
                >
                  Cadastrar pet
                </button>
              </div>
            ) : (
              pets.map((pet) => {
                const imageUrl = (() => {
                  const maybe = pet.mainPhoto || pet.image || pet.imageUrl || (Array.isArray(pet.images) && pet.images[0]) || '';
                  if (!maybe) return '';
                  if (typeof maybe === 'string') {
                    if (maybe.startsWith('/')) {
                      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                      return `${base.replace(/\/$/, '')}${maybe}`;
                    }
                    return maybe;
                  }
                  if (maybe && maybe.url) return maybe.url;
                  return '';
                })();

                return (
                  <div key={pet.id} className="border rounded-2xl p-6 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imageUrl} alt={pet.name || pet.nome || 'Pet'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">Sem foto</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{pet.name || pet.nome}</h4>
                            <p className="text-sm text-slate-600">{pet.raca || pet.breed || '-'} • {pet.tipo || (pet.especie === 'cachorro' ? 'Cachorro' : pet.especie === 'gato' ? 'Gato' : '-')}</p>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => handleEditarPet(pet.id)} aria-label={`Editar pet ${pet.name || pet.nome}`}>
                              <Edit className="text-[#FFA98F] w-5 h-5" />
                            </button>
                            <button onClick={() => handleExcluirPet(pet.id)} aria-label={`Excluir pet ${pet.name || pet.nome}`}>
                              <Trash2 className="text-[#FFA98F] w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <p className="mt-2 text-sm">Idade: {formatarIdade(pet.age ?? pet.idade ?? pet.ageMonths ?? '-')}</p>
                        <p className="text-sm">Sexo: {pet.sexo === 'macho' ? 'Macho' : (pet.sexo === 'femea' || pet.sexo === 'fêmea' ? 'Fêmea' : (pet.sex || '-'))}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </main>
      </div>
    </Layout>
  );
}

