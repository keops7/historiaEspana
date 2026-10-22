// Shared leaderboard API for Historia de España, backed by Cloudflare KV.
// Everything else falls through to the static game files (env.ASSETS).

const KV_KEY = "scores";
const MAX_ENTRIES = 50;
const MAX_NAME_LEN = 20;
const MAX_TIME_MS = 1000 * 60 * 60 * 6; // 6h sanity cap

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/leaderboard") {
      if (request.method === "GET") return handleGet(env);
      if (request.method === "POST") return handlePost(request, env);
      return json({ error: "method not allowed" }, 405);
    }
    return env.ASSETS.fetch(request);
  }
};

async function handleGet(env) {
  const list = (await env.LEADERBOARD.get(KV_KEY, "json")) || [];
  return json(list);
}

async function handlePost(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "invalid json" }, 400);
  }

  const name = sanitizeName(body.name);
  const timeMs = Number(body.timeMs);
  const wave = Math.max(0, Math.floor(Number(body.wave) || 0));
  const won = body.won === true;

  if (!name) return json({ error: "name required" }, 400);
  if (!Number.isFinite(timeMs) || timeMs <= 0 || timeMs > MAX_TIME_MS) {
    return json({ error: "invalid time" }, 400);
  }

  const list = (await env.LEADERBOARD.get(KV_KEY, "json")) || [];
  list.push({ name, timeMs, wave, won, at: Date.now() });
  list.sort(rankEntries);
  const trimmed = list.slice(0, MAX_ENTRIES);
  await env.LEADERBOARD.put(KV_KEY, JSON.stringify(trimmed));
  return json(trimmed);
}

// victories first (fastest time wins), then losses (furthest wave first)
function rankEntries(a, b) {
  if (a.won !== b.won) return a.won ? -1 : 1;
  if (a.won) return a.timeMs - b.timeMs;
  return b.wave - a.wave || a.timeMs - b.timeMs;
}

function sanitizeName(raw) {
  if (typeof raw !== "string") return "";
  return raw.trim().replace(/[<>]/g, "").slice(0, MAX_NAME_LEN);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
