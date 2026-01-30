import { useEffect, useState } from 'react';
import { getMe, logoutUser } from '../services/auth';
import { Menu, X, Home, MessageCircle, User } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMe();
        setUser(data);
      } catch (err) {
        setUser(null);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await logoutUser();
    setUser(null);
  }

  return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="size-8">
              {/* Inline fallback logo (removed external svg import) */}
              <svg className="block size-full" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <linearGradient id="logo_grad" x1="0" x2="1">
                    <stop offset="0%" stopColor="#FFA98F" />
                    <stop offset="100%" stopColor="#FF8566" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="12" r="6" stroke="url(#logo_grad)" strokeWidth="2.5" fill="rgba(255,168,143,0.06)" />
                <path d="M10 22c1-2 3-3 6-3s5 1 6 3" stroke="#F6AD55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <circle cx="11.5" cy="11" r="1.2" fill="#FF8566" />
                <circle cx="20.5" cy="11" r="1.2" fill="#FF8566" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ffa98f] to-[#ff8566] bg-clip-text text-transparent">
              PetFind
            </h1>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <button className="size-12 rounded-xl bg-[rgba(255,169,143,0.13)] flex items-center justify-center hover:bg-[rgba(255,169,143,0.2)] transition-colors">
              <Home className="size-6 text-[#FFA98F]" />
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
  );
}




// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { getMe, logoutUser } from '../services/auth';
// import { Menu, X } from 'lucide-react';

// export default function Header() {
//   const [user, setUser] = useState(null);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     async function loadUser() {
//       try {
//         const data = await getMe();
//         setUser(data);
//       } catch (err) {
//         setUser(null);
//       }
//     }

//     loadUser();
//   }, []);

//   async function handleLogout() {
//     await logoutUser();
//     setUser(null);
//   }

//   return (
//     <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
//       <div className="container-page flex items-center justify-between py-4">
//         <Link className="text-xl font-semibold tracking-tight" href="/">PetFind</Link>

//         <nav aria-label="Main navigation" className="hidden md:flex items-center gap-4 text-sm text-slate-600">
//           <Link className="hover:text-slate-900" href="/register">Cadastro</Link>
//           <Link className="hover:text-slate-900" href="/login">Login</Link>
//           <Link className="hover:text-slate-900" href="/pets">Pets</Link>
//           <Link className="hover:text-slate-900" href="/matches">Matches</Link>
//           <Link className="hover:text-slate-900" href="/chat">Chat</Link>
//         </nav>

//         <div className="flex items-center gap-3 text-sm">
//           <div className="hidden md:flex items-center gap-3">
//             {user ? (
//               <>
//                 <span className="text-slate-600">Olá, {user.name}</span>
//                 <button
//                   className="btn-secondary"
//                   onClick={handleLogout}
//                   type="button"
//                 >
//                   Sair
//                 </button>
//               </>
//             ) : (
//               <span className="text-slate-500">Visitante</span>
//             )}
//           </div>

//           <button
//             aria-expanded={open}
//             aria-label={open ? 'Fechar menu' : 'Abrir menu'}
//             onClick={() => setOpen((v) => !v)}
//             className="md:hidden p-2 rounded-lg hover:bg-slate-100"
//             type="button"
//           >
//             {open ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       <div className={`md:hidden ${open ? 'block' : 'hidden'}`}>
//         <div className="border-t border-slate-100 bg-white">
//           <div className="px-4 py-3 space-y-2">
//             <Link className="block py-2 px-2 rounded hover:bg-slate-50" href="/register">Cadastro</Link>
//             <Link className="block py-2 px-2 rounded hover:bg-slate-50" href="/login">Login</Link>
//             <Link className="block py-2 px-2 rounded hover:bg-slate-50" href="/pets">Pets</Link>
//             <Link className="block py-2 px-2 rounded hover:bg-slate-50" href="/matches">Matches</Link>
//             <Link className="block py-2 px-2 rounded hover:bg-slate-50" href="/chat">Chat</Link>
//             <div className="pt-2">
//               {user ? (
//                 <>
//                   <div className="text-sm text-slate-700">Olá, {user.name}</div>
//                   <button className="mt-2 btn-secondary w-full" onClick={handleLogout} type="button">Sair</button>
//                 </>
//               ) : (
//                 <div className="text-sm text-slate-600">Visitante</div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
