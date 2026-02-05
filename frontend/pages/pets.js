/* eslint-disable @next/next/no-img-element */
import { Plus, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { createPet } from '../src/services/pets';
import Layout from '../src/components/Layout';

export default function Pets() {
  const router = useRouter();
  const [mainPhoto, setMainPhoto] = useState(null);
  const [mainPhotoFile, setMainPhotoFile] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([null, null, null, null]);
  const [additionalPhotoFiles, setAdditionalPhotoFiles] = useState([null, null, null, null]);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  const handleMainPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMainPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setMainPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAdditionalPhotoChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAdditionalPhotoFiles((prev) => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });

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
    setMainPhotoFile(null);
    if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
  };

  const removeAdditionalPhoto = (index) => {
    const updated = [...additionalPhotos];
    updated[index] = null;
    setAdditionalPhotos(updated);
    setAdditionalPhotoFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    if (additionalPhotoRefs.current[index]) additionalPhotoRefs.current[index].value = '';
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const form = new FormData();
      form.append('name', formData.nome);
      form.append('species', formData.especie);
      form.append('ageMonths', formData.idade || '');
      form.append('sex', formData.sexo);
      form.append('breed', formData.raca);
      form.append('description', formData.biografia);

      if (mainPhotoFile) form.append('mainPhoto', mainPhotoFile);
      additionalPhotoFiles.filter(Boolean).forEach((file) => form.append('additionalPhotos', file));

      await createPet(form);
      setError('');
      setMessage('Pet criado.');
      setFormData({ nome: '', especie: 'cachorro', idade: '', sexo: 'macho', raca: '', objetivo: 'amizades', breedingEnabled: false, pedigree: '', registroMedico: '', biografia: '' });
      setMainPhoto(null);
      setMainPhotoFile(null);
      setAdditionalPhotos([null, null, null, null]);
      setAdditionalPhotoFiles([null, null, null, null]);
      if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
      additionalPhotoRefs.current.forEach((ref) => { if (ref) ref.value = ''; });
      // After creating, navigate to match-display so the newly created pet appears there
      router.push('/match-display');
    } catch (err) {
      console.error(err);
      setMessage('');
      setError(err?.response?.data?.error || 'Falha ao criar pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Cadastrar Pet">
      <div className="min-h-screen bg-[#FFF7F1]">
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
                        <img src={mainPhoto} alt="main" className="object-cover w-full h-full" loading="lazy" decoding="async" />
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
                        {p ? <img src={p} alt={`add-${idx}`} className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <div className="flex items-center justify-center h-full text-gray-300">+</div>}
                        <input ref={(el) => (additionalPhotoRefs.current[idx] = el)} type="file" accept="image/*" onChange={(e) => handleAdditionalPhotoChange(idx, e)} onClick={(e) => e.stopPropagation()} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {p && <button type="button" onClick={() => removeAdditionalPhoto(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"><X className="size-3 text-gray-600" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ nome: '', especie: 'cachorro', idade: '', sexo: 'macho', raca: '', objetivo: 'amizades', breedingEnabled: false, pedigree: '', registroMedico: '', biografia: '' });
                    setMainPhoto(null);
                    setMainPhotoFile(null);
                    setAdditionalPhotos([null, null, null, null]);
                    setAdditionalPhotoFiles([null, null, null, null]);
                    if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
                    additionalPhotoRefs.current.forEach((ref) => { if (ref) ref.value = ''; });
                    if (registroMedicoInputRef.current) registroMedicoInputRef.current.value = '';
                    setMessage('');
                    setError('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Limpar
                </button>
                <button type="submit" className="btn flex-1" disabled={isSubmitting} aria-disabled={isSubmitting} aria-busy={isSubmitting}>
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar pet'}
                </button>
              </div>

              {message && <p className="mt-3 text-green-600" role="status" aria-live="polite">{message}</p>}
              {error && <p className="mt-3 text-red-600" role="alert" aria-live="assertive">{error}</p>}
            </form>
          </div>
        </div>
        </main>
      </div>
    </Layout>
  );
}