import assert from "node:assert/strict";
import { formatDay, kakaoRoute, sendDaily } from "./kakao.js";

const longDay = { date: "2026-11-18", meals: { 아침: "가".repeat(500), 점심: "밥\n국", 저녁: "" } };
const messages = formatDay(longDay, "오늘");
assert(messages.length > 1);
assert(messages.every((message) => message.length <= 200));
assert(messages.join(" ").includes("저녁: 미등록"));

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
  assert(outgoing[0].startsWith("오늘"));
  assert(outgoing[1].startsWith("내일"));
  const second = await sendDaily(env, getWeeks, new Date("2026-11-18T00:00:00Z"));
  assert.equal(second.sent, 0);
} finally {
  globalThis.fetch = originalFetch;
}
console.log("Kakao message length, origin check, and missing config passed");
