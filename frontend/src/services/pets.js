import api from './api';

function normalizePet(pet) {
  if (!pet) return pet;

  const name = pet.name ?? pet.nome ?? '';
  const age = pet.age ?? pet.ageMonths ?? pet.idade ?? '';
  const description = pet.description ?? pet.bio ?? pet.biografia ?? '';
  const location = pet.location ?? [pet.city, pet.state].filter(Boolean).join(', ');
  const mainPhoto = pet.mainPhoto ?? pet.image ?? pet.imageUrl ?? '';

  return {
    ...pet,
    name,
    age,
    description,
    location,
    mainPhoto,
  };
}

export async function listPets() {
  const response = await api.get('/api/pets');
  const data = response.data;
  if (Array.isArray(data)) return data.map(normalizePet);
  return [];
}

export async function createPet(payload) {
  const response = await api.post('/api/pets', payload, {
    withCredentials: true,
    headers: undefined,
  });
  return normalizePet(response.data);
}

export async function updatePet(id, payload) {
  const response = await api.put(`/api/pets/${id}`, payload, {
    withCredentials: true,
    headers: undefined,
  });
  return normalizePet(response.data);
}

export async function deletePet(id) {
  const response = await api.delete(`/api/pets/${id}`, { withCredentials: true });
  return response.data;
}
