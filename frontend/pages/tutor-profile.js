import React from 'react';
import { Edit, LogOut, Trash2 } from 'lucide-react';
import Layout from '../src/components/Layout';
import { useRouter } from 'next/router';

export default function PerfilTutor({
  onNavigateToMatches,
  onNavigateToChat,
  onNavigateToPerfil,
  onNavigateToHome,
  onNavigateToEditarPet,
  onNavigateToEditarTutor,
  petData,
  tutorData
}) {
  const router = useRouter();

  const formatarIdade = (idade) => {
    const idadeNum = parseInt(idade, 10);
    if (isNaN(idadeNum)) return '-';
    if (idadeNum === 0 || idadeNum === 1) return 'Filhote (0-1 ano)';
    if (idadeNum <= 7) return 'Adulto (2-7 anos)';
    return 'Idoso (8+ anos)';
  };

  const pets = petData ? [
    {
      id: 1,
      nome: petData.nome || '-',
      raca: petData.raca || '-',
      tipo: petData.especie === 'cachorro' ? 'Cachorro' : (petData.especie === 'gato' ? 'Gato' : '-'),
      idade: formatarIdade(petData.idade),
      sexo: petData.sexo === 'macho' ? 'Macho' : (petData.sexo === 'femea' || petData.sexo === 'fêmea' ? 'Fêmea' : '-'),
      foto: petData.mainPhoto || ''
    }
  ] : [];

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
    if (typeof window !== 'undefined' && window.confirm('Deseja realmente excluir este pet?')) {
      // TODO: call backend to delete pet
      alert(`Pet ${petId} excluído`);
    }
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

            <button onClick={handleSair} className="bg-white px-4 py-3 rounded-2xl flex gap-2">
              <LogOut className="size-5 text-[#FFA98F]" />
              <span className="text-xl bg-gradient-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent">Sair</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between mb-6">
              <h3 className="text-2xl font-bold">Informações do Tutor</h3>
              <button onClick={handleEditarPerfil} className="flex gap-2">
                <Edit className="size-4 text-[#FFA98F]" />
                <span className="text-[#FFA98F]">Editar</span>
              </button>
            </div>

            <p><strong>Nome:</strong> {tutorData?.nome || '-'}</p>
            <p><strong>Email:</strong> {tutorData?.email || '-'}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6">Meus Pets ({pets.length})</h3>

            {pets.map(pet => (
              <div key={pet.id} className="border rounded-2xl p-6 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{pet.nome}</h4>
                    <p>{pet.raca} • {pet.tipo}</p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleEditarPet(pet.id)}>
                      <Edit className="text-[#FFA98F]" />
                    </button>
                    <button onClick={() => handleExcluirPet(pet.id)}>
                      <Trash2 className="text-[#FFA98F]" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-sm">Idade: {pet.idade}</p>
                <p className="text-sm">Sexo: {pet.sexo}</p>
              </div>
            ))}
          </div>

        </main>
      </div>
    </Layout>
  );
}

