import { Heart, MessageCircle, User, Plus } from 'lucide-react';
import { useRouter } from 'next/router';

export default function MatchBegin({ onNavigateToCadastrarPet }) {
  const router = useRouter();

  const goToRegister = () => {
    if (onNavigateToCadastrarPet) return onNavigateToCadastrarPet();
    router.push('/pet-register');
  };

  return (
    <div className="min-h-screen bg-[#FFF7F1]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8">
              <svg className="block size-full" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <linearGradient id="logo_grad_matchbegin" x1="0" x2="1">
                    <stop offset="0%" stopColor="#FFA98F" />
                    <stop offset="100%" stopColor="#FF8566" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="12" r="6" stroke="url(#logo_grad_matchbegin)" strokeWidth="2.5" fill="rgba(255,168,143,0.06)" />
                <path d="M10 22c1-2 3-3 6-3s5 1 6 3" stroke="#F6AD55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent">PetMatch</h1>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button className="size-12 rounded-xl bg-[rgba(255,169,143,0.13)] flex items-center justify-center hover:bg-[rgba(255,169,143,0.2)] transition-colors">
              <Heart className="size-6 text-[#FFA98F]" />
            </button>
            <button className="size-12 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
              <MessageCircle className="size-6 text-[#4A5565]" />
            </button>
            <button className="size-12 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
              <User className="size-6 text-[#4A5565]" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-[#0a0a0a]">Olá, tutor!</h2>
            <p className="text-[#4a5565]">Adicione seu primeiro pet para começar a buscar matches</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12">
            <div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto">
              <div className="bg-[rgba(255,169,143,0.2)] rounded-full size-20 flex items-center justify-center">
                <svg className="size-10" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M20 30s6-4 9-7c3-3 4-7 2-10-2-3-7-5-11-3-4-2-9-0.5-11 3-2 3-1 7 2 10 3 3 9 7 9 7z" stroke="url(#grad_heart_mb)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="grad_heart_mb" x1="0" x2="1">
                      <stop offset="0%" stopColor="#FFA98F" />
                      <stop offset="100%" stopColor="#FF8566" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <h3 className="text-3xl font-bold text-[#0a0a0a]">Nenhum pet cadastrado</h3>

              <p className="text-[#4a5565] leading-relaxed max-w-md">
                Cadastre o perfil do seu pet para começar a encontrar companhia
                ou parceiros para reprodução responsável.
              </p>

              <button onClick={goToRegister} className="bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center gap-2">
                <Plus className="size-5" />
                Cadastrar Primeiro Pet
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
