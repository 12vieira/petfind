const { z } = require('zod');
const { ensureDatabase } = require('../../../src/server/db');
const { initUserModel } = require('../../../src/server/models/User');
const { initPetModel } = require('../../../src/server/models/Pet');
const { getTokenFromRequest, verifyToken } = require('../../../src/server/auth/jwt');
const { applyCors } = require('../../../src/server/http/cors');

const createSchema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
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

  if (req.method === 'GET') {
    const pets = await Pet.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(pets);
  }

  if (req.method === 'POST') {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const payload = verifyToken(token);
      const data = createSchema.parse(req.body);

      const pet = await Pet.create({
        ownerId: payload.id,
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        sex: data.sex || null,
        ageMonths: data.ageMonths ?? data.age ?? null,
        description: data.description ?? data.bio ?? null,
        city: data.city || null,
        state: data.state || null,
        mainPhoto: data.mainPhoto || null,
        additionalPhotos: data.additionalPhotos || [],
      });

      return res.status(201).json(pet);
    } catch (err) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid input', details: err.errors });
      }
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
