// Runs on the Sabaq website only. Passes the page's focus-timer state to the blocker, and tells the page the blocker is here.
const hello = () => window.postMessage({ sabaqExt: "hello", version: chrome.runtime.getManifest().version }, location.origin);
window.addEventListener("message", e => {
  if (e.source !== window || e.origin !== location.origin || !e.data) return;
  if (e.data.sabaq === "ping") hello();
  if (e.data.sabaq === "block") chrome.runtime.sendMessage({
    on: !!e.data.on, sites: Array.isArray(e.data.sites) ? e.data.sites : [], until: Number(e.data.until) || 0, lang: String(e.data.lang || "en")
  });
});
hello();
