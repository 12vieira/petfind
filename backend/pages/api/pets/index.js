const { z } = require('zod');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const { ensureDatabase } = require('../../../src/server/db');
const { initUserModel } = require('../../../src/server/models/User');
const { initPetModel } = require('../../../src/server/models/Pet');
const { getTokenFromRequest, verifyToken } = require('../../../src/server/auth/jwt');
const { applyCors } = require('../../../src/server/http/cors');
const { toPetDto, toPetDtoList } = require('../../../src/server/dto/pet');

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

  if (req.method === 'GET') {
    const pets = await Pet.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(toPetDtoList(pets));
  }

  if (req.method === 'POST') {
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
        data = createSchema.parse({
          ...normalizeFields(fields),
          mainPhoto: uploaded.mainPhoto,
          additionalPhotos: uploaded.additionalPhotos,
        });
      } else {
        const body = await parseJsonBody(req);
        data = createSchema.parse(body);
      }

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

      return res.status(201).json(toPetDto(pet));
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

  return res.status(405).json({ error: 'Method not allowed' });
}
