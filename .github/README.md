# GitHub Workflows

Automated CI/CD pipelines for SawCode development and deployment.

## Workflows

### 1. **build.yml** - Build & Type Check
Runs on every push and PR to `main` or `develop`.

**Tasks:**
- ✅ Install dependencies
- ✅ Type checking (TypeScript strict mode)
- ✅ Build to `dist/`
- ✅ Lint code
- ✅ Run tests
- ✅ Upload build artifacts
- ✅ Comment on PR with status

**Triggered by:**
- Push to main/develop
- Pull requests
- Changes to src/, package.json, tsconfig.json

**Status:** Essential - Blocks merge if failed

---

### 2. **deploy.yml** - GitHub Pages Deployment
Deploys documentation to GitHub Pages when docs change.

**Tasks:**
- 📚 Build Jekyll site from docs/
- 📄 Copy web assets from web/
- 🚀 Deploy to GitHub Pages
- 🌐 Auto-update site URL

**Triggered by:**
- Push to main with changes to docs/
- Manual workflow dispatch
- Changes to _config.yml

**Output:** Live documentation at GitHub Pages

---

### 3. **quality.yml** - Code Quality Checks
Ensures code quality and consistency.

**Tasks:**
- 🔍 Format checking (Biome)
- 🎨 Lint (Biome)
- 📝 Type checking
- 📋 Archive reports
- 💬 Comment on PR

**Triggered by:**
- Push to main/develop
- Pull requests
- Changes to src/, examples/

**Status:** Non-blocking but recommended

---

### 4. **release.yml** - Create Release
Generates releases from package.json version changes.

**Tasks:**
- 📦 Type check
- 🔨 Build
- 📝 Generate release notes
- 🏷️ Create GitHub Release
- 📤 Upload build artifacts

**Triggered by:**
- Manual workflow dispatch
- Version bump in package.json

**Output:** GitHub Release with build artifacts

---

### 5. **security.yml** - Security Scanning
Weekly dependency and security checks.

**Tasks:**
- 🔐 Audit dependencies (bun audit)
- 📦 Check installations
- 🔍 Type check security
- 📊 Generate reports

**Triggered by:**
- Weekly (Sunday at midnight UTC)
- Manual workflow dispatch
- Dependency changes

**Status:** Informational

---

## Workflow Status

All workflows are **enabled and active**.

View status: https://github.com/JonusNattapong/SawCode/actions

## Quick Reference

### Manual Triggers

Trigger any workflow manually from GitHub Actions:

```
GitHub repo → Actions tab → Select workflow → Run workflow
```

### Viewing Logs

- Go to Actions tab
- Click workflow run
- Click job to expand
- See detailed logs for each step

### Common Issues

**Build failing on type check?**
```bash
bun run type-check
```

**Linting issues?**
```bash
bun run lint
bun run format:fix
```

**Build not deploying to Pages?**
- Check if GitHub Pages is enabled
- Verify _config.yml exists
- Check deploy.yml logs

## Environment Variables

**For workflows that need credentials:**
- Add to GitHub Secrets: https://github.com/JonusNattapong/SawCode/settings/secrets
- Reference with: `${{ secrets.SECRET_NAME }}`

Current secrets needed:
- None required (currently using public-only operations)

## Adding New Workflows

1. Create `.github/workflows/name.yml`
2. Use existing workflows as templates
3. Test with workflow_dispatch trigger first
4. Enable auto-triggers when stable

---

See individual .yml files for detailed configuration.
