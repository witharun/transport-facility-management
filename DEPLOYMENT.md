# GitHub Pages Deployment Guide

This guide will help you deploy your Angular Transport Facility Management application to GitHub Pages.

## Quick Start

If your repository name is `transport-facility-management`, you can deploy immediately:

```bash
npm install
npm run deploy
```

Then enable GitHub Pages in your repository settings (see Step 4 below).

---

## Detailed Instructions

## Prerequisites

1. Your project must be pushed to a GitHub repository
2. You need to have Node.js and npm installed
3. You need to have Git installed and configured

## Step-by-Step Deployment Instructions

### Step 1: Install Dependencies

First, make sure all dependencies are installed:

```bash
npm install
```

This will install the `gh-pages` package along with all other dependencies.

### Step 2: Update Repository Name (if needed)

**Important:** The deployment script uses `/transport-facility-management/` as the base href. 

If your GitHub repository has a different name, you need to update the `build:gh-pages` script in `package.json`:

1. Open `package.json`
2. Find the `build:gh-pages` script
3. Replace `/transport-facility-management/` with `/[YOUR-REPO-NAME]/`

For example, if your repo is named `my-transport-app`, change it to:
```json
"build:gh-pages": "ng build --configuration production --base-href /my-transport-app/"
```

### Step 3: Build and Deploy

Run the deployment command:

```bash
npm run deploy
```

This command will:
1. Build your Angular app for production with the correct base href
2. Create a `404.html` file for GitHub Pages routing support
3. Deploy the built files to the `gh-pages` branch on GitHub

### Step 4: Enable GitHub Pages

1. Go to your GitHub repository on GitHub.com
2. Click on **Settings** (in the repository menu)
3. Scroll down to **Pages** (in the left sidebar)
4. Under **Source**, select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
5. Click **Save**

### Step 5: Access Your Deployed App

After a few minutes, your app will be available at:
```
https://[YOUR-USERNAME].github.io/[YOUR-REPO-NAME]/
```

For example:
```
https://yourusername.github.io/transport-facility-management/
```

## Updating Your Deployment

Whenever you make changes and want to update the live site:

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. Deploy again:
   ```bash
   npm run deploy
   ```

## Troubleshooting

### Issue: 404 Error or Blank Page

- **Solution**: Make sure the base href in `package.json` matches your repository name exactly (case-sensitive)
- Check that GitHub Pages is enabled and pointing to the `gh-pages` branch

### Issue: Assets Not Loading

- **Solution**: Ensure the base href includes the trailing slash: `/repo-name/` (not `/repo-name`)

### Issue: Routes Not Working

- **Solution**: If you're using Angular routing, you may need to configure a 404.html file that redirects to index.html. This is a common requirement for single-page applications on GitHub Pages.

### Issue: Build Fails

- **Solution**: Make sure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`

## Manual Deployment (Alternative)

If you prefer to deploy manually:

1. Build the project:
   ```bash
   npm run build:gh-pages
   ```

2. Copy the contents of `dist/transport-facility` to a new `gh-pages` branch:
   ```bash
   git checkout -b gh-pages
   git add dist/transport-facility/*
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

## Notes

- The `gh-pages` branch is automatically created and updated by the `gh-pages` package
- Your main source code remains on your main branch
- Only the built files are deployed to the `gh-pages` branch
- It may take a few minutes for changes to appear on GitHub Pages after deployment
