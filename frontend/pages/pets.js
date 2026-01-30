import { Heart, MessageCircle, User, Plus, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { listPets, createPet } from '../src/services/pets';

export default function Pets() {
  const [pets, setPets] = useState([]);

  const [mainPhoto, setMainPhoto] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([null, null, null, null]);

  const mainPhotoInputRef = useRef(null);
  const additionalPhotoRefs = useRef([]);
  const registroMedicoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nome: '',
    especie: 'cachorro',
    idade: '',
    sexo: 'macho',
    raca: '',
    objetivo: 'amizades',
    breedingEnabled: false,
    pedigree: '',
    registroMedico: '',
    biografia: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadPets() {
    try {
      const data = await listPets();
      setPets(data || []);
    } catch (err) {
      console.error('Failed to load pets', err);
    }
  }

  useEffect(() => {
    loadPets();
  }, []);

  const handleMainPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setMainPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAdditionalPhotoChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...additionalPhotos];
      updated[index] = reader.result;
      setAdditionalPhotos(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRegistroMedicoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      registroMedico: file.name
    }));
  };

  const removeMainPhoto = () => {
    setMainPhoto(null);
    if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
  };

  const removeAdditionalPhoto = (index) => {
    const updated = [...additionalPhotos];
    updated[index] = null;
    setAdditionalPhotos(updated);
    if (additionalPhotoRefs.current[index]) additionalPhotoRefs.current[index].value = '';
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const petData = {
        name: formData.nome,
        species: formData.especie,
        age: formData.idade,
        sex: formData.sexo,
        breed: formData.raca,
        objective: formData.objetivo,
        pedigree: formData.pedigree,
        registroMedico: formData.registroMedico,
        bio: formData.biografia,
        mainPhoto: mainPhoto || '',
        additionalPhotos: additionalPhotos.filter(Boolean)
      };

      await createPet(petData);
      setMessage('Pet criado.');
      setFormData({ nome: '', especie: 'cachorro', idade: '', sexo: 'macho', raca: '', objetivo: 'amizades', breedingEnabled: false, pedigree: '', registroMedico: '', biografia: '' });
      setMainPhoto(null);
      setAdditionalPhotos([null, null, null, null]);
      if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
      additionalPhotoRefs.current.forEach((ref) => { if (ref) ref.value = ''; });
      await loadPets();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Falha ao criar pet');
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8">
              <svg className="block size-full" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <linearGradient id="logo_grad_pets" x1="0" x2="1">
                    <stop offset="0%" stopColor="#FFA98F" />
                    <stop offset="100%" stopColor="#FF8566" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="12" r="6" stroke="url(#logo_grad_pets)" strokeWidth="2.5" fill="rgba(255,168,143,0.06)" />
                <path d="M10 22c1-2 3-3 6-3s5 1 6 3" stroke="#F6AD55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <circle cx="11.5" cy="11" r="1.2" fill="#FF8566" />
                <circle cx="20.5" cy="11" r="1.2" fill="#FF8566" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent">PetFind</h1>
          </div>

          <div className="flex gap-2">
            <button className="size-12 rounded-xl hover:bg-gray-50">
              <Heart className="size-6 text-[#4A5565]" />
            </button>
            <button className="size-12 rounded-xl hover:bg-gray-50">
              <MessageCircle className="size-6 text-[#4A5565]" />
            </button>
            <button className="size-12 rounded-xl bg-[rgba(255,169,143,0.15)]">
              <User className="size-6 text-[#FFA98F]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container-page py-12">
        <div className="space-y-8">
          <div className="card p-8">
            <h2 className="text-3xl font-bold mb-2">Criar Perfil do Pet</h2>
            <p className="text-[#4a5565] mb-6">Preencha as informações do seu pet para encontrar o match perfeito!</p>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto principal</label>
                  <div className="relative">
                    <div className="w-full h-44 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer">
                      {mainPhoto ? (
                        <img src={mainPhoto} alt="main" className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
                          <div className="w-12 h-12 rounded-full bg-[rgba(255,168,143,0.12)] flex items-center justify-center">
                            <Plus className="text-[#FFA98F]" />
                          </div>
                          <span>Sem foto</span>
                        </div>
                      )}

                      {/* invisible input over the preview so clicking anywhere opens file picker */}
                      <input
                        ref={mainPhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMainPhotoChange}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Selecionar foto principal"
                      />
                    </div>

                    {mainPhoto && (
                      <button type="button" onClick={removeMainPhoto} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                        <X className="size-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <input type="text" placeholder="Nome do pet" value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} className="input" required />
                  <textarea rows={3} placeholder="Sobre o seu pet..." value={formData.biografia} onChange={(e) => handleChange('biografia', e.target.value)} className="input resize-none" />

                  <div className="grid md:grid-cols-3 gap-3">
                    <input type="text" placeholder="Raça" value={formData.raca} onChange={(e) => handleChange('raca', e.target.value)} className="input" />
                    <input type="text" placeholder="Idade" value={formData.idade} onChange={(e) => handleChange('idade', e.target.value)} className="input" />
                    <select value={formData.sexo} onChange={(e) => handleChange('sexo', e.target.value)} className="input">
                      <option value="macho">Macho</option>
                      <option value="femea">Fêmea</option>
                    </select>
                  </div>

                  <div className="flex gap-3 mt-2">
                    {additionalPhotos.map((p, idx) => (
                      <div key={idx} className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden relative">
                        {p ? <img src={p} alt={`add-${idx}`} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300">+</div>}
                        <input ref={(el) => (additionalPhotoRefs.current[idx] = el)} type="file" accept="image/*" onChange={(e) => handleAdditionalPhotoChange(idx, e)} onClick={(e) => e.stopPropagation()} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {p && <button type="button" onClick={() => removeAdditionalPhoto(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"><X className="size-3 text-gray-600" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setFormData({ nome: '', especie: 'cachorro', idade: '', sexo: 'macho', raca: '', objetivo: 'amizades', breedingEnabled: false, pedigree: '', registroMedico: '', biografia: '' }); setMainPhoto(null); setAdditionalPhotos([null, null, null, null]); }} className="btn-secondary flex-1">Limpar</button>
                <button type="submit" className="btn flex-1">Cadastrar pet</button>
              </div>

              {message && <p className="mt-3 text-green-600">{message}</p>}
              {error && <p className="mt-3 text-red-600">{error}</p>}
            </form>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Seus Pets</h3>
              <span className="badge">Total: {pets.length}</span>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <div key={pet.id} className="card p-4 card-hover">
                  <div className="w-full h-40 bg-gray-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                    {pet.mainPhoto ? <img src={pet.mainPhoto} alt={pet.name} className="w-full h-full object-cover" /> : <div className="text-gray-300">Sem foto</div>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{pet.name || pet.nome}</div>
                      <div className="text-sm text-gray-500">{pet.breed || pet.raca || pet.species}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-gray-50"><Heart className="text-pink-500" /></button>
                      <button className="p-2 rounded-lg hover:bg-gray-50"><MessageCircle className="text-gray-500" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}