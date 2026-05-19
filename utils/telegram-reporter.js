const fs           = require("fs");
const path         = require("path");
const { execSync } = require("child_process");
const { sendMessage, sendDocument } = require("./telegram");

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT         = path.resolve(__dirname, "..");
const HTML_REPORT  = path.join(ROOT, "playwright-report");
const ZIP_PATH     = path.join(ROOT, "playwright-report.zip");
const TEST_RESULTS = path.join(ROOT, "test-results");

// ─── Helper: xóa file / folder ───────────────────────────────────────────────
function removeIfExists(p) {
    if (!fs.existsSync(p)) return;
    fs.rmSync(p, { recursive: true, force: true });
    console.log(`🗑️  Đã xóa: ${path.relative(ROOT, p)}`);
}

class TelegramReporter {
    constructor() {
        this.passed  = 0;
        this.failed  = 0;
        this.skipped = 0;
        this.total   = 0;
    }

    // Đếm kết quả từng test case
    onTestEnd(test, result) {
        this.total++;
        if (result.status === "skipped") {
            this.skipped++;
        } else if (result.status === "passed") {
            this.passed++;
        } else {
            this.failed++;
        }
    }

    // onExit chạy SAU tất cả reporters khác đã ghi xong
    async onExit() {
        // Step 1: Zip HTML report
        if (fs.existsSync(HTML_REPORT)) {
            removeIfExists(ZIP_PATH);
            console.log("📦 Đang nén playwright-report/ ...");
            execSync(
                `powershell -Command "Compress-Archive -Path '${HTML_REPORT}\\*' -DestinationPath '${ZIP_PATH}'"`,
                { stdio: "inherit" }
            );
            console.log("✅ Đã tạo playwright-report.zip");
        }

        // Step 2: Tạo nội dung tổng kết
        let msg = "🚀 PLAYWRIGHT REPORT DỰ ÁN BIOSTATION\n\n";
        msg += `✅ Passed : ${this.passed}\n`;
        msg += `❌ Failed : ${this.failed}\n`;
        msg += `⏭️ Skipped: ${this.skipped}\n`;
        msg += `📊 Total  : ${this.total}`;

        // Step 3: Chỉ gửi 1 thông báo Telegram
        if (fs.existsSync(ZIP_PATH)) {
            await sendDocument(ZIP_PATH, msg);
            console.log("📨 Đã gửi report kèm tổng kết lên Telegram");
        } else {
            await sendMessage(msg);
            console.log("📨 Đã gửi tổng kết lên Telegram");
        }

        // Step 4: Dọn dẹp
        console.log("\n🧹 Dọn dẹp...");
        removeIfExists(ZIP_PATH);
        removeIfExists(HTML_REPORT);
        removeIfExists(TEST_RESULTS);
        console.log("✅ Dọn dẹp xong!");
    }
}

module.exports = TelegramReporter;
