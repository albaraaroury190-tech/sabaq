// Turns the sites chosen in Sabaq into blocking rules while its focus timer runs, and removes them when the round ends,
// even if the Sabaq tab was closed.
const DOMAIN = /^(?=.{4,253}$)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/;
const FIRST_ID = 1000, MAX_SITES = 200;

async function apply({ on, sites, until, lang }) {
  const list = [...new Set((sites || []).map(s => String(s).toLowerCase().trim()).filter(s => DOMAIN.test(s)))].slice(0, MAX_SITES);
  const active = !!on && until > Date.now() && list.length > 0;
  const old = (await chrome.declarativeNetRequest.getDynamicRules()).map(r => r.id);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: old,
    addRules: active ? list.map((d, i) => ({
      id: FIRST_ID + i, priority: 1,
      action: { type: "redirect", redirect: { extensionPath: "/blocked.html?site=" + encodeURIComponent(d) } },
      condition: { requestDomains: [d], resourceTypes: ["main_frame"] }
    })) : []
  });
  await chrome.storage.local.set({ on: active, sites: list, until: active ? until : 0, lang: lang || "en" });
  await chrome.alarms.clear("end");
  if (!active) return;
  chrome.alarms.create("end", { when: until });
  // Tabs already open on a blocked site switch to the blocked page too.
  for (const tab of await chrome.tabs.query({})) {
    let host = "";
    try { host = new URL(tab.url || "").hostname.toLowerCase(); } catch (e) { continue; }
    const hit = list.find(d => host === d || host.endsWith("." + d));
    if (hit) chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("blocked.html?site=" + encodeURIComponent(hit)) }).catch(() => {});
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.id !== chrome.runtime.id || !sender.tab) return;
  apply(msg).catch(e => console.log("blocker", e));
});
chrome.alarms.onAlarm.addListener(a => { if (a.name === "end") apply({ on: false }); });
// After the browser restarts, drop a round that has already ended.
chrome.runtime.onStartup.addListener(async () => {
  const { until } = await chrome.storage.local.get("until");
  if (!until || until <= Date.now()) apply({ on: false });
});
