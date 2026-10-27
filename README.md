# W3 Creative Technology Studio

Static, dependency-free website. The four portfolio previews are desktop captures of the live sites named in the brief. The hero uses those captures in code-built mockups.

## Run

- `npm run build` produces `dist/`.
- `npm run preview` serves `dist/` at `http://127.0.0.1:4173/`.
- `npm run dev` serves the source folder at the same address.

No package installation is required. GSAP 3.15.0 and ScrollTrigger are local vendor assets (GSAP standard license), and the Manrope font is bundled locally with its OFL license in `public/fonts/Manrope-OFL.txt`.

## Before launch

1. Confirm W3 is the final studio name and approve the custom W3 wordmark.
2. Provide a project inquiry destination or backend. The current form validates and prepares a copyable brief, but **does not send or store it**.
3. The GitHub Pages workflow builds for `https://jay-rtl.github.io/W3/`. To build for another final HTTPS URL, set `SITE_URL` (including any path and trailing slash), for example `$env:SITE_URL='https://example.com/'; npm.cmd run build`. This sets asset paths, canonical URL, social image URL, and sitemap.
4. Review project wording, screenshots, and permission to feature the four client websites.
5. Perform live inbox, device, and production performance checks after deployment.
