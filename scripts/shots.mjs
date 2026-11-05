import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:5173";

const clickText = (page, text) => page.locator(`button:has-text("${text}")`).first();

async function main() {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // 列表页（桌面）
  await page.screenshot({ path: "assets/design/shot-list.png", fullPage: true });

  // 列表页（375px）
  await page.setViewportSize({ width: 375, height: 800 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "assets/design/shot-list-375.png", fullPage: true });

  // 回桌面
  await page.setViewportSize({ width: 1440, height: 810 });
  await page.waitForTimeout(600);

  // 详情页
  await clickText(page, "查看").click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "assets/design/shot-detail.png", fullPage: true });

  // 返回列表
  await clickText(page, "返回").click();
  await page.waitForTimeout(1000);

  // 新增表单
  await clickText(page, "新增档案").click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "assets/design/shot-form.png", fullPage: true });

  // 返回 -> 地图
  await clickText(page, "返回").click();
  await page.waitForTimeout(800);
  await clickText(page, "网格地图").click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "assets/design/shot-map.png", fullPage: true });

  // 地图 375px
  await page.setViewportSize({ width: 375, height: 800 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "assets/design/shot-map-375.png", fullPage: true });

  await browser.close();
  console.log("screenshots done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
