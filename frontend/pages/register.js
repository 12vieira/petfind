import { ArrowLeft } from 'lucide-react';
import { useState, useRef } from 'react';
import { registerUser } from '../src/services/auth';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cidade: '',
    estado: 'DF',
    foto: null,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.nome,
        email: formData.email,
        password: formData.senha,
        telefone: formData.telefone || undefined,
        cidade: formData.cidade || undefined,
        estado: formData.estado || undefined,
        foto: formData.foto || undefined,
      };

      await registerUser(payload);
      setMessage('Cadastro realizado. Você será redirecionado para entrar.');
      setFormData({ nome: '', email: '', senha: '', confirmarSenha: '', telefone: '', cidade: '', estado: 'DF', foto: null });
      setTimeout(() => router.push('/login'), 1200);
    } catch (err) {
      setError(err?.response?.data?.error || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fotoInputRef = useRef(null);
  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData((prev) => ({ ...prev, foto: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData((prev) => ({ ...prev, foto: reader.result }));
    reader.readAsDataURL(file);
  };

  const goToNextStep = () => {
    setError('');
    // basic validation for step 1
    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
      setError('Preencha nome, email e senha antes de continuar.');
      return;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    setStep(2);
  };

  const goToPrevStep = () => {
    setError('');
    setStep(1);
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

  const onNavigateToHome = () => router.push('/');
  const onNavigateToLogin = () => router.push('/login');

  return (
    <Layout title="Criar Conta">
      <div className="min-h-screen bg-[#FFF7F1]">
        <main className="max-w-md mx-auto px-6 py-12">
        <div className="space-y-8">
          <button
            onClick={onNavigateToHome}
            className="flex items-center gap-2 px-4 py-3 rounded-xl"
          >
            <ArrowLeft className="size-5" />
            <span className="text-xl">Voltar</span>
          </button>

          <div>
            <h2 className="text-4xl font-bold">Criar Conta</h2>
            <p className="text-[#4a5565]">Cadastre-se para começar a usar o PetFind</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 ">
            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff8566]"
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff8566]"
                    required
                  />

                  <input
                    type="password"
                    placeholder="Senha"
                    value={formData.senha}
                    onChange={(e) => handleChange('senha', e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff8566]"
                    minLength={6}
                    required
                  />

                  <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={formData.confirmarSenha}
                    onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff8566] "
                    minLength={6}
                    required
                  />

                  <div className="flex gap-4">
                    <button type="button" onClick={goToNextStep} className="flex-1 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white py-3 rounded-xl">Próximo</button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff8566]"
                  />

                  <input
                    type="text"
                    placeholder="Cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff8566]"
                  />

                  <select
                    value={formData.estado}
                    onChange={(e) => handleChange('estado', e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff8566]"
                  >
                    {estados.map((estado) => (
                      <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
                    ))}
                  </select>

                  <div>
                    <input ref={fotoInputRef} type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />

                    <div
                      onClick={() => fotoInputRef.current && fotoInputRef.current.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') fotoInputRef.current && fotoInputRef.current.click(); }}
                      className="w-full flex items-center gap-4 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors border-gray-200 border-opacity-60 hover:border-[#ffd1c1] bg-white/50"
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffa98f] to-[#ff8566] flex items-center justify-center overflow-hidden">
                        {formData.foto ? (
                          <img src={formData.foto} alt="Miniatura" className="w-full h-full object-cover" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" className="w-8 h-8">
                            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M16 3h-8v4H5" />
                            <circle cx="12" cy="13" r="3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="font-medium">{formData.foto ? 'Foto selecionada' : 'Arraste sua foto ou clique para escolher'}</div>
                        <div className="text-sm text-gray-500">PNG, JPG ou GIF — menor que 5MB</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={goToPrevStep} className="flex-1 bg-white py-3 rounded-xl">Voltar</button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white py-3 rounded-xl disabled:opacity-60"
                      disabled={loading}
                      aria-disabled={loading}
                      aria-busy={loading}
                    >
                      {loading ? 'Criando...' : 'Criar conta'}
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center text-sm">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="font-medium text-[#ff8566] hover:underline"
                >
                  Entrar
                </button>
              </div>
            </form>

            {message && <p className="mt-3 text-green-600" role="status" aria-live="polite">{message}</p>}
            {error && <p className="mt-3 text-red-600" role="alert" aria-live="assertive">{error}</p>}
          </div>
        </div>
        </main>
      </div>
    </Layout>
  );
}








// import { Home, MessageCircle, User, ArrowLeft } from 'lucide-react';
// import { useState } from 'react';
// import { registerUser } from '../src/services/auth';
// import { useRouter } from 'next/router';

// export default function Register() {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     nome: '',
//     email: '',
//     senha: '',
//     confirmarSenha: '',
//     telefone: '',
//     estado: '',
//     siglaEstado: ''
//   });

//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setMessage('');

//     if (formData.senha !== formData.confirmarSenha) {
//       setError('As senhas não coincidem.');
//       return;
//     }

//     setLoading(true);
//     try {
//       await registerUser({ name: formData.nome, email: formData.email, password: formData.senha });
//       setMessage('Cadastro realizado. Você será redirecionado para entrar.');
//       setFormData({ nome: '', email: '', senha: '', confirmarSenha: '', telefone: '', estado: '', siglaEstado: '' });
//       setTimeout(() => router.push('/login'), 1200);
//     } catch (err) {
//       setError(err?.response?.data?.error || 'Falha no cadastro');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const onNavigateToHome = () => router.push('/');
//   const onNavigateToLogin = () => router.push('/login');

//   return (
//     <div className="min-h-screen bg-[#fffaeb]">
//       {/* Header */}
//       <header className="bg-white shadow-sm sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
//           {/* Logo */}
//           <div className="flex items-center gap-3">
//             <div className="size-8">
//               {/* Inline fallback logo (removed external svg import) */}
//               <svg className="block size-full" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
//                 <defs>
//                   <linearGradient id="logo_grad" x1="0" x2="1">
//                     <stop offset="0%" stopColor="#FFA98F" />
//                     <stop offset="100%" stopColor="#FF8566" />
//                   </linearGradient>
//                 </defs>
//                 <circle cx="16" cy="12" r="6" stroke="url(#logo_grad)" strokeWidth="2.5" fill="rgba(255,168,143,0.06)" />
//                 <path d="M10 22c1-2 3-3 6-3s5 1 6 3" stroke="#F6AD55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
//                 <circle cx="11.5" cy="11" r="1.2" fill="#FF8566" />
//                 <circle cx="20.5" cy="11" r="1.2" fill="#FF8566" />
//               </svg>
//             </div>

//             <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent">
//               PetFind
//             </h1>
//           </div>

//           {/* Navigation */}
//           <div className="hidden md:flex items-center gap-2">
//             <button className="size-12 rounded-xl bg-[rgba(255,169,143,0.13)] flex items-center justify-center hover:bg-[rgba(255,169,143,0.2)] transition-colors">
//               <Home className="size-6 text-[#FFA98F]" />
//             </button>
//             <button className="size-12 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
//               <MessageCircle className="size-6 text-[#4A5565]" />
//             </button>
//             <button className="size-12 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
//               <User className="size-6 text-[#4A5565]" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="max-w-md mx-auto px-6 py-12">
//         <div className="space-y-8">
//           <button
//             onClick={onNavigateToHome}
//             className="flex items-center gap-2 px-4 py-3 bg-[#fffbec] rounded-xl hover:bg-[#fff5d6] transition-colors"
//           >
//             <ArrowLeft className="size-5" />
//             <span className="text-xl">Voltar</span>
//           </button>

//           <div>
//             <h2 className="text-4xl font-bold">Criar Conta</h2>
//             <p className="text-[#4a5565]">Cadastre-se para começar a usar o PetFind</p>
//           </div>

//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
//             <form onSubmit={handleSubmit} className="space-y-5">
//               <input
//                 type="text"
//                 placeholder="Nome completo"
//                 value={formData.nome}
//                 onChange={(e) => handleChange('nome', e.target.value)}
//                 className="w-full px-4 py-3 border rounded-xl"
//                 required
//               />

//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={(e) => handleChange('email', e.target.value)}
//                 className="w-full px-4 py-3 border rounded-xl"
//                 required
//               />

//               <input
//                 type="password"
//                 placeholder="Senha"
//                 value={formData.senha}
//                 onChange={(e) => handleChange('senha', e.target.value)}
//                 className="w-full px-4 py-3 border rounded-xl"
//                 minLength={6}
//                 required
//               />

//               <input
//                 type="password"
//                 placeholder="Confirmar senha"
//                 value={formData.confirmarSenha}
//                 onChange={(e) => handleChange('confirmarSenha', e.target.value)}
//                 className="w-full px-4 py-3 border rounded-xl"
//                 minLength={6}
//                 required
//               />

//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white py-3 rounded-xl disabled:opacity-60"
//                 disabled={loading}
//               >
//                 {loading ? 'Criando...' : 'Criar conta'}
//               </button>

//               <div className="text-center text-sm">
//                 Já tem uma conta?{' '}
//                 <button
//                   type="button"
//                   onClick={onNavigateToLogin}
//                   className="font-medium text-[#ff8566] hover:underline"
//                 >
//                   Entrar
//                 </button>
//               </div>
//             </form>

//             {message && <p className="mt-3 text-green-600">{message}</p>}
//             {error && <p className="mt-3 text-red-600">{error}</p>}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }