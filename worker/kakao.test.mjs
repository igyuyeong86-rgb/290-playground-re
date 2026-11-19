import assert from "node:assert/strict";
import { formatDay, kakaoRoute, sendDaily } from "./kakao.js";

const longDay = { date: "2026-11-18", meals: { 아침: "가".repeat(500), 점심: "밥\n국", 저녁: "" } };
const messages = formatDay(longDay, "오늘");
assert(messages.length > 1);
assert(messages.every((message) => message.length <= 200));
assert(messages.join(" ").includes("🌙 저녁\n미등록"));
const readable = formatDay({ date: "2026-11-19", meals: { 아침: "보리밥\n두부김치국", 점심: "찰밥\n장각한방탕", 저녁: "일식카레라이스" } }, "오늘");
assert.deepEqual(readable, ["🍽 오늘 식단 · 11/19 (목)\n\n🌅 아침\n보리밥 · 두부김치국\n\n🍱 점심\n찰밥 · 장각한방탕\n\n🌙 저녁\n일식카레라이스"]);

const route = await kakaoRoute(new Request("https://playgroundandsandboxof290.xyz/secret/mobab/hidden/api/connect", {
  method: "POST", headers: { origin: "https://evil.example", "content-type": "application/json" }, body: JSON.stringify({ adminToken: "test" }),
}), { KAKAO_REST_API_KEY: "key", KAKAO_CLIENT_SECRET: "secret", MOBAB_ADMIN_TOKEN: "test", MOBAB_KV: {} }, () => {});
assert.equal(route.status, 403);

await assert.rejects(sendDaily({}, async () => ({ days: [] })), /설정/);

const kv = new Map();
const env = {
  KAKAO_REST_API_KEY: "key", KAKAO_CLIENT_SECRET: "secret", MOBAB_ADMIN_TOKEN: "a-long-test-admin-token",
  MOBAB_KV: { get: async (key) => kv.get(key), put: async (key, value) => { kv.set(key, value); } },
};
const originalFetch = globalThis.fetch;
const outgoing = [];
globalThis.fetch = async (url, options) => {
  if (String(url).includes("oauth/token")) return Response.json({ access_token: "access", refresh_token: "new-refresh" });
  if (String(url).includes("memo/default/send")) {
    outgoing.push(JSON.parse(new URLSearchParams(options.body).get("template_object")).text);
    return Response.json({ result_code: 0 });
  }
  throw new Error(`Unexpected request: ${url}`);
};
try {
  const connect = await kakaoRoute(new Request("https://playgroundandsandboxof290.xyz/secret/mobab/hidden/api/connect", {
    method: "POST", headers: { origin: "https://playgroundandsandboxof290.xyz", "content-type": "application/json" },
    body: JSON.stringify({ adminToken: env.MOBAB_ADMIN_TOKEN }),
  }), env, () => {});
  const authUrl = new URL((await connect.json()).url);
  const callback = new URL("https://playgroundandsandboxof290.xyz/secret/mobab/hidden/api/oauth/callback");
  callback.searchParams.set("code", "test-code");
  callback.searchParams.set("state", authUrl.searchParams.get("state"));
  const connected = await kakaoRoute(new Request(callback), env, () => {});
  assert.equal(connected.status, 303);
  assert(kv.has("kakao-refresh"));
  const getWeeks = async () => ({ days: [
    { date: "2026-11-18", meals: { 아침: "밥", 점심: "국", 저녁: "면" } },
    { date: "2026-11-19", meals: { 아침: "빵", 점심: "김치", 저녁: "고기" } },
  ] });
  const first = await sendDaily(env, getWeeks, new Date("2026-11-18T00:00:00Z"));
  assert.equal(first.sent, 2);
  assert.equal(outgoing.length, 2);
  assert(outgoing[0].startsWith("🍽 오늘 식단"));
  assert(outgoing[1].startsWith("🍽 내일 식단"));
  const preview = await sendDaily(env, getWeeks, new Date("2026-11-18T00:00:00Z"), false);
  assert.equal(preview.sent, 2);
  assert.equal(outgoing.length, 4);
  const second = await sendDaily(env, getWeeks, new Date("2026-11-18T00:00:00Z"));
  assert.equal(second.sent, 0);
  kv.delete("sent:2026-11-18:오늘:0");
  kv.delete("sent:2026-11-18:내일:0");
  const freshTest = await sendDaily(env, getWeeks, new Date("2026-11-18T00:00:00Z"), false);
  assert.equal(freshTest.sent, 2);
  assert(!kv.has("sent:2026-11-18:오늘:0"));
  assert(!kv.has("sent:2026-11-18:내일:0"));
  const scheduled = await sendDaily(env, getWeeks, new Date("2026-11-18T00:00:00Z"));
  assert.equal(scheduled.sent, 2);
  kv.delete("sent:2026-11-18:오늘:0");
  globalThis.fetch = async (url) => String(url).includes("oauth/token")
    ? Response.json({ access_token: "access" })
    : Response.json({ code: -2, msg: "Invalid link domain" }, { status: 400 });
  await assert.rejects(
    sendDaily(env, getWeeks, new Date("2026-11-18T00:00:00Z")),
    /발송 실패 \(-2\): Invalid link domain/,
  );
} finally {
  globalThis.fetch = originalFetch;
}
console.log("Kakao message length, origin check, and missing config passed");
