# Appwrite Deployment Guide

## Step 1: Deploy Static Website to Appwrite

1. In your Appwrite console, go to your project `promptfusion1`
2. Navigate to **Storage** → Create a new bucket (name it `website`)
3. Set bucket permissions to **Public Read**
4. Upload these files from the `website/` folder:
   - `index.html`
   - `style.css`

## Step 2: Configure Appwrite Static Hosting

1. Go to **Settings** → **Domains**
2. Add custom domains:
   - `promptsfusion.com`
   - `thepromptfusion.com`
   - `promptfusions.com`
   - `promptfusionpro.de`
   - `promptfusion.eu`

## Step 3: DNS Configuration

For each domain, add these DNS records in your domain registrar:

### Type A Record
```
Type: A
Host: @
Value: <Appwrite IP from console>
TTL: 3600
```

### Type A Record (www subdomain)
```
Type: A
Host: www
Value: <Appwrite IP from console>
TTL: 3600
```

OR use CNAME if Appwrite provides a hostname:

### Type CNAME
```
Type: CNAME
Host: @
Value: <Appwrite hostname from console>
TTL: 3600
```

## Alternative: Simple Static File Hosting

If Appwrite doesn't support static hosting directly, deploy the website files to:
- Netlify (drag & drop the `website/` folder)
- Vercel (connect to GitHub repo)
- GitHub Pages (enable in repo settings)

Then point your domains to the hosting service's IP/CNAME.

## Verification

After DNS propagation (can take up to 48 hours):
- Visit `promptsfusion.com`
- Verify website loads correctly
- Test all 5 domains point to the same site
