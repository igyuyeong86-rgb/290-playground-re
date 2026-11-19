const PREFIX = "/secret/mobab/hidden";
const PUBLIC_ORIGIN = "https://playgroundandsandboxof290.xyz";
const PAGE_URL = `${PUBLIC_ORIGIN}${PREFIX}/`;
const CALLBACK_URL = `${PUBLIC_ORIGIN}${PREFIX}/api/oauth/callback`;
const encoder = new TextEncoder();

function bytesToBase64url(bytes) {
  let raw = "";
  for (const byte of bytes) raw += String.fromCharCode(byte);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function base64urlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}
async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function encryptionKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function signState(secret) {
  const payload = bytesToBase64url(encoder.encode(JSON.stringify({ at: Date.now(), nonce: crypto.randomUUID() })));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(payload));
  return `${payload}.${bytesToBase64url(new Uint8Array(signature))}`;
}
async function verifyState(secret, state) {
  const [payload, signature, extra] = (state || "").split(".");
  if (!payload || !signature || extra) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64urlToBytes(payload)));
    const age = Date.now() - data.at;
    if (!Number.isFinite(age) || age < 0 || age > 10 * 60 * 1000 || !data.nonce) return false;
    return crypto.subtle.verify("HMAC", await hmacKey(secret), base64urlToBytes(signature), encoder.encode(payload));
  } catch { return false; }
}
async function encryptToken(secret, token) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(secret), encoder.encode(token));
  return `${bytesToBase64url(iv)}.${bytesToBase64url(new Uint8Array(ciphertext))}`;
}
async function decryptToken(secret, value) {
  const [iv, ciphertext] = (value || "").split(".");
  if (!iv || !ciphertext) throw new Error("저장된 카카오 인증 정보가 올바르지 않습니다.");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64urlToBytes(iv) }, await encryptionKey(secret), base64urlToBytes(ciphertext));
  return new TextDecoder().decode(plain);
}
function required(env) {
  if (!env.KAKAO_REST_API_KEY || !env.KAKAO_CLIENT_SECRET || !env.MOBAB_ADMIN_TOKEN || !env.MOBAB_KV) {
    throw new Error("카카오 연결 설정이 완료되지 않았습니다.");
  }
}
async function tokenRequest(params, env) {
  const body = new URLSearchParams({ ...params, client_id: env.KAKAO_REST_API_KEY, client_secret: env.KAKAO_CLIENT_SECRET });
  const response = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded;charset=utf-8" }, body,
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) throw new Error("카카오 인증 갱신에 실패했습니다.");
  return result;
}
function redirectToPage(query) {
  return new Response(null, { status: 303, headers: { location: `${PAGE_URL}?${query}`, "cache-control": "no-store", "referrer-policy": "no-referrer" } });
}
function seoulDate(offset = 0, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const read = (type) => Number(parts.find((part) => part.type === type).value);
  return new Date(Date.UTC(read("year"), read("month") - 1, read("day") + offset)).toISOString().slice(0, 10);
}
export function formatDay(day, label) {
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][new Date(`${day.date}T00:00:00Z`).getUTCDay()];
  const heading = `🍽 ${label} 식단 · ${day.date.slice(5).replace("-", "/")} (${weekday})`;
  const icons = { 아침: "🌅", 점심: "🍱", 저녁: "🌙" };
  const lines = [];
  for (const meal of ["아침", "점심", "저녁"]) {
    const items = (day.meals[meal] || "").split(/\n+/).map((item) => item.trim()).filter(Boolean).filter((item) => !/kcal/i.test(item));
    const content = items.length ? items.join(" · ") : "미등록";
    let remaining = content;
    let first = true;
    while (remaining.length) {
      const prefix = `${icons[meal]} ${meal}${first ? "" : " (계속)"}\n`;
      const capacity = 200 - `${heading} (계속)\n\n`.length - prefix.length;
      if (capacity < 1) throw new Error("메시지 제목이 너무 깁니다.");
      const delimiter = remaining.lastIndexOf(" · ", capacity);
      const splitAt = remaining.length > capacity && delimiter > 0 ? delimiter : capacity;
      const part = remaining.slice(0, splitAt);
      lines.push(prefix + part);
      remaining = remaining.slice(splitAt).replace(/^ · /, "");
      first = false;
    }
  }
  const messages = [];
  let chunk = heading;
  for (const line of lines) {
    if (chunk.length + 2 + line.length <= 200) { chunk += `\n\n${line}`; continue; }
    messages.push(chunk);
    chunk = `${heading} (계속)\n\n${line}`;
  }
  messages.push(chunk);
  return messages;
}
async function sendMessage(accessToken, text) {
  if (text.length > 200) throw new Error("카카오 메시지 길이 제한을 초과했습니다.");
  const template = { object_type: "text", text, link: { web_url: PAGE_URL, mobile_web_url: PAGE_URL }, button_title: "전체 식단" };
  const response = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams({ template_object: JSON.stringify(template) }),
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  if (!response.ok || result.result_code !== 0) {
    const code = result.code ?? result.result_code ?? response.status;
    const detail = String(result.msg ?? result.message ?? "원인을 확인할 수 없습니다.").replace(/[\r\n\t]/g, " ").slice(0, 160);
    throw new Error(`카카오톡 메시지 발송 실패 (${code}): ${detail}`);
  }
}
export async function sendDaily(env, getWeeks, now = new Date(), recordDelivery = true) {
  required(env);
  const today = seoulDate(0, now), tomorrow = seoulDate(1, now);
  const stored = await env.MOBAB_KV.get("kakao-refresh");
  if (!stored) throw new Error("카카오 계정 연결이 필요합니다.");
  const refreshToken = await decryptToken(env.MOBAB_ADMIN_TOKEN, stored);
  const tokens = await tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken }, env);
  if (tokens.refresh_token) {
    await env.MOBAB_KV.put("kakao-refresh", await encryptToken(env.MOBAB_ADMIN_TOKEN, tokens.refresh_token));
  }
  const week = await getWeeks(true);
  if (week.stale) throw new Error("학교의 최신 식단을 확인할 수 없습니다.");
  const selected = [
    { label: "오늘", day: week.days.find((item) => item.date === today) },
    { label: "내일", day: week.days.find((item) => item.date === tomorrow) },
  ];
  if (selected.some((item) => !item.day)) throw new Error("오늘 또는 내일 식단 날짜를 찾을 수 없습니다.");
  let sent = 0;
  for (const { label, day } of selected) {
    const messages = formatDay(day, label);
    for (const [index, message] of messages.entries()) {
      const key = `sent:${today}:${label}:${index}`;
      if (recordDelivery && await env.MOBAB_KV.get(key)) continue;
      await sendMessage(tokens.access_token, message);
      if (recordDelivery) await env.MOBAB_KV.put(key, "1", { expirationTtl: 3 * 86400 });
      sent++;
    }
  }
  return { sent, today, tomorrow };
}
export async function kakaoRoute(request, env, getWeeks) {
  const url = new URL(request.url);
  if (url.pathname === `${PREFIX}/api/connect` && request.method === "POST") {
    try {
      required(env);
      if (request.headers.get("origin") !== PUBLIC_ORIGIN) return new Response("Forbidden", { status: 403 });
      const { adminToken } = await request.json();
      if (adminToken !== env.MOBAB_ADMIN_TOKEN) return new Response("Unauthorized", { status: 401 });
      const authorize = new URL("https://kauth.kakao.com/oauth/authorize");
      authorize.searchParams.set("response_type", "code");
      authorize.searchParams.set("client_id", env.KAKAO_REST_API_KEY);
      authorize.searchParams.set("redirect_uri", CALLBACK_URL);
      authorize.searchParams.set("scope", "talk_message");
      authorize.searchParams.set("state", await signState(env.MOBAB_ADMIN_TOKEN));
      return Response.json({ url: authorize.href }, { headers: { "cache-control": "no-store" } });
    } catch (error) { return Response.json({ error: error.message }, { status: 503 }); }
  }
  if (url.pathname === `${PREFIX}/api/oauth/callback` && request.method === "GET") {
    try {
      required(env);
      if (!url.searchParams.get("code") || !await verifyState(env.MOBAB_ADMIN_TOKEN, url.searchParams.get("state"))) return redirectToPage("connect=invalid");
      const tokens = await tokenRequest({ grant_type: "authorization_code", code: url.searchParams.get("code"), redirect_uri: CALLBACK_URL }, env);
      if (!tokens.refresh_token) throw new Error("카카오 리프레시 토큰을 받지 못했습니다.");
      await env.MOBAB_KV.put("kakao-refresh", await encryptToken(env.MOBAB_ADMIN_TOKEN, tokens.refresh_token));
      return redirectToPage("connect=success");
    } catch { return redirectToPage("connect=error"); }
  }
  if (url.pathname === `${PREFIX}/api/send-test` && request.method === "POST") {
    try {
      required(env);
      if (request.headers.get("origin") !== PUBLIC_ORIGIN) return new Response("Forbidden", { status: 403 });
      const { adminToken } = await request.json();
      if (adminToken !== env.MOBAB_ADMIN_TOKEN) return new Response("Unauthorized", { status: 401 });
      return Response.json(await sendDaily(env, getWeeks, new Date(), false), { headers: { "cache-control": "no-store" } });
    } catch (error) { return Response.json({ error: error.message }, { status: 503 }); }
  }
  return null;
}
