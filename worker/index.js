import { kakaoRoute, sendDaily } from "./kakao.js";

const PREFIX = "/secret/mobab/hidden";
const HOME = "https://dorm.kku.ac.kr/main.do?dormType=M";
const SOURCE = "https://dorm.kku.ac.kr/weekly_diet.do?menuSeq=43860&bachelor=MO";
const CACHE_MS = 15 * 60 * 1000;
let menuCache;

function decodeHtml(value) {
  return value.replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .trim();
}

export function parseWeek(html) {
  const table = html.match(/<table\b[^>]*class=["'][^"']*week_menu_tbl[^"']*["'][^>]*>([\s\S]*?)<\/table>/i)?.[1];
  if (!table) throw new Error("학교 식단 표를 찾을 수 없습니다.");
  const head = table.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i)?.[1] ?? "";
  const dates = [...head.matchAll(/\((\d{4}-\d{2}-\d{2})\)/g)].map((match) => match[1]);
  if (dates.length !== 7) throw new Error("식단 날짜를 읽을 수 없습니다.");
  const days = dates.map((date) => ({ date, meals: {} }));
  const body = table.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)?.[1] ?? "";
  for (const row of body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const meal = decodeHtml(row[1].match(/<th\b[^>]*>([\s\S]*?)<\/th>/i)?.[1] ?? "");
    if (!["아침", "점심", "저녁"].includes(meal)) continue;
    [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)]
      .slice(0, 7)
      .forEach((cell, index) => { days[index].meals[meal] = decodeHtml(cell[1]); });
  }
  return days;
}

async function getWeeks(force = false) {
  if (!force && menuCache && Date.now() - menuCache.at < CACHE_MS) return menuCache.data;
  try {
    const headers = { accept: "text/html", "user-agent": "MosiraeMenu/1.0 (personal meal viewer)" };
    const home = await fetch(HOME, { headers, redirect: "manual", signal: AbortSignal.timeout(10000) });
    if (!home.ok) throw new Error("학교 홈페이지에 연결할 수 없습니다.");
    const cookie = (home.headers.get("set-cookie") ?? "").split(";")[0];
    if (cookie) headers.cookie = cookie;
    const page = await fetch(SOURCE, { headers: { ...headers, referer: HOME }, redirect: "manual", signal: AbortSignal.timeout(10000) });
    if (!page.ok) throw new Error("학교 주간 식단에 연결할 수 없습니다.");
    const current = parseWeek(await page.text());
    if (!current.some((day) => Object.values(day.meals).some(Boolean))) throw new Error("학교에서 이번 주 식단을 제공하지 않았습니다.");
    const nextUrl = new URL(SOURCE);
    nextUrl.searchParams.set("target_day", current[0].date);
    nextUrl.searchParams.set("time_shift", "next");
    let next = [];
    try {
      const nextPage = await fetch(nextUrl, { headers: { ...headers, referer: SOURCE }, redirect: "manual", signal: AbortSignal.timeout(10000) });
      if (nextPage.ok) next = parseWeek(await nextPage.text());
    } catch { /* Next week's menu may not be posted yet. */ }
    const data = { days: [...current, ...next], fetchedAt: new Date().toISOString(), source: SOURCE };
    menuCache = { data, at: Date.now() };
    return data;
  } catch (error) {
    if (menuCache) return { ...menuCache.data, stale: true };
    throw error;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith(`${PREFIX}/api/`) && url.pathname !== `${PREFIX}/api/menu`) {
      const response = await kakaoRoute(request, env, getWeeks);
      return response ?? new Response("Not Found", { status: 404 });
    }
    if (url.pathname === `${PREFIX}/api/menu`) {
      try {
        const data = await getWeeks(url.searchParams.has("refresh"));
        return Response.json(data, { headers: { "cache-control": "no-store" } });
      } catch (error) {
        return Response.json({ error: error.message ?? "식단을 가져오지 못했습니다." }, { status: 502 });
      }
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(_event, env) {
    await sendDaily(env, getWeeks);
  },
};
