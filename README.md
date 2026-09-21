# Songflow Studio

Title: MakeASongWith.Me — Interactive Landing Page Prototype

Goal: Build a dark-mode landing page that feels like Spotify meets Lovable.dev — elegant, musical, glowing, and community-driven. The page should show the current evolving song, invite users to contribute ideas, and display live updates from the community.

Core Layout (one page only):

Sticky Top Player — A glowing waveform player with play/pause, current version label (e.g. v4), and a “Remix in 13:21:07” countdown timer. Background behind player uses a slowly shifting mint-to-magenta gradient.

Central Prompt Section — A large text input box labeled “What should the song do next?” with a submit button.

AI Direction Panel (below input) — Box titled “AI is Listening…” showing a 1-2 sentence mock summary of what users are asking for.

Right Sidebar — Live comment stream that updates in real time (fake data ok), plus a “Top Contributors” list with avatars and usernames.

Bottom Mix History Bar — Chips showing previous versions v1 → v2 → v3 → v4; clicking opens a drawer with fake “what changed” notes.

Design Style:

Dark background (#0E0E0E)

Animated gradient accent (mint #00E0AC ⇄ magenta #FF65E0)

Fonts: Space Grotesk or Inter

Rounded corners, soft shadows, hover glows

Subtle motion on hover, comments slide-in

Tech Stack (prototype-friendly):

Next.js + Tailwind + TypeScript

Zustand or local state for fake data

shadcn/ui + lucide-react for components/icons

Seed with fake content: 12 users, 40 comments, 4 song versions. Countdown timer runs in real time. Comments update every few seconds to simulate activity.

Deliverables:

A single responsive page at / with all the above sections.

Clean, modular components.

Looks polished enough for a design pitch, even with placeholder data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c0a8d63e-9f0d-4dec-b467-a74576504757).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
