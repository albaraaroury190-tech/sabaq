// The page shown instead of a blocked site, and the toolbar popup. Strings: title, blocked message, popup on, popup off, back link.
const T = {
  en: ["Time to focus", "{site} is blocked until your focus time ends.", "Blocking is on until this focus round ends.", "Nothing is blocked now. Start the focus timer in Sabaq to block your chosen sites.", "Back to Sabaq"],
  ar: ["وقت التركيز", "{site} محجوب حتى ينتهي وقت التركيز.", "الحجب مفعّل حتى تنتهي جولة التركيز هذه.", "لا شيء محجوب الآن. شغّل مؤقت التركيز في سبق لحجب المواقع التي اخترتها.", "العودة إلى سبق"],
  es: ["Hora de concentrarse", "{site} está bloqueado hasta que termine tu tiempo de concentración.", "El bloqueo está activo hasta que termine esta ronda.", "Ahora no hay nada bloqueado. Inicia el temporizador en Sabaq para bloquear los sitios que elegiste.", "Volver a Sabaq"],
  ur: ["توجہ کا وقت", "{site} توجہ کا وقت ختم ہونے تک بند ہے۔", "یہ توجہ کا دور ختم ہونے تک بلاک کرنا جاری ہے۔", "ابھی کچھ بند نہیں ہے۔ اپنی چنی ہوئی سائٹس بند کرنے کے لیے سبق میں توجہ کا ٹائمر شروع کریں۔", "سبق پر واپس جائیں"],
  hi: ["ध्यान लगाने का समय", "फ़ोकस का समय ख़त्म होने तक {site} बंद है।", "यह फ़ोकस राउंड ख़त्म होने तक ब्लॉकिंग चालू है।", "अभी कुछ भी बंद नहीं है। चुनी हुई साइटें बंद करने के लिए Sabaq में फ़ोकस टाइमर शुरू करें।", "Sabaq पर वापस जाएँ"],
  bn: ["মনোযোগের সময়", "ফোকাসের সময় শেষ না হওয়া পর্যন্ত {site} বন্ধ।", "এই ফোকাস রাউন্ড শেষ না হওয়া পর্যন্ত ব্লক চালু আছে।", "এখন কিছুই বন্ধ নেই। বেছে নেওয়া সাইটগুলো বন্ধ করতে Sabaq-এ ফোকাস টাইমার চালু করুন।", "Sabaq-এ ফিরে যান"],
  fr: ["L'heure de se concentrer", "{site} est bloqué jusqu'à la fin de ton temps de concentration.", "Le blocage est actif jusqu'à la fin de cette séance.", "Rien n'est bloqué pour l'instant. Lance le minuteur dans Sabaq pour bloquer les sites choisis.", "Retour à Sabaq"],
  zh: ["专注时间", "专注时间结束前，{site} 已被屏蔽。", "本轮专注结束前会一直屏蔽。", "现在没有屏蔽任何网站。在 Sabaq 中开始专注计时，即可屏蔽你选的网站。", "返回 Sabaq"]
};
const RTL = ["ar", "ur"];
const params = new URLSearchParams(location.search), popup = params.has("popup"), site = params.get("site") || "";
const $ = id => document.getElementById(id);
if (popup) document.body.classList.add("popup");

chrome.storage.local.get(["on", "until", "lang"]).then(({ on, until, lang }) => {
  const s = T[lang] || T.en;
  document.documentElement.lang = T[lang] ? lang : "en";
  document.documentElement.dir = RTL.includes(lang) ? "rtl" : "ltr";
  $("title").textContent = s[0];
  $("back").textContent = s[4];
  const live = on && until > Date.now();
  $("msg").textContent = popup ? (live ? s[2] : s[3]) : s[1].replace("{site}", site);
  if (!live) return;
  const tick = () => {
    const left = Math.max(0, Math.round((until - Date.now()) / 1000)), p = n => String(n).padStart(2, "0");
    const h = Math.floor(left / 3600), m = Math.floor(left % 3600 / 60);
    $("left").textContent = (h ? h + ":" + p(m) : p(m)) + ":" + p(left % 60);
    $("left").hidden = false;
    // When the round ends, open the site that was blocked.
    if (!left) { clearInterval(iv); if (site && !popup) location.href = "https://" + site + "/"; }
  };
  const iv = setInterval(tick, 1000); tick();
});
