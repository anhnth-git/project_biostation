import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const FACE_IMAGE_DIRECTORY = join(process.cwd(), 'tests', 'fixtures', 'employee-faces');
const FACE_PHOTO_INDEX_FILE = join(FACE_IMAGE_DIRECTORY, '.next-face-photo-index');
const FACE_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp']);

const facePhotoSeeds = readdirSync(FACE_IMAGE_DIRECTORY)
  .filter((fileName) => FACE_IMAGE_EXTENSIONS.has(extname(fileName).toLowerCase()))
  .sort((left, right) => left.localeCompare(right))
  .map((fileName) => readFileSync(join(FACE_IMAGE_DIRECTORY, fileName)).toString('base64'));

if (!facePhotoSeeds.length) {
  throw new Error(`No face image files found in ${FACE_IMAGE_DIRECTORY}`);
}

let nextFacePhotoIndex: number | null = null;

const normalizeFacePhotoIndex = (index: number) => {
  return ((index % facePhotoSeeds.length) + facePhotoSeeds.length) % facePhotoSeeds.length;
};

const readNextFacePhotoIndex = (fallbackIndex: number) => {
  if (!existsSync(FACE_PHOTO_INDEX_FILE)) {
    return normalizeFacePhotoIndex(fallbackIndex);
  }

  const storedIndex = Number.parseInt(readFileSync(FACE_PHOTO_INDEX_FILE, 'utf8').trim(), 10);

  if (Number.isNaN(storedIndex)) {
    return normalizeFacePhotoIndex(fallbackIndex);
  }

  return normalizeFacePhotoIndex(storedIndex);
};

const writeNextFacePhotoIndex = (index: number) => {
  writeFileSync(FACE_PHOTO_INDEX_FILE, String(normalizeFacePhotoIndex(index)));
};

export const buildFacePhotoBase64At = (index: number) => {
  return facePhotoSeeds[normalizeFacePhotoIndex(index)];
};

export const buildFacePhotoBase64 = (index = 0) => {
  if (nextFacePhotoIndex === null) {
    nextFacePhotoIndex = readNextFacePhotoIndex(index);
  }

  const facePhoto = facePhotoSeeds[nextFacePhotoIndex];
  nextFacePhotoIndex = (nextFacePhotoIndex + 1) % facePhotoSeeds.length;
  writeNextFacePhotoIndex(nextFacePhotoIndex);

  return facePhoto;
};

export interface TokenPayload {
  facePhoto: string;
  [key: string]: unknown;
}

export const buildTokenPayload = (overrides: Partial<TokenPayload> = {}): TokenPayload => {
  return {
    facePhoto: buildFacePhotoBase64(),
    ...overrides,
  };
};
