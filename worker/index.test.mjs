import assert from "node:assert/strict";
import app, { parseWeek } from "./index.js";

const days = ["2026-11-16","2026-11-17","2026-11-18","2026-11-19","2026-11-20","2026-11-21","2026-11-22"];
const cells = (meal) => `<tr><th><strong>${meal}</strong></th>${days.map((_, i) => `<td><p class="medium">메뉴${i}&amp;국<br>800kcal/30g</p></td>`).join("")}</tr>`;
const fixture = `<table class="week_menu_tbl"><thead><tr><th></th>${days.map(day => `<th><p class="regular">(${day})</p></th>`).join("")}</tr></thead><tbody>${cells("아침")}${cells("점심")}${cells("저녁")}</tbody></table>`;
assert.equal(parseWeek(fixture)[2].meals.점심, "메뉴2&국\n800kcal/30g");

const originalFetch = globalThis.fetch;
let upstreamCalls = 0;
globalThis.fetch = async (url) => {
  upstreamCalls++;
  if (String(url).includes("main.do")) return new Response("", { headers: { "set-cookie": "JSESSIONID=test; Path=/" } });
  return new Response(fixture);
};
try {
  const request = new Request("https://playgroundandsandboxof290.xyz/secret/mobab/hidden/api/menu");
  const response = await app.fetch(request, {});
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.days.length, 14);
  assert.equal(data.days[2].meals.저녁, "메뉴2&국\n800kcal/30g");
  await app.fetch(request, {});
  assert.equal(upstreamCalls, 3, "repeat requests should use the cache");
  console.log("Meal API parsing and caching passed");
} finally {
  globalThis.fetch = originalFetch;
}
