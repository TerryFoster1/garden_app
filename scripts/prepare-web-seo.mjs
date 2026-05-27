import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const distDir = join(root, "dist");
const publicDir = join(root, "public");
const indexPath = join(distDir, "index.html");

const siteUrl = "https://pattypan.ca";
const title = "Pattypan | Your Garden Companion";
const description =
  "Pattypan is a mobile-first garden companion for weather-aware plant care, photo memory, diagnosis, and garden planning.";
const heroImage = `${siteUrl}/assets/landing/pattypan-vegetable-garden-hero.jpg`;
const themeColor = "#12351F";

copyPublicAssets(publicDir, distDir);
copyLandingShareImage();
injectIndexMetadata(indexPath);
writePublicInfoPages();

function copyPublicAssets(sourceDir, destinationDir) {
  if (!existsSync(sourceDir)) {
    return;
  }

  for (const entry of readdirSync(sourceDir)) {
    const sourcePath = join(sourceDir, entry);
    const destinationPath = join(destinationDir, entry);
    const stats = statSync(sourcePath);

    if (stats.isDirectory()) {
      mkdirSync(destinationPath, { recursive: true });
      copyPublicAssets(sourcePath, destinationPath);
      continue;
    }

    mkdirSync(dirname(destinationPath), { recursive: true });
    copyFileSync(sourcePath, destinationPath);
  }
}

function injectIndexMetadata(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Expected Expo web export at ${filePath}`);
  }

  let html = readFileSync(filePath, "utf8");
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);

  const tags = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${siteUrl}/" />`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`,
    `<meta name="theme-color" content="${themeColor}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Pattypan" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${siteUrl}/" />`,
    `<meta property="og:image" content="${heroImage}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${heroImage}" />`
  ].join("\n    ");

  if (html.includes("<!-- pattypan-seo -->")) {
    html = html.replace(/<!-- pattypan-seo -->[\s\S]*?<!-- \/pattypan-seo -->/, `<!-- pattypan-seo -->\n    ${tags}\n    <!-- /pattypan-seo -->`);
  } else {
    html = html.replace("</head>", `    <!-- pattypan-seo -->\n    ${tags}\n    <!-- /pattypan-seo -->\n  </head>`);
  }

  writeFileSync(filePath, html);
}

function copyLandingShareImage() {
  const sourcePath = join(root, "assets", "landing", "pattypan-vegetable-garden-hero.jpg");
  const destinationPath = join(distDir, "assets", "landing", "pattypan-vegetable-garden-hero.jpg");

  if (!existsSync(sourcePath)) {
    return;
  }

  mkdirSync(dirname(destinationPath), { recursive: true });
  copyFileSync(sourcePath, destinationPath);
}

function writePublicInfoPages() {
  const pages = [
    {
      path: "library",
      title: "Pattypan Library | Garden care, diagnosis, and growing guides",
      heading: "Pattypan Library",
      description:
        "Search plant care topics, diagnose garden problems, and learn practical growing skills for vegetables, herbs, flowers, houseplants, and containers.",
      body:
        "The Library is Pattypan's public learning layer for plant care, pests, diseases, propagation, growing from seed, and seasonal garden guidance."
    },
    {
      path: "privacy",
      title: "Privacy Policy | Pattypan",
      heading: "Privacy Policy",
      description:
        "Pattypan is designed around private garden data, plant photos, location-aware weather, and user-controlled account information.",
      body:
        "Pattypan's production privacy policy will describe how account data, garden records, location, plant photos, diagnosis history, and provider-backed AI/API requests are handled before public beta."
    },
    {
      path: "terms",
      title: "Terms of Service | Pattypan",
      heading: "Terms of Service",
      description:
        "Pattypan helps with garden planning and plant care, but users should confirm plant identification and care actions before relying on recommendations.",
      body:
        "Pattypan's production terms will cover acceptable use, subscriptions, cancellation behavior, AI/provider limitations, and the requirement that users confirm gardening actions before acting."
    },
    {
      path: "support",
      title: "Support | Pattypan",
      heading: "Support",
      description:
        "Get help with Pattypan account setup, plant identification, weather-aware care, garden planning, and mobile-first testing.",
      body:
        "Support documentation will expand as Pattypan moves from local alpha into public beta. For now, this page confirms the support route and indexing foundation."
    }
  ];

  for (const page of pages) {
    const pageDir = join(distDir, page.path);
    mkdirSync(pageDir, { recursive: true });
    writeFileSync(join(pageDir, "index.html"), renderStaticPage(page));
  }
}

function renderStaticPage(page) {
  const canonical = `${siteUrl}/${page.path}`;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta name="theme-color" content="${themeColor}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Pattypan" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${heroImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #fffdf3;
        background:
          linear-gradient(90deg, rgba(5,18,10,0.86), rgba(5,18,10,0.42)),
          url("/assets/landing/pattypan-vegetable-garden-hero.jpg") center/cover;
      }
      main {
        width: min(680px, calc(100% - 48px));
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 48px 0;
        margin-left: clamp(24px, 8vw, 120px);
      }
      a { color: #f6d36b; font-weight: 800; text-decoration: none; }
      .mark {
        width: 48px;
        height: 48px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: rgba(255,255,255,0.14);
        border: 1px solid rgba(255,255,255,0.2);
        margin-bottom: 28px;
      }
      h1 {
        margin: 0;
        max-width: 620px;
        font-size: clamp(44px, 8vw, 78px);
        line-height: 0.96;
        letter-spacing: -1.5px;
      }
      p {
        max-width: 560px;
        font-size: 18px;
        line-height: 1.58;
        color: rgba(255,253,243,0.86);
      }
      .panel {
        margin-top: 28px;
        padding: 28px;
        border-radius: 28px;
        background: rgba(7,28,15,0.48);
        border: 1px solid rgba(255,255,255,0.18);
        box-shadow: 0 24px 80px rgba(0,0,0,0.35);
        backdrop-filter: blur(14px);
      }
      @media (max-width: 720px) {
        main { margin: 0 auto; justify-content: flex-end; padding-bottom: 42px; }
        .panel { padding: 22px; }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="mark" aria-hidden="true">&#127793;</div>
      <h1>${escapeHtml(page.heading)}</h1>
      <div class="panel">
        <p>${escapeHtml(page.body)}</p>
        <p><a href="/">Return to Pattypan</a></p>
      </div>
    </main>
  </body>
</html>`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
