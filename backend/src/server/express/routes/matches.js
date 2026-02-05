const express = require('express');
const { z } = require('zod');
const { ensureDatabase } = require('../../db');
const { initPetModel } = require('../../models/Pet');
const { initMatchModel } = require('../../models/Match');
const { initMessageModel } = require('../../models/Message');
const { getTokenFromRequest, verifyToken } = require('../../auth/jwt');
const { Op } = require('sequelize');
const { toMatchDtoList } = require('../../dto/match');
const { toMessageDto, toMessageDtoList } = require('../../dto/message');

const router = express.Router();

const messageSchema = z.object({
  text: z.string().min(1),
});

router.get('/', async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    const sequelize = await ensureDatabase();

    const Pet = initPetModel(sequelize);
    const Match = initMatchModel(sequelize);

    const myPets = await Pet.findAll({ where: { ownerId: payload.id } });
    const petIds = myPets.map((p) => p.id);

    if (petIds.length === 0) {
      return res.json([]);
    }

    const matches = await Match.findAll({
      where: {
        [Op.or]: [
          { petAId: { [Op.in]: petIds } },
          { petBId: { [Op.in]: petIds } },
        ],
      },
      order: [['createdAt', 'DESC']],
    });

    return res.json(toMatchDtoList(matches));
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/messages', async (req, res) => {
  const matchId = Number(req.params.id);
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
    const petIds = myPets.map((p) => p.id);

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

    const messages = await Message.findAll({
      where: { matchId },
      order: [['createdAt', 'ASC']],
    });

    return res.json(toMessageDtoList(messages));
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/messages', async (req, res) => {
  const matchId = Number(req.params.id);
  if (!matchId) {
    return res.status(400).json({ error: 'Invalid match id' });
  }

  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    const data = messageSchema.parse(req.body || {});

    const sequelize = await ensureDatabase();

    const Pet = initPetModel(sequelize);
    const Match = initMatchModel(sequelize);
    const Message = initMessageModel(sequelize);

    const myPets = await Pet.findAll({ where: { ownerId: payload.id } });
    const petIds = myPets.map((p) => p.id);

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

    const message = await Message.create({
      matchId,
      senderId: payload.id,
      text: data.text,
    });

    return res.status(201).json(toMessageDto(message));
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
});

module.exports = router;
