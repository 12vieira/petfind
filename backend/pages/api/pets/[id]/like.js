const { z } = require('zod');
const { ensureDatabase } = require('../../../../src/server/db');
const { initPetModel } = require('../../../../src/server/models/Pet');
const { initLikeModel } = require('../../../../src/server/models/Like');
const { initMatchModel } = require('../../../../src/server/models/Match');
const { toMatchDto } = require('../../../../src/server/dto/match');
const { getTokenFromRequest, verifyToken } = require('../../../../src/server/auth/jwt');
const { applyCors } = require('../../../../src/server/http/cors');

const schema = z.object({
  fromPetId: z.number().int().positive(),
});

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    const data = schema.parse(req.body);
    const toPetId = Number(req.query.id);

    if (!toPetId) {
      return res.status(400).json({ error: 'Invalid pet id' });
    }

    if (data.fromPetId === toPetId) {
      return res.status(400).json({ error: 'Cannot like same pet' });
    }

    const sequelize = await ensureDatabase();
    const Pet = initPetModel(sequelize);
    const Like = initLikeModel(sequelize);
    const Match = initMatchModel(sequelize);

    const fromPet = await Pet.findByPk(data.fromPetId);
    const toPet = await Pet.findByPk(toPetId);

    if (!fromPet || !toPet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (fromPet.ownerId !== payload.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const existingLike = await Like.findOne({
      where: { fromPetId: data.fromPetId, toPetId },
    });

    if (existingLike) {
      return res.status(200).json({ message: 'Already liked', matched: false });
    }

    await Like.create({ fromPetId: data.fromPetId, toPetId });

    const reciprocal = await Like.findOne({
      where: { fromPetId: toPetId, toPetId: data.fromPetId },
    });

    if (reciprocal) {
      const pair = [data.fromPetId, toPetId].sort((a, b) => a - b);
      const existingMatch = await Match.findOne({
        where: { petAId: pair[0], petBId: pair[1] },
      });

      if (!existingMatch) {
        const match = await Match.create({
          petAId: pair[0],
          petBId: pair[1],
          status: 'active',
        });

        return res.status(201).json({
          message: 'Match created',
          matched: true,
          match: toMatchDto(match),
        });
      }
    }

    return res.status(201).json({ message: 'Like created', matched: false });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
