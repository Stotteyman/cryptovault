# CryptoVault: Deployment Guide

## Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `cryptovault`
3. Description: `Risk. Loot. Survive. Repeat. - A Play-to-Earn crypto dungeon crawler`
4. Choose **Public** (for transparency in crypto projects)
5. Do NOT initialize with README (we already have one)
6. Click **Create repository**

## Step 2: Connect Local Git to GitHub

In your terminal:

```bash
cd "f:\Work\VSC\crypto game"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/cryptovault.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Install Netlify CLI

```bash
npm install -g netlify-cli
```

Verify installation:
```bash
netlify --version
```

## Step 4: Create Netlify Site

### Option A: Connect via CLI (Recommended)

```bash
cd "f:\Work\VSC\crypto game"

# Login to Netlify
netlify login

# This will open a browser to authenticate. Authorize the CLI.
```

### Option B: Create via Dashboard

1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign up or log in
3. Click **New site from Git**
4. Select **GitHub**
5. Authorize Netlify for GitHub
6. Select `your-username/cryptovault` repository
7. Configure build:
   - **Build command:** `npm run build`
   - **Publish directory:** `client/dist`
8. Click **Deploy site**

## Step 5: Configure Netlify Settings

### Environment Variables

In Netlify Dashboard:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add these variables:

```
VITE_API_URL = https://cryptovault-api.netlify.app
VITE_CHAIN_ID = 137
VITE_RPC_URL = https://polygon-rpc.com
NODE_ENV = production
```

### Deploy Trigger

After setup, any push to `main` branch automatically deploys.

## Step 6: Deploy to Netlify

### First Deployment

```bash
cd "f:\Work\VSC\crypto game"

# Install dependencies
npm install

# Build the project
npm run build

# Deploy (if not connected via Git)
netlify deploy --prod
```

### Automatic Deployments (via GitHub)

Once GitHub integration is set up:
- Every push to `main` → Auto-deploys to production
- Every push to `develop` → Auto-deploys to staging
- Pull requests → Deploy previews created automatically

## Step 7: Verify Deployment

1. Check Netlify dashboard for deployment status
2. Visit your site: `https://your-site-name.netlify.app`
3. Verify all pages load correctly

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Authentication Issues

```bash
# Logout and re-login
netlify logout
netlify login
```

### GitHub Push Fails

```bash
# Check remote
git remote -v

# If incorrect, fix it
git remote set-url origin https://github.com/your-username/cryptovault.git
```

## Post-Deployment Checklist

- [ ] GitHub repo is public
- [ ] Netlify site is deployed
- [ ] Auto-deploy from `main` is working
- [ ] Site DNS is configured (optional custom domain)
- [ ] GitHub Actions workflows are active (check Actions tab)
- [ ] Smart contracts deployed to testnet (see `contracts/README.md`)
- [ ] Environment variables set in Netlify

## Development Workflow

### Local Development

```bash
# Terminal 1: Frontend
npm run dev --workspace=client

# Terminal 2: Backend (separate terminal)
npm run dev --workspace=server
```

Frontend: http://localhost:3000
Backend: http://localhost:5000

### Deploy from CLI

```bash
# Build locally
npm run build

# Deploy to production
netlify deploy --prod

# Deploy to staging (preview)
netlify deploy
```

## Continuous Integration

GitHub Actions automatically:
1. Runs linting on pull requests
2. Runs tests on pull requests
3. Builds and deploys to Netlify on push to `main`

Check `.github/workflows/`:
- `deploy.yml` - Deploy to production
- `test.yml` - Run tests and lint

## Setting Up GitHub Secrets

For CI/CD to work, add these GitHub secrets:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add:

| Name | Value |
|------|-------|
| `NETLIFY_AUTH_TOKEN` | Your Netlify personal access token |
| `NETLIFY_SITE_ID` | Your Netlify site ID |

**Get Netlify Token:**
```bash
netlify api getAccessToken
```

## Next Steps

1. **Customize domain** - Point custom domain to Netlify
2. **Enable HTTPS** - Netlify auto-renews SSL certificates
3. **Set up CDN** - Already included with Netlify
4. **Add analytics** - Integrate Mixpanel or Plausible
5. **Deploy smart contracts** - Deploy ERC-20 token to mainnet

See [GAME_DESIGN_DOCUMENT.md](../GAME_DESIGN_DOCUMENT.md) for full roadmap.

---

**Questions?** Create an issue on GitHub or contact support@cryptovault.game
