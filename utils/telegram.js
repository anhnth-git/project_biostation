const https = require("https");
const fs    = require("fs");
const path  = require("path");

// ─── CẤU HÌNH ────────────────────────────────────────────────────────────────
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7825059503:AAH89i6_Hwmq5CD_IiWogqllfiKnIyoooZw";
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID   || "-5292286801";
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gửi text message lên Telegram
 * @param {string} text
 */
function sendMessage(text) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" });
        const options = {
            hostname: "api.telegram.org",
            path: `/bot${BOT_TOKEN}/sendMessage`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                const parsed = JSON.parse(data);
                if (!parsed.ok) {
                    console.warn("⚠️ Telegram sendMessage thất bại:", parsed.description);
                }
                resolve(parsed);
            });
        });

        req.on("error", (err) => {
            console.warn("⚠️ Không gửi được Telegram message:", err.message);
            resolve(null); // không throw để teardown vẫn tiếp tục
        });

        req.write(body);
        req.end();
    });
}

/**
 * Gửi file (document) lên Telegram
 * @param {string} filePath - đường dẫn tuyệt đối đến file
 * @param {string} caption
 */
function sendDocument(filePath, caption = "") {
    return new Promise((resolve, reject) => {
        const fileName   = path.basename(filePath);
        const fileStream = fs.createReadStream(filePath);
        const boundary   = "----FormBoundary" + Date.now();

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
            hostname: "api.telegram.org",
            path: `/bot${BOT_TOKEN}/sendDocument`,
            method: "POST",
            headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
        };

        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                const parsed = JSON.parse(data);
                if (!parsed.ok) {
                    console.warn("⚠️ Telegram sendDocument thất bại:", parsed.description);
                }
                resolve(parsed);
            });
        });

        req.on("error", (err) => {
            console.warn("⚠️ Không gửi được Telegram document:", err.message);
            resolve(null);
        });

        req.write(metaPart);
        fileStream.pipe(req, { end: false });
        fileStream.on("end", () => {
            req.write(endPart);
            req.end();
        });
    });
}

module.exports = { sendMessage, sendDocument };
