# Deploy to Netlify via GitHub Integration

Due to the monorepo structure, we recommend using Netlify's GitHub integration for automatic deployments.

## Step 1: Go to Netlify Dashboard

Visit [app.netlify.com](https://app.netlify.com)

## Step 2: Create New Site from Git

1. Click **"Add new site"** → **"Import an existing project"**
2. Select **GitHub** as the git provider
3. Search for **cryptovault** repository
4. Click on it

## Step 3: Configure Build Settings

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Branch to deploy** | `master` (or `main`) |
| **Build command** | `npm run build` |
| **Publish directory** | `client/dist` |

## Step 4: Environment Variables (Optional)

Add these environment variables in **Site settings** → **Build & deploy** → **Environment**:

```
VITE_CHAIN_ID=137
NODE_ENV=production
```

## Step 5: Deploy

Click **"Deploy site"**

Netlify will:
1. Clone your repository
2. Run `npm run build`
3. Deploy the `client/dist` folder
4. Give you a URL like: `https://cryptovault-xxx.netlify.app`

## Step 6: Auto-Deploy on Git Push

After initial setup, any push to `master` branch will automatically deploy!

---

## Manual CLI Deployment (if GitHub integration fails)

If you need to deploy via CLI, use:

```bash
# Build locally
npm run build

# Deploy with site ID
netlify deploy --prod --dir=client/dist --site=YOUR_SITE_ID

# Or create a new site (one-time)
netlify deploy --prod --dir=client/dist
```

To get your site ID:
1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **General**
4. Copy the **Site ID**

---

## Verify Deployment

- ✅ Check [app.netlify.com](https://app.netlify.com) for live URL
- ✅ Visit your site URL
- ✅ Check [Deployments tab](https://app.netlify.com/user/settings/applications) for history

Your game is live! 🎮
