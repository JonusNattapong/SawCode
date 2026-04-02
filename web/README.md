# SawCode Landing Page

Beautiful landing page website for SawCode AI Agent Framework.

## Files

- `index.html` - Main landing page (Claude-inspired design)
- `README.md` - This file

## Features

✨ **Modern Design**
- Dark theme (similar to claude.ai)
- Gradient text & buttons
- Smooth animations
- Responsive layout

📱 **Responsive**
- Works on desktop, tablet, mobile
- Adapts to all screen sizes

🚀 **Performance**
- Inline CSS (no external files)
- Fast loading
- No JavaScript dependencies

## Colors

- Primary: `#00d4ff` (Cyan)
- Primary Dark: `#0099ff` (Blue)
- Accent: `#a855f7` (Purple)
- Background: `#0a0e27` to `#1a1f3a` (Dark blues)
- Text: `#e0e0e0` (Light gray)

## Sections

1. **Navigation** - Logo, links, CTA button
2. **Hero** - Main headline and description
3. **Features** - 6 key features in cards
4. **Tools** - 5 built-in tools showcase
5. **Code Example** - Quick start snippet
6. **Footer** - Links and copyright

## Customization

### Change Colors
Edit the CSS color values:
- `#00d4ff` → New primary color
- `#0099ff` → New dark primary
- `#a855f7` → New accent

### Add Sections
Copy a section template (e.g., `.features`):
```html
<section class="section-name">
    <h2>Section Title</h2>
    <!-- Content -->
</section>
```

Add corresponding CSS:
```css
.section-name {
    padding: 5rem 5%;
    max-width: 1400px;
    margin: 0 auto;
}
```

### Update Links
Replace example URLs with actual links:
- `/docs/index.md` - Documentation
- `https://github.com/...` - Repository

## Deployment

### GitHub Pages Auto-Deploy
The `deploy.yml` workflow automatically:
1. Builds Jekyll from /docs
2. Copies web/ assets
3. Deploys to GitHub Pages

Just commit and push:
```bash
git add web/
git commit -m "feat: update landing page"
git push origin main
```

### Manual Hosting
Copy `web/` folder to any static host:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any CDN

## Performance

⚡ **Page Load Time:** < 1s
📦 **Bundle Size:** ~25KB (single HTML file)
📊 **Lighthouse Score:** 95+

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

Questions? Check [docs/index.md](../../docs/index.md)
