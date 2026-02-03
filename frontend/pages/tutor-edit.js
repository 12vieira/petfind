import React, { useState, useRef } from 'react';
import Layout from '../src/components/Layout';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/router';

export default function TutorEdit({ tutorData = null, onSalvar, onNavigateToMatches, onNavigateToChat, onNavigateToPerfil }) {
  const router = useRouter();

  const initial = tutorData || {};
  const [foto, setFoto] = useState(initial.foto || null);
  const fotoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nome: initial.nome || '',
    email: initial.email || '',
    telefone: initial.telefone || '',
    cidade: initial.cidade || '',
    estado: initial.estado || 'SP',
  });

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setFoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, foto };
    if (onSalvar) onSalvar(payload);
    else router.push('/tutor-profile');
  };

  const estados = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' },
  ];

  return (
    <Layout title="Editar Tutor">
      <div className="page min-h-screen bg-[#FFF7F1]">
        <main className="container-page py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title mb-6">Editar Perfil</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-semibold mb-4">Foto de Perfil</h3>
                <div className="flex items-center gap-6">
                  <div className="size-32 rounded-full bg-gradient-to-br from-[#ffa98f] to-[#ff8566] overflow-hidden flex items-center justify-center">
                    {foto ? (
                      <img src={foto} alt="Foto de perfil" className="w-full h-full object-cover" />
                    ) : (
                      <UserPlus className="size-20 text-white" />
                    )}
                  </div>

                  <div>
                    <input ref={fotoInputRef} type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                    <button type="button" onClick={() => fotoInputRef.current && fotoInputRef.current.click()} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white">
                      {foto ? 'Alterar Foto' : 'Adicionar Foto'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
                <div>
                  <label className="label">Nome</label>
                  <input value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} className="input" placeholder="Seu nome" />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="input" placeholder="seu@email.com" />
                </div>

                <div>
                  <label className="label">Telefone</label>
                  <input value={formData.telefone} onChange={(e) => handleChange('telefone', e.target.value)} className="input" placeholder="(xx) xxxxx-xxxx" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Cidade</label>
                    <input value={formData.cidade} onChange={(e) => handleChange('cidade', e.target.value)} className="input" placeholder="Cidade" />
                  </div>

                  <div>
                    <label className="label">Estado</label>
                    <select value={formData.estado} onChange={(e) => handleChange('estado', e.target.value)} className="input">
                      {estados.map((estado) => (
                        <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => onNavigateToPerfil?.() || router.back()} className="px-8 py-3 bg-white rounded-2xl">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white rounded-2xl">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
}
