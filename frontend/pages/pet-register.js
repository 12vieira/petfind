/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from 'react';
import Layout from '../src/components/Layout';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { createPet } from '../src/services/pets';

export default function PetRegister({ onPetCadastrado, onNavigateToInicioMatch, onNavigateToMatches, onNavigateToChat, onNavigateToPerfil }) {
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
    biografia: '',
  });

  const [registroMedicoFile, setRegistroMedicoFile] = useState(null);

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
      const newPhotos = [...additionalPhotos];
      newPhotos[index] = reader.result;
      setAdditionalPhotos(newPhotos);
    };
    reader.readAsDataURL(file);
  };

  const handleRegistroMedicoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRegistroMedicoFile(file);
    setFormData((prev) => ({ ...prev, registroMedico: file.name }));
  };

  const removeMainPhoto = () => {
    setMainPhoto(null);
    setMainPhotoFile(null);
    if (mainPhotoInputRef.current) mainPhotoInputRef.current.value = '';
  };

  const removeAdditionalPhoto = (index) => {
    const newPhotos = [...additionalPhotos];
    newPhotos[index] = null;
    setAdditionalPhotos(newPhotos);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', formData.nome);
    form.append('species', formData.especie);
    form.append('ageMonths', formData.idade || '');
    form.append('sex', formData.sexo);
    form.append('breed', formData.raca);
    form.append('description', formData.biografia);

    if (mainPhotoFile) form.append('mainPhoto', mainPhotoFile);
    additionalPhotoFiles.filter(Boolean).forEach((file) => form.append('additionalPhotos', file));

    // Persist to backend if service available, otherwise fall back to callbacks
    (async () => {
      try {
        if (createPet) {
          await createPet(form);
        }
        if (onPetCadastrado) {
          onPetCadastrado(formData);
        } else if (onNavigateToInicioMatch) {
          onNavigateToInicioMatch();
        } else {
          router.push('/match-begin');
        }
      } catch (err) {
        console.error('Failed to create pet', err);
        // still navigate or call callback so UX continues; could show toast instead
        if (onNavigateToInicioMatch) {
          onNavigateToInicioMatch();
        } else {
          router.push('/match-begin');
        }
      }
    })();
  };

  return (
    <Layout title="Cadastrar Pet">
      <div className="page min-h-screen bg-[#FFF7F1]">
        <main className="container-page py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title mb-4">Cadastrar novo pet</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <div className="relative">
                      <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {mainPhoto ? (
                          <img src={mainPhoto} className="object-cover w-full h-full" alt="Main" />
                        ) : (
                          <div className="text-center text-gray-400 px-4">
                            <div className="mb-2">Foto principal</div>
                            <div className="text-xs">Adicione uma foto que represente melhor o seu pet.</div>
                          </div>
                        )}
                      </div>

                      <div className="absolute left-4 top-4 flex gap-2">
                        <label className="btn-secondary cursor-pointer">
                          <input ref={mainPhotoInputRef} type="file" accept="image/*" onChange={handleMainPhotoChange} onClick={(e) => e.stopPropagation()} className="hidden" />
                          <Plus className="size-4" />
                        </label>
                        {mainPhoto && (
                          <button type="button" onClick={removeMainPhoto} className="btn-secondary">
                            <X className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-semibold mb-2">Galeria</div>
                      <div className="grid grid-cols-4 gap-2">
                        {additionalPhotos.map((p, i) => (
                          <div key={i} className="relative w-full pb-[100%] bg-slate-50 rounded-lg overflow-hidden">
                            {p ? <img src={p} alt="Foto do pet" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-300">+</div>}
                            <input ref={(el) => (additionalPhotoRefs.current[i] = el)} type="file" accept="image/*" onChange={(e) => handleAdditionalPhotoChange(i, e)} onClick={(e) => e.stopPropagation()} className="absolute inset-0 opacity-0 cursor-pointer" />
                            {p && (
                              <button type="button" onClick={() => removeAdditionalPhoto(i)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                                <X className="size-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Nome</label>
                        <input value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} className="input" placeholder="Nome do pet" />
                      </div>

                      <div>
                        <label className="label">Espécie</label>
                        <select value={formData.especie} onChange={(e) => handleChange('especie', e.target.value)} className="input">
                          <option value="cachorro">Cachorro</option>
                          <option value="gato">Gato</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">Idade (meses)</label>
                        <input value={formData.idade} onChange={(e) => handleChange('idade', e.target.value)} className="input" placeholder="0" />
                      </div>

                      <div>
                        <label className="label">Sexo</label>
                        <select value={formData.sexo} onChange={(e) => handleChange('sexo', e.target.value)} className="input">
                          <option value="macho">Macho</option>
                          <option value="femea">Fêmea</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="label">Raça</label>
                        <input value={formData.raca} onChange={(e) => handleChange('raca', e.target.value)} className="input" placeholder="Ex: Labrador" />
                      </div>

                      <div className="col-span-2">
                        <label className="label">Objetivo</label>
                        <select value={formData.objetivo} onChange={(e) => handleChange('objetivo', e.target.value)} className="input">
                          <option value="amizades">Amizades</option>
                          <option value="encontros">Encontros</option>
                          <option value="adocao">Adoção</option>
                        </select>
                      </div>

                      <div className="col-span-2 flex items-center gap-3">
                        <input id="breedToggle" type="checkbox" checked={formData.breedingEnabled} onChange={(e) => handleChange('breedingEnabled', e.target.checked)} />
                        <label htmlFor="breedToggle" className="text-sm">Disponível para reprodução</label>
                      </div>

                      <div className="col-span-2">
                        <label className="label">Pedigree</label>
                        <input value={formData.pedigree} onChange={(e) => handleChange('pedigree', e.target.value)} className="input" placeholder="Número do pedigree" />
                      </div>

                      <div className="col-span-2">
                        <label className="label">Registro médico (arquivo)</label>
                        <div className="flex items-center gap-3">
                          <label className="btn-secondary cursor-pointer">
                            <input ref={registroMedicoInputRef} type="file" accept="application/pdf,image/*" onChange={handleRegistroMedicoChange} onClick={(e) => e.stopPropagation()} className="hidden" />
                            <Plus />
                          </label>
                          <div className="text-sm text-gray-600">{formData.registroMedico || 'Nenhum arquivo selecionado'}</div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label className="label">Biografia</label>
                        <textarea rows={4} placeholder="Conte mais sobre o seu pet..." value={formData.biografia} onChange={(e) => handleChange('biografia', e.target.value)} className="input resize-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn">Cadastrar</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
}
