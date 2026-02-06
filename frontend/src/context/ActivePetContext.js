import React, { createContext, useContext, useState, useEffect } from 'react';

const ActivePetContext = createContext(null);

export function ActivePetProvider({ children }) {
  const [activePetId, setActivePetId] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('activePetId');
      if (raw) setActivePetId(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (activePetId == null) sessionStorage.removeItem('activePetId');
      else sessionStorage.setItem('activePetId', JSON.stringify(activePetId));
    } catch (e) {
      // ignore
    }
  }, [activePetId]);

  return (
    <ActivePetContext.Provider value={{ activePetId, setActivePetId }}>
      {children}
    </ActivePetContext.Provider>
  );
}

export function useActivePet() {
  const ctx = useContext(ActivePetContext);
  if (!ctx) throw new Error('useActivePet must be used inside ActivePetProvider');
  return ctx;
}

export default ActivePetContext;
