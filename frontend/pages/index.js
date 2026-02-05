import { Home as HomeIcon, MessageCircle, User, ArrowRight, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../src/components/Header';
import svgPaths from '../imports/svg-g4lmkag22m';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const router = useRouter();

  // Parallax 3D com movimento do mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);

      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax no scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF7F1]">
      <Header />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-24">
        {/* Hero */}
        <section
          ref={heroRef}
          className="flex flex-col items-center text-center space-y-8 relative"
          style={{ perspective: '1000px' }}
        >
          {/* Background blobs */}
          <div
            className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#FFA98F] to-[#FF8566] opacity-20 blur-2xl"
            style={{
              transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px) translateY(${scrollY * 0.5}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />

          <div
            className="absolute top-32 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-[#FF8566] to-[#FFA98F] opacity-15 blur-3xl"
            style={{
              transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px) translateY(${scrollY * 0.3}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />

          <div
            className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-[#FFA98F] to-[#FF8566] opacity-10 blur-2xl"
            style={{
              transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px) translateY(${scrollY * 0.4}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />

          {/* Icon */}
          <div
            className="bg-[#ffa98f] rounded-full w-[70px] h-[70px] flex items-center justify-center p-3 relative z-10 shadow-lg"
            style={{
              transform: `translate(${mousePosition.x * 6}px, ${mousePosition.y * 6}px) translateY(${scrollY * 0.08}px)`,
              transition: 'transform 0.3s ease-out',
            }}
            aria-hidden
          >
            <Heart className="w-7 h-7 text-white" />
          </div>

          <h2
            className="text-4xl md:text-6xl font-bold text-[#0a0a0a] max-w-4xl"
            style={{
              transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px) translateY(${scrollY * 0.15}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            Encontre o par perfeito para seu pet!
          </h2>

          <p
            className="text-lg md:text-2xl text-[#4a5565] max-w-2xl"
            style={{
              transform: `translate(${mousePosition.x * 5}px, ${mousePosition.y * 5}px) translateY(${scrollY * 0.1}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            Conecte tutores de cães e gatos que buscam companhia e reprodução responsável.
          </p>

          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-2 hover:scale-105 transition"
            aria-label="Começar agora"
          >
            Começar Agora
            <ArrowRight className="w-6 h-6" />
          </button>
        </section>

        {/* CTA final */}
        <section className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-[#0a0a0a]">Pronto para começar?</h2>
          <p className="text-lg text-[#4a5565] max-w-2xl mx-auto">
            Junte-se a milhares de tutores que já encontraram companhia para seus pets.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-2 mx-auto"
            aria-label="Criar conta grátis"
          >
            Criar Conta Grátis
            <ArrowRight className="w-6 h-6" />
          </button>
        </section>
      </main>
    </div>
  );
}