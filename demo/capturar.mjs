// Gera as capturas de tela de docs/img a partir da demonstração (dados 100% fictícios).
// Pré-requisitos: node 22+, Google Chrome, e a demonstração gerada:
//   uv run python demo/gerar_demo.py
//   uv run wacrypttools --db demo/saida/msgstore.db --media demo/saida/Media --out demo/saida/pendrive --contacts demo/saida/contatos.csv --copy-media
// Uso: node demo/capturar.mjs
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const chromePath = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const pageUrl = pathToFileURL(path.join(root, "demo", "saida", "pendrive", "index.html")).href;
const outDir = path.join(root, "docs", "img");
mkdirSync(outDir, { recursive: true });

const profile = mkdtempSync(path.join(tmpdir(), "wa-shot-"));
const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--remote-debugging-port=9444",
  "--window-size=1280,780", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws, id = 0;
const pending = new Map();
for (let i = 0; i < 40 && !ws; i++) {
  try {
    const targets = await (await fetch("http://127.0.0.1:9444/json")).json();
    const page = targets.find((t) => t.type === "page");
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  } catch { ws = null; await sleep(250); }
}
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const run = (expression) => send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(path.join(outDir, name + ".png"), Buffer.from(r.result.data, "base64"));
  console.log("ok", name);
};
const typeInto = (selector, text) => run(`(() => { const e = document.querySelector('${selector}'); e.value = ${JSON.stringify(text)}; e.dispatchEvent(new Event('input')); })()`);
const openChat = (title) => run(`[...document.querySelectorAll('#list .item')].find(i => i.textContent.includes(${JSON.stringify(title)})).click()`);

await send("Page.enable");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
await send("Page.navigate", { url: pageUrl });
await sleep(1500);

await shot("01-lista-de-conversas");

await openChat("Ana Demonstração");
await sleep(800);
await run("document.querySelector('.ad-card').scrollIntoView({ block: 'start' })");
await sleep(300);
await shot("02-conversa-com-anuncio");
await run("document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight");
await sleep(400);
await shot("03-conversa-com-midias");

await run("document.getElementById('lightbox').hidden || 0; document.querySelector('.media-img').click()");
await sleep(500);
await shot("04-imagem-ampliada");
await run("document.getElementById('lbClose').click()");

await openChat("Bruno Exemplo");
await sleep(800);
await run("document.querySelector('.na').scrollIntoView({ block: 'center' })");
await sleep(300);
await shot("05-midia-indisponivel");

await run("document.getElementById('searchBtn').click()");
await typeInto("#cq", "recebi");
await sleep(600);
await shot("06-busca-na-conversa");
await run("document.getElementById('cqClose').click()");

await run("document.querySelector('[data-tab=msgs]').click()");
await typeInto("#q", "orcamento");
await sleep(900);
await shot("07-busca-em-todas-as-mensagens");

await run("document.querySelector('[data-tab=chats]').click()");
await typeInto("#q", "90000-0003");
await sleep(500);
await shot("08-busca-por-telefone");

await typeInto("#q", "");
await run("document.documentElement.setAttribute('data-theme', 'dark')");
await openChat("Equipe Demonstração");
await sleep(600);
await shot("09-tema-escuro-grupo");

chrome.kill();
process.exit(0);
