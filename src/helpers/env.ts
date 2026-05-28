import 'dotenv/config';

const DEFAULT_BASE_URL = 'http://10.0.229.130:8086/api/v2/';
const DEFAULT_COUNTER_USERNAME = 'counter';
const DEFAULT_COUNTER_PASSWORD = 'Counter@2025++1';

export const ENV = {
  get BASE_URL() {
    return process.env.BASE_URL ?? DEFAULT_BASE_URL;
  },

  get COUNTER_USERNAME() {
    return process.env.COUNTER_USERNAME ?? DEFAULT_COUNTER_USERNAME;
  },

  get COUNTER_PASSWORD() {
    return process.env.COUNTER_PASSWORD ?? DEFAULT_COUNTER_PASSWORD;
  },
};

export const getBaseUrl = () => ENV.BASE_URL;

export const getCounterCredentials = () => ({
  userName: ENV.COUNTER_USERNAME,
  password: ENV.COUNTER_PASSWORD,
});
