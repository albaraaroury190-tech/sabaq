# Publishing Sabaq Blocker on the Chrome Web Store

Everything the store asks for is ready in this folder. Publishing needs your own Google account and a one-time US$5 developer registration fee.

## Steps

1. Go to https://chrome.google.com/webstore/devconsole and sign in with your Google account.
2. Register as a developer: accept the agreement, pay the one-time US$5 fee and confirm your email address.
3. Click **New item** and upload `sabaq-blocker.zip` (download it from https://sabaq-study.pages.dev/blocker/sabaq-blocker.zip).
4. Fill in the tabs using the text below:
   - **Store listing**: description, category, language, the icon and the images in `store/`
   - **Privacy**: single purpose, permission justifications and data use
   - **Distribution**: Public, all regions, free
5. Click **Submit for review**. Google's review usually takes from a few days to a couple of weeks.

When it is approved, send me the store link and I'll put it in the app instead of the download and install steps.

## Store listing

**Name:** Sabaq Blocker

**Summary** (up to 132 characters):
Blocks Facebook, Instagram, Threads, YouTube and other distracting sites while your Sabaq focus timer runs.

**Description:**

Sabaq Blocker works with Sabaq Study Desk, a free homework helper for students (https://sabaq-study.pages.dev).

Choose what distracts you in Sabaq's focus timer: Facebook, Instagram, Threads, YouTube, TikTok, X, Snapchat, Reddit, or any website you add. While a focus round runs, those sites show a calm "Time to focus" page with the time left, instead of the feed. When the round ends or you pause the timer, they open normally again.

- Blocks only during focus, and only the sites you picked
- Tabs already open on a blocked site switch to the focus page too
- Works even if you close the Sabaq tab: blocking ends on time by itself
- In English, العربية, Español, اردو, हिन्दी, বাংলা, Français and 中文
- Free, no account, no ads, and no data leaves your computer

**Category:** Productivity → Workflow & Planning (or Education)

**Language:** English

**Graphics** (in `store/`):
- Store icon: `sabaq-blocker/icon-128.png` (128×128)
- Screenshots: `store/screenshot-1.png`, `store/screenshot-2.png` (1280×800)
- Small promo tile: `store/promo-440x280.png`

**Website:** https://sabaq-study.pages.dev/

## Privacy tab

**Single purpose:**
Block the websites a student chose in Sabaq Study Desk while Sabaq's focus timer is running, and unblock them when the focus round ends.

**Permission justifications:**
- `declarativeNetRequest`: adds and removes the rules that redirect the chosen sites to the extension's "Time to focus" page during a focus round.
- `host_permissions` (`<all_urls>`): students can add any website to block, and redirecting a site to the focus page needs access to that site's address.
- `tabs`: when a focus round starts, finds tabs already open on a blocked site so they switch to the focus page.
- `storage`: keeps the chosen sites and the round's end time on the device, so the focus page can show the time left.
- `alarms`: removes the blocking rules when the focus round ends, even if the Sabaq tab was closed.
- Content script on sabaq-study.pages.dev: receives the focus timer's state from the Sabaq page.

**Remote code:** No, I am not using remote code.

**Data use:** tick nothing in the list of data types. The extension does not collect or transmit user data. Tick all three certifications (no selling, no unrelated use, no creditworthiness use).

**Privacy policy URL:** https://sabaq-study.pages.dev/blocker/privacy/
