import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const FACE_IMAGE_DIRECTORY = join(process.cwd(), 'tests', 'fixtures', 'employee-faces');
const FACE_PHOTO_INDEX_FILE = join(FACE_IMAGE_DIRECTORY, '.next-face-photo-index');
const FACE_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp']);

const FACE_PHOTO_SEEDS = readdirSync(FACE_IMAGE_DIRECTORY)
  .filter((fileName) => FACE_IMAGE_EXTENSIONS.has(extname(fileName).toLowerCase()))
  .sort((left, right) => left.localeCompare(right))
  .map((fileName) => readFileSync(join(FACE_IMAGE_DIRECTORY, fileName)).toString('base64'));

if (!FACE_PHOTO_SEEDS.length) {
  throw new Error(`No face image files found in ${FACE_IMAGE_DIRECTORY}`);
}

let nextFacePhotoIndex: number | null = null;

const normalizeFacePhotoIndex = (index: number) => {
  return ((index % FACE_PHOTO_SEEDS.length) + FACE_PHOTO_SEEDS.length) % FACE_PHOTO_SEEDS.length;
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
  return FACE_PHOTO_SEEDS[normalizeFacePhotoIndex(index)];
};

export const buildFacePhotoBase64 = (index = 0) => {
  if (nextFacePhotoIndex === null) {
    nextFacePhotoIndex = readNextFacePhotoIndex(index);
  }

  const facePhoto = FACE_PHOTO_SEEDS[nextFacePhotoIndex];
  nextFacePhotoIndex = (nextFacePhotoIndex + 1) % FACE_PHOTO_SEEDS.length;
  writeNextFacePhotoIndex(nextFacePhotoIndex);

  return facePhoto;
};

export const data = {
  get datacase1() {
    return {
      facePhoto: buildFacePhotoBase64(),
    };
  },
};
