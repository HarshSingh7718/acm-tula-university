# ACM Tula's Student Chapter — Official Website

The official modern web platform for the **ACM Student Chapter at Tula's University, Dehradun**. Engineered with a futuristic cyberpunk aesthetic, high-performance scroll choreography, hardware-accelerated 3D canvas sequences, and responsive mobile architecture.

---

## 🚀 Tech Stack

- **Framework**: [Astro 5](https://astro.build/) (Static Output, zero JS by default)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **Typography**: PolySans (Wide / Slim / Median / Bulky) + JetBrains Mono
- **Animations & Smooth Scroll**:
  - [GSAP](https://greensock.com/gsap/) + [ScrollTrigger](https://greensock.com/scrolltrigger/)
  - [Lenis](https://lenis.darkroom.engineering/) smooth wheel momentum
- **Linting & Code Quality**: [Biome](https://biomejs.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/) / [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

---

## ⚡ Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) (v18.17+ / v20+)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Kultzuki/ACM-SITE-REMAKE.git
cd ACM-SITE-REMAKE
```

### 2. Install Dependencies

Using Bun:
```bash
bun install
```

Or using npm / pnpm:
```bash
npm install
# or
pnpm install
```

### 3. Start Development Server

```bash
bun run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser to view the site.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Starts local Astro development server on port `4321` |
| `bun run build` | Builds optimized static production bundle in `dist/` |
| `bun run check` | Runs Astro typecheck (`astro check`) and Biome linter (`biome check .`) |
| `bun run deploy` | Builds static assets and deploys to Cloudflare via Wrangler |

---

## 📁 Project Architecture

```text
├── public/
│   ├── media/
│   │   ├── fonts/           # PolySans font family suite
│   │   ├── images/          # Chapter logos, medallions, and backdrops
│   │   ├── laptopFrames/    # 125-frame AVIF 3D laptop opening sequence
│   │   └── video/           # Hero campus background video loops
├── src/
│   ├── components/
│   │   ├── About.astro              # Staggered CRT reveal & GSAP stat count-up
│   │   ├── BecauseTechMatters.astro # Core mission statement banner
│   │   ├── Board.astro              # Executive chapter board & faculty roster
│   │   ├── BoardCard.astro          # Interactive frosted glass ID badge cards
│   │   ├── ContactLaptop.astro      # 3D laptop canvas scroll-scrub + mobile card
│   │   ├── Events.astro             # Interactive horizontal carousel & event drawer
│   │   ├── Footer.astro             # Global footer with mountain visual backdrop
│   │   ├── Gallery.astro            # Team highlight backdrop & vault modal
│   │   ├── Header.astro             # Floating blurred navigation pill
│   │   ├── Hero.astro               # Fullscreen headline with campus video loop
│   │   ├── LegendPins.astro         # Floating metric coordinate markers
│   │   ├── Preloader.astro          # Chapter boot screen
│   │   └── ProofGallery.astro       # Tech-grid archive modal body
│   ├── content/
│   │   ├── about.json       # Chapter overview panels & milestones
│   │   ├── board.json       # 21 leadership member profiles & roles
│   │   ├── events.json      # Hackathon & workshop event data
│   │   └── gallery.json     # Archive entries & dates
│   ├── layouts/
│   │   └── Layout.astro     # Base HTML layout, SEO meta tags, and Lenis init
│   ├── scripts/
│   │   ├── scroll.ts        # Global Lenis + ScrollTrigger ticker synchronization
│   │   └── video-scrub.ts   # Scroll-based video time scrub engine
│   └── styles/
│       └── global.css       # Global styles, fonts, and Tailwind v4 directives
├── astro.config.mjs         # Astro configuration with Tailwind Vite plugin
├── biome.json               # Biome linter and formatter rules
├── package.json             # Dependencies and build scripts
└── tsconfig.json            # Strict TypeScript configuration
```

---

## 🌐 Deployment

The build output is a 100% static site located in `dist/`.

### Cloudflare Pages

Deploy directly with Wrangler:
```bash
bun run deploy
```

Or connect the repository to **Cloudflare Pages** dashboard with the following build settings:
- **Build command**: `bun run build` (or `npm run build`)
- **Build output directory**: `dist`
- **Node.js version**: `20+`

---

## 📄 License

Created for **ACM Student Chapter, Tula's University**. All rights reserved.
