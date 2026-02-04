const { z } = require('zod');
const { ensureDatabase } = require('../../../../src/server/db');
const { initPetModel } = require('../../../../src/server/models/Pet');
const { initMatchModel } = require('../../../../src/server/models/Match');
const { initMessageModel } = require('../../../../src/server/models/Message');
const { getTokenFromRequest, verifyToken } = require('../../../../src/server/auth/jwt');
const { Op } = require('sequelize');
const { applyCors } = require('../../../../src/server/http/cors');
const { toMessageDto, toMessageDtoList } = require('../../../../src/server/dto/message');

const createSchema = z.object({
  text: z.string().min(1),
});

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  const matchId = Number(req.query.id);
  if (!matchId) {
    return res.status(400).json({ error: 'Invalid match id' });
  }

  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    const sequelize = await ensureDatabase();

    const Pet = initPetModel(sequelize);
    const Match = initMatchModel(sequelize);
    const Message = initMessageModel(sequelize);

    const myPets = await Pet.findAll({ where: { ownerId: payload.id } });
    const petIds = myPets.map(p => p.id);

    const match = await Match.findOne({
      where: {
        id: matchId,
        [Op.or]: [
          { petAId: { [Op.in]: petIds } },
          { petBId: { [Op.in]: petIds } },
        ],
      },
    });

    if (!match) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method === 'GET') {
      const messages = await Message.findAll({
        where: { matchId },
        order: [['createdAt', 'ASC']],
      });
      return res.json(toMessageDtoList(messages));
    }

    if (req.method === 'POST') {
      const data = createSchema.parse(req.body);
      const message = await Message.create({
        matchId,
        senderId: payload.id,
        text: data.text,
      });

      return res.status(201).json(toMessageDto(message));
    }

    return res.status(405).json({ error: 'Method not allowed' });
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
