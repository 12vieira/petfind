import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, User, MapPin, X, Sparkles } from 'lucide-react';
import { likePet } from '../src/services/matches';
import { listPets } from '../src/services/pets';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';
import Image from 'next/image';

export default function MatchDisplay({
  onNavigateToMatches,
  onNavigateToChat,
  onNavigateToPerfil,
  onMatch,
  matches = [],
  currentPetId // id of the user's active pet used when liking other profiles
}) {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const currentProfile = pets[currentIndex];
  const currentImageUrl = currentProfile ? getImageUrl(currentProfile) : '';
  const hasMoreProfiles = currentIndex < pets.length - 1;
  const noProfiles = !loading && !error && pets.length === 0;

  useEffect(() => {
    let mounted = true;

    async function fetchPets() {
      setLoading(true);
      try {
        const data = await listPets();
        if (mounted) setPets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading pets', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPets();

    return () => { mounted = false; };
  }, []);

  function getImageUrl(profile) {
    if (!profile) return '';
    // Common shapes: profile.mainPhoto, profile.image (string), profile.image.url,
    // profile.images = [{url}] or ['url'], profile.photos, profile.imageUrl
    const maybeUrl =
      (typeof profile.mainPhoto === 'string' && profile.mainPhoto) ||
      (typeof profile.image === 'string' && profile.image) ||
      (profile.image && typeof profile.image === 'object' && profile.image.url) ||
      (profile.imageUrl) ||
      '';
    if (maybeUrl) {
      // If server returns a relative path, prefix with API base URL
      if (maybeUrl.startsWith('/')) {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        return `${base.replace(/\/$/, '')}${maybeUrl}`;
      }
      return maybeUrl;
    }
    if (Array.isArray(profile.images) && profile.images.length > 0) {
      const first = profile.images[0];
      if (typeof first === 'string') return first;
      if (first && first.url) return first.url;
    }
    if (Array.isArray(profile.photos) && profile.photos.length > 0) {
      const first = profile.photos[0];
      if (typeof first === 'string') return first;
      if (first && first.url) return first.url;
    }
    if (profile.imageUrl) return profile.imageUrl;
    // fallback: unknown
    return '';
  }

  const handleSwipe = async (direction) => {
    if (!currentProfile) return;

    setSwipeDirection(direction);

    // If user swiped right, notify backend of the like. Backend will create a match
    // if the other side already liked this pet.
    if (direction === 'right' && currentPetId) {
      try {
        const resp = await likePet(currentProfile.id, currentPetId);

        // Determine if backend reported a match. Be permissive about response shape.
        const matched = !!(
          resp && (
            resp.matched === true ||
            resp.isMatch === true ||
            resp.match ||
            resp.id
          )
        );

        if (matched || currentProfile?.hasLikedYou) {
          setCurrentMatch(resp.match || resp || currentProfile);
          setShowMatchNotification(true);

          if (onMatch) {
            onMatch(resp.match || { id: currentProfile.id, petProfile: currentProfile, timestamp: new Date() });
          }
        }
      } catch (err) {
        // ignore for now; could show a toast later
      }
    } else if (direction === 'right' && !currentPetId) {
      // when we don't have an active pet id, keep the previous local behavior
      if (currentProfile?.hasLikedYou) {
        setCurrentMatch(currentProfile);
        setShowMatchNotification(true);
        if (onMatch) {
          onMatch({ id: currentProfile.id, petProfile: currentProfile, timestamp: new Date() });
        }
      }
    }

    setTimeout(() => {
      setSwipeDirection(null);
      if (hasMoreProfiles) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 300);
  };

  const handleLike = () => handleSwipe('right');
  const handleReject = () => handleSwipe('left');

  const closeMatchNotification = () => {
    setShowMatchNotification(false);
    setCurrentMatch(null);
  };

  const handleChatFromMatch = () => {
    closeMatchNotification();
    if (onNavigateToChat) return onNavigateToChat();
    router.push('/chat-on');
  };

  const handleGoMatches = () => {
    if (onNavigateToMatches) return onNavigateToMatches();
    router.push('/matches');
  };

  const handleGoChat = () => {
    if (onNavigateToChat) return onNavigateToChat();
    router.push('/chat-on');
  };

  const handleGoRegister = () => {
    router.push('/pet-register');
  };

  const handleGoPerfil = () => {
    if (onNavigateToPerfil) return onNavigateToPerfil();
    router.push('/tutor-profile');
  };

  return (
    <Layout title="Match">
      <div className="min-h-screen bg-[#FFF7F1] flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 py-8">
        {loading ? (
          <div className="text-center">
            <p className="text-gray-500">Carregando perfis...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500">Erro ao carregar perfis.</p>
          </div>
        ) : currentProfile ? (
          <div className="w-full max-w-md">
            <div
              className={`bg-white rounded-2xl shadow-xl transition-all duration-300 ${
                swipeDirection === 'left'
                  ? '-translate-x-full opacity-0'
                  : swipeDirection === 'right'
                  ? 'translate-x-full opacity-0'
                  : ''
              }`}
            >
              <div className="h-96 rounded-t-2xl overflow-hidden relative bg-slate-100">
                {currentImageUrl ? (
                  <Image
                    src={currentImageUrl}
                    alt={currentProfile.name || 'Pet'}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                    priority={currentIndex === 0}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    Sem foto
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="text-2xl font-bold">
                  {currentProfile.name || 'Pet'}, {currentProfile.age || '-'}
                </h2>

                <div className="flex items-center gap-2 text-sm text-[#4a5565]">
                  <MapPin className="size-4" />
                  {currentProfile.location || 'Localização não informada'}
                </div>

                <p className="mt-3 text-sm">{currentProfile.description || 'Sem descrição.'}</p>

                {currentProfile.hasLikedYou && (
                  <div className="mt-3 flex items-center gap-1 text-[#ffa98f]">
                    <Sparkles className="size-4" />
                    <span className="text-xs">Curtiu você!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-6">
              <button onClick={handleReject} className="size-16 rounded-full border-4 border-red-400 flex items-center justify-center" aria-label="Rejeitar perfil">
                <X className="size-8 text-red-400" />
              </button>

              <button onClick={handleLike} className="size-20 rounded-full bg-gradient-to-r from-[#ffa98f] to-[#ff8566] flex items-center justify-center" aria-label="Curtir perfil">
                <Heart className="size-10 text-white fill-white" />
              </button>
            </div>
          </div>
        ) : noProfiles ? (
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-2">Nenhum perfil disponível</h2>
            <p className="text-slate-600">Cadastre um pet para começar a encontrar matches.</p>
            <button
              onClick={handleGoRegister}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white rounded-full"
            >
              Cadastrar pet
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Você viu todos os perfis!</h2>
            <button onClick={handleGoMatches} className="px-6 py-3 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white rounded-full">
              Ver Matches
            </button>
          </div>
        )}
        </main>

      {/* Match Modal */}
        {showMatchNotification && currentMatch && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full">
              <h2 className="text-3xl font-bold mb-4">É um Match! 🎉</h2>

              <div className="flex justify-center gap-4 mb-6">
                {getImageUrl(currentMatch) ? (
                  <Image
                    src={getImageUrl(currentMatch)}
                    alt={currentMatch?.name || 'Match'}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    Sem foto
                  </div>
                )}
                <Heart className="size-10 text-[#ffa98f] fill-[#ffa98f]" />
              </div>

              <div className="flex gap-3">
                <button onClick={closeMatchNotification} className="flex-1 border rounded-full py-2">
                  Continuar
                </button>
                <button onClick={handleChatFromMatch} className="flex-1 bg-gradient-to-r from-[#ffa98f] to-[#ff8566] text-white rounded-full py-2">
                  Conversar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
