/* eslint-disable @next/next/no-img-element */
import { Send, Paperclip, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../src/components/Layout';
import { listMessages, sendMessage, listMatches } from '../src/services/matches';

export default function ChatOn() {
  const router = useRouter();
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showPedigreeModal, setShowPedigreeModal] = useState(false);
  const [pedigreeFile, setPedigreeFile] = useState(null);
  const [conversations, setConversations] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // `conversations` will be loaded from backend via `listMatches()`

  const [messages, setMessages] = useState([]);

  const activeConv = conversations.find((c) => c.id === activeConversation);

  // Load matches (conversations) on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await listMatches();
        if (!mounted) return;
        // backend returns matches — we map to a lightweight conversation structure
        const mapped = data.map((m) => ({
          id: m.id,
          petAId: m.petAId,
          petBId: m.petBId,
          createdAt: m.createdAt,
          name: `Match #${m.id}`,
          lastMessage: 'Conversa iniciada',
          time: m.createdAt ? new Date(m.createdAt).toLocaleDateString('pt-BR') : ''
        }));
        setConversations(mapped);
        if (mapped.length > 0 && activeConversation === null) setActiveConversation(mapped[0].id);
      } catch (err) {
        console.error('Failed to load matches', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, [activeConversation]);

  // Poll messages for the active conversation
  useEffect(() => {
    if (!activeConversation) return;

    let mounted = true;
    let stopped = false;
    let timeoutId = null;
    const POLL_MS = 4000;

    async function fetchMessages() {
      try {
        if (typeof document !== 'undefined' && document.hidden) {
          return;
        }
        const data = await listMessages(activeConversation);
        if (!mounted) return;
        // map backend message shape to UI-friendly shape
        const mapped = data.map((m) => ({ id: m.id, text: m.text, time: new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), isSent: m.senderId === null ? false : true, raw: m }));
        setMessages(mapped);
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    }

    function scheduleNext() {
      if (stopped) return;
      timeoutId = setTimeout(async () => {
        await fetchMessages();
        scheduleNext();
      }, POLL_MS);
    }

    // initial load
    fetchMessages();

    scheduleNext();

    return () => {
      mounted = false;
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const sent = await sendMessage(activeConversation, newMessage.trim());
      // backend returns created message — append to messages
      const mapped = { id: sent.id, text: sent.text, time: new Date(sent.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), isSent: true, raw: sent };
      setMessages((prev) => [...prev, mapped]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setPedigreeFile(file.name);
  };

  const handleSendPedigree = () => {
    if (!pedigreeFile) return;

    const newMsg = {
      id: messages.length + 1,
      text: 'Segue o pedigree do meu pet!',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      fileType: 'pedigree',
      fileName: pedigreeFile,
    };

    setMessages([...messages, newMsg]);
    setShowPedigreeModal(false);
    setPedigreeFile(null);
  };

  const hasConversations = conversations.length > 0;

  return (
    <Layout title="Chat">
      <div className="min-h-screen bg-[#FFF7F1] flex flex-col">
        <main className="flex-1 container-page py-8">
        <div className="grid md:grid-cols-3 gap-6 h-full">
          {/* Conversations list */}
          <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {!hasConversations ? (
              <div className="text-center py-6">
                <p className="text-slate-600">Nenhuma conversa ainda.</p>
                <button
                  onClick={() => router.push('/match-display')}
                  className="mt-4 btn"
                >
                  Buscar matches
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConversation(c.id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 hover:bg-slate-50 ${activeConversation === c.id ? 'ring-2 ring-amber-200' : ''}`}
                  >
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold">
                        M
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.time}</div>
                      </div>
                      <div className="text-sm text-gray-500 truncate">{c.lastMessage}</div>
                      <div className="text-xs text-gray-400 mt-1">Pets {c.petAId} & {c.petBId}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages area */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col" style={{ minHeight: '70vh' }}>
            {!hasConversations ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <h3 className="text-lg font-semibold">Sem conversas</h3>
                  <p className="text-slate-600 mt-2">Curta um pet para iniciar um chat.</p>
                  <button onClick={() => router.push('/match-display')} className="mt-4 btn">Ir para Match</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 border-b pb-3 mb-3">
                  {activeConv?.avatar ? (
                    <img src={activeConv?.avatar} alt={activeConv?.name} className="w-12 h-12 rounded-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold">M</div>
                  )}
                  <div>
                    <div className="font-semibold">{activeConv?.name || 'Match'}</div>
                    <div className="text-sm text-gray-500">Pets {activeConv?.petAId} • {activeConv?.petBId}</div>
                  </div>
                  <div className="ml-auto text-sm text-gray-400">{activeConv?.time}</div>
                </div>

                <div className="flex-1 overflow-y-auto px-2" id="messages">
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.isSent ? 'justify-end' : 'justify-start'}`}>
                        <div className={`${m.isSent ? 'bg-amber-100 text-slate-900' : 'bg-slate-100 text-slate-900'} rounded-2xl p-3 max-w-[70%]`}>
                          <div className="text-sm">{m.text}</div>
                          <div className="text-xs text-gray-400 mt-1 text-right">{m.time}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="p-2 rounded-lg hover:bg-slate-50" aria-label="Anexar arquivo">
                      <Paperclip />
                    </button>
                    <input ref={fileInputRef} type="file" accept="*" onChange={handleFileUpload} onClick={(e) => e.stopPropagation()} className="hidden" />

                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 input resize-none h-12"
                    />

                    <button onClick={handleSendMessage} className="btn" aria-label="Enviar mensagem">
                      <Send />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </main>

        {showPedigreeModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Enviar Pedigree</h3>
                <button onClick={() => setShowPedigreeModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-gray-600">Escolha o arquivo do pedigree:</div>
                <div className="flex items-center gap-3">
                  <input type="file" accept="application/pdf,image/*" onChange={handleFileUpload} onClick={(e) => e.stopPropagation()} />
                  <div className="text-sm text-gray-500">{pedigreeFile || 'Nenhum arquivo selecionado'}</div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowPedigreeModal(false)} className="btn-secondary">Cancelar</button>
                  <button onClick={handleSendPedigree} className="btn">Enviar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
