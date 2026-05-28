export {
  buildFacePhotoBase64,
  buildFacePhotoBase64At,
  buildTokenPayload,
} from '../../../src/factories/token.factory.js';

import { buildTokenPayload } from '../../../src/factories/token.factory.js';

export const data = {
  get datacase1() {
    return buildTokenPayload();
  },
};
