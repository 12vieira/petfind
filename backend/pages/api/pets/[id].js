const { z } = require('zod');
const { ensureDatabase } = require('../../../src/server/db');
const { initUserModel } = require('../../../src/server/models/User');
const { initPetModel } = require('../../../src/server/models/Pet');
const { getTokenFromRequest, verifyToken } = require('../../../src/server/auth/jwt');
const { applyCors } = require('../../../src/server/http/cors');

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  species: z.string().min(1).optional(),
  breed: z.string().optional().nullable(),
  sex: z.string().optional().nullable(),
  ageMonths: z.coerce.number().int().nonnegative().optional().nullable(),
  age: z.coerce.number().int().nonnegative().optional().nullable(),
  description: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  mainPhoto: z.string().optional().nullable(),
  additionalPhotos: z.array(z.string()).optional().nullable(),
});

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const sequelize = await ensureDatabase();
  const User = initUserModel(sequelize);
  const Pet = initPetModel(sequelize);

  User.hasMany(Pet, { foreignKey: 'ownerId' });
  Pet.belongsTo(User, { foreignKey: 'ownerId' });

  const petId = Number(req.query.id);
  if (!petId) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (req.method === 'GET') {
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    return res.json(pet);
  }

  if (req.method === 'PUT') {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const payload = verifyToken(token);
      const data = updateSchema.parse(req.body);

      const pet = await Pet.findByPk(petId);
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      if (pet.ownerId !== payload.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await pet.update({
        ...data,
        breed: data.breed ?? pet.breed,
        sex: data.sex ?? pet.sex,
        ageMonths: data.ageMonths ?? data.age ?? pet.ageMonths,
        description: data.description ?? data.bio ?? pet.description,
        city: data.city ?? pet.city,
        state: data.state ?? pet.state,
        mainPhoto: data.mainPhoto ?? pet.mainPhoto,
        additionalPhotos: data.additionalPhotos ?? pet.additionalPhotos,
      });

      return res.json(pet);
    } catch (err) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid input', details: err.errors });
      }
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const payload = verifyToken(token);
      const pet = await Pet.findByPk(petId);
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      if (pet.ownerId !== payload.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await pet.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
