import React, { useEffect, useState } from 'react';
import { useActivePet } from '../context/ActivePetContext';
import { getMe } from '../services/auth';
import { listPets } from '../services/pets';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function PetSelectionModal() {
  const { activePetId, setActivePetId } = useActivePet();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [petsOwned, setPetsOwned] = useState([]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const user = await getMe();
        const all = await listPets();
        const mine = Array.isArray(all) ? all.filter(p => p.ownerId === user.id) : [];
        if (!mounted) return;
        setPetsOwned(mine);

        // If user has zero pets, show CTA to register
        if ((mine.length === 0) && !activePetId) {
          setVisible(true);
          return;
        }

        // If exactly one pet, auto-select
        if (mine.length === 1 && !activePetId) {
          setActivePetId(mine[0].id);
          setVisible(false);
          return;
        }

        // If multiple and no active, show picker
        if (mine.length > 1 && !activePetId) {
          setVisible(true);
          return;
        }
      } catch (e) {
        // ignore; don't block
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [activePetId, setActivePetId]);

  function handleSelect(petId) {
    setActivePetId(petId);
    setVisible(false);
  }

  function handleRegister() {
    router.push('/pet-register');
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full">
        <h3 className="text-xl font-bold mb-3">Escolha com qual pet você quer jogar</h3>

        {loading ? (
          <p className="text-sm text-slate-600">Carregando seus pets...</p>
        ) : petsOwned.length === 0 ? (
          <div className="text-center">
            <p className="text-sm text-slate-600">Você ainda não tem pets cadastrados.</p>
            <button onClick={handleRegister} className="mt-4 px-4 py-2 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white rounded-full">Cadastrar pet</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {petsOwned.map(p => (
              <button key={p.id} onClick={() => handleSelect(p.id)} className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:shadow">
                {p.mainPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.mainPhoto} alt={p.name} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">Sem foto</div>
                )}
                <div className="text-sm font-medium">{p.name || 'Pet'}</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 text-right">
          <button onClick={() => setVisible(false)} className="text-sm text-slate-500">Fechar</button>
        </div>
      </div>
    </div>
  );
}
