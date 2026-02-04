const { z } = require('zod');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const { ensureDatabase } = require('../../../src/server/db');
const { initUserModel } = require('../../../src/server/models/User');
const { initPetModel } = require('../../../src/server/models/Pet');
const { getTokenFromRequest, verifyToken } = require('../../../src/server/auth/jwt');
const { applyCors } = require('../../../src/server/http/cors');
const { toPetDto } = require('../../../src/server/dto/pet');

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

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadDir() {
  await fs.promises.mkdir(uploadDir, { recursive: true });
}

function normalizeFiles(files, key) {
  if (!files || !files[key]) return [];
  const value = files[key];
  return Array.isArray(value) ? value : [value];
}

async function saveFile(file) {
  if (!file) return null;
  const ext = path.extname(file.originalFilename || '') || '';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const dest = path.join(uploadDir, filename);
  await fs.promises.rename(file.filepath, dest);
  return `/uploads/${filename}`;
}

async function parseMultipart(req) {
  await ensureUploadDir();
  const form = (typeof formidable === 'function' ? formidable : formidable.formidable)({
    multiples: true,
    keepExtensions: true,
    uploadDir,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);
      try {
        const mainPhotoFile = normalizeFiles(files, 'mainPhoto')[0];
        const additionalFiles = normalizeFiles(files, 'additionalPhotos');

        const mainPhotoUrl = await saveFile(mainPhotoFile);
        const additionalUrls = [];
        for (const f of additionalFiles) {
          const url = await saveFile(f);
          if (url) additionalUrls.push(url);
        }

        resolve({
          fields,
          uploaded: {
            mainPhoto: mainPhotoUrl || null,
            additionalPhotos: additionalUrls,
          },
        });
      } catch (fileErr) {
        reject(fileErr);
      }
    });
  });
}

async function parseJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) return {};
  return JSON.parse(raw);
}

function normalizeFields(fields) {
  const get = (key) => (Array.isArray(fields[key]) ? fields[key][0] : fields[key]);
  return {
    name: get('name'),
    species: get('species'),
    breed: get('breed'),
    sex: get('sex'),
    ageMonths: get('ageMonths'),
    age: get('age'),
    description: get('description'),
    bio: get('bio'),
    city: get('city'),
    state: get('state'),
  };
}

export const config = {
  api: { bodyParser: false },
};

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
    return res.json(toPetDto(pet));
  }

  if (req.method === 'PUT') {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const payload = verifyToken(token);
      const contentType = req.headers['content-type'] || '';
      let data;

      if (contentType.includes('multipart/form-data')) {
        const { fields, uploaded } = await parseMultipart(req);
        data = updateSchema.parse({
          ...normalizeFields(fields),
          mainPhoto: uploaded.mainPhoto,
          additionalPhotos: uploaded.additionalPhotos,
        });
      } else {
        const body = await parseJsonBody(req);
        data = updateSchema.parse(body);
      }

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

      return res.json(toPetDto(pet));
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
