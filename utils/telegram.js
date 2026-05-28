const https = require('https');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function hasTelegramConfig() {
  return Boolean(BOT_TOKEN && CHAT_ID);
}

function sendMessage(text) {
  if (!hasTelegramConfig()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const body = JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' });
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (!parsed.ok) {
          console.warn('Telegram sendMessage failed:', parsed.description);
        }
        resolve(parsed);
      });
    });

    req.on('error', (err) => {
      console.warn('Telegram sendMessage failed:', err.message);
      resolve(null);
    });

    req.write(body);
    req.end();
  });
}

function sendDocument(filePath, caption = '') {
  if (!hasTelegramConfig()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);
    const boundary = `----FormBoundary${Date.now()}`;
    const metaPart =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="chat_id"\r\n\r\n` +
      `${CHAT_ID}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="caption"\r\n\r\n` +
      `${caption}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="document"; filename="${fileName}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`;
    const endPart = `\r\n--${boundary}--\r\n`;
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendDocument`,
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (!parsed.ok) {
          console.warn('Telegram sendDocument failed:', parsed.description);
        }
        resolve(parsed);
      });
    });

    req.on('error', (err) => {
      console.warn('Telegram sendDocument failed:', err.message);
      resolve(null);
    });

    req.write(metaPart);
    fileStream.pipe(req, { end: false });
    fileStream.on('end', () => {
      req.write(endPart);
      req.end();
    });
  });
}

module.exports = { sendMessage, sendDocument };
