// Sabaq's free AI helper. The Sabaq website and the installed app send students' questions here, and an open
// model on Cloudflare Workers AI answers them, so nobody needs a Claude account or an API key.
// Each address is limited per minute and the whole site has a daily cap, which keeps the helper inside
// Workers AI's free daily allowance.

const MODEL = "@cf/google/gemma-4-26b-a4b-it";
const CUT = "\u0000cut"; // sent after a streamed answer that hit the length limit
const LIMITS = { turns: 14, chars: 60000, imageChars: 6_000_000, answerTokens: 1800, jsonTokens: 2500 };

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (!allowedOrigins(env).includes(origin)) return json({ error: "forbidden" }, 403, {});
    const cors = { "Access-Control-Allow-Origin": origin, "Vary": "Origin" };
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...cors, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" } });
    }
    if (request.method !== "POST" || new URL(request.url).pathname !== "/chat") return json({ error: "not_found" }, 404, cors);

    let input;
    try { input = clean(await request.json()); } catch (e) { return json({ error: "bad_request" }, 400, cors); }

    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const { success } = await env.PER_IP.limit({ key: ip });
    if (!success) return json({ error: "rate_limited" }, 429, cors);
    const today = env.DAILY.get(env.DAILY.idFromName(new Date().toISOString().slice(0, 10)));
    const used = Number(await (await today.fetch("https://count/")).text());
    if (used > Number(env.MAX_PER_DAY || 250)) return json({ error: "daily_limit" }, 429, cors);

    const messages = input.messages.map(m => ({ role: m.role, content: m.content }));
    if (input.image) {
      const last = messages[messages.length - 1];
      last.content = [{ type: "text", text: last.content }, { type: "image_url", image_url: { url: input.image } }];
    }
    const options = {
      messages,
      max_completion_tokens: input.json ? LIMITS.jsonTokens : LIMITS.answerTokens,
      chat_template_kwargs: { enable_thinking: false },
      stream: !input.json,
    };

    let result;
    try { result = await env.AI.run(MODEL, options); }
    catch (e) {
      const msg = String(e && e.message || e);
      console.log("ai error", msg);
      return json({ error: /neuron|allocation|quota|4006/i.test(msg) ? "daily_limit" : "upstream" }, 503, cors);
    }

    if (input.json) {
      const choice = result && result.choices && result.choices[0];
      const text = choice ? (choice.message && choice.message.content) || "" : (result && result.response) || "";
      return json({ text, truncated: !!(choice && choice.finish_reason === "length") }, 200, cors);
    }
    return new Response(result.pipeThrough(sseToText()), { headers: { ...cors, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  },
};

// Checks the request: up to 14 turns of user/assistant text ending with the student, and an optional photo.
function clean(body) {
  const turns = Array.isArray(body && body.messages) ? body.messages.slice(-LIMITS.turns) : [];
  const messages = turns.map(m => ({ role: m && m.role === "assistant" ? "assistant" : "user", content: String((m && m.content) || "").trim() })).filter(m => m.content);
  const size = messages.reduce((n, m) => n + m.content.length, 0);
  if (!messages.length || messages[messages.length - 1].role !== "user" || size > LIMITS.chars) throw new Error("bad");
  let image = "";
  if (body.image) {
    image = String(body.image);
    if (!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > LIMITS.imageChars) throw new Error("bad");
  }
  return { messages, image, json: body.json === true };
}

// Turns the model's server-sent events into plain text, so the page can show the answer as it arrives.
function sseToText() {
  const dec = new TextDecoder(), enc = new TextEncoder();
  let buf = "", cut = false;
  const line = (l, out) => {
    if (!l.startsWith("data:")) return;
    const data = l.slice(5).trim();
    if (!data || data === "[DONE]") return;
    try {
      const ev = JSON.parse(data), choice = ev.choices && ev.choices[0];
      const text = choice ? (choice.delta && choice.delta.content) || "" : ev.response || "";
      if (choice && choice.finish_reason === "length") cut = true;
      if (text) out.enqueue(enc.encode(text));
    } catch (e) {}
  };
  return new TransformStream({
    transform(chunk, out) {
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop();
      lines.forEach(l => line(l.trim(), out));
    },
    flush(out) {
      line(buf.trim(), out);
      if (cut) out.enqueue(enc.encode(CUT));
    },
  });
}

// One counter per day for the whole site.
export class DailyCount {
  constructor(state) { this.state = state; }
  async fetch() {
    const n = ((await this.state.storage.get("n")) || 0) + 1;
    await this.state.storage.put("n", n);
    if (n === 1) await this.state.storage.setAlarm(Date.now() + 3 * 86400000);
    return new Response(String(n));
  }
  async alarm() { await this.state.storage.deleteAll(); }
}

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}
