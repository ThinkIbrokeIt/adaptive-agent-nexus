# Production Deployment Guide - Adaptive Agent Nexus

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended - Easiest)

#### Prerequisites
- Vercel account (free tier available)
- GitHub repository

#### Steps
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel:**
   ```bash
   npm run deploy:vercel
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project in Vercel dashboard
   - Navigate to Settings → Environment Variables
   - Add all variables from `.env.production`

4. **Configure Custom Domain (Optional):**
   - In Vercel dashboard: Settings → Domains
   - Add your custom domain

### Option 2: Netlify

#### Prerequisites
- Netlify account (free tier available)
- GitHub repository

#### Steps
1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy to Netlify:**
   ```bash
   npm run deploy:netlify
   ```

3. **Set Environment Variables in Netlify Dashboard:**
   - Go to your site in Netlify dashboard
   - Navigate to Site Settings → Environment Variables
   - Add all variables from `.env.production`

### Option 3: Manual Static Hosting

#### For any static hosting service (AWS S3, Firebase, etc.)

1. **Build for production:**
   ```bash
   npm run build:prod
   ```

2. **Deploy the `dist/` folder to your hosting service**

3. **Configure environment variables** in your hosting platform

## 🔧 Environment Configuration

### Required Environment Variables

Copy `.env.production` and configure these values:

```bash
# Supabase (Database & Auth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# LLM APIs (choose at least one)
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Storage (optional - will use localStorage if not configured)
VITE_CHROMADB_URL=https://your-chromadb-instance.com
VITE_MINIO_ENDPOINT=your-minio-endpoint.com
```

### Getting API Keys

- **Supabase**: https://supabase.com → New Project
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/

## 📊 Bundle Optimization

The build is now optimized with code splitting:

- **React Vendor**: Core React libraries (~150KB)
- **UI Vendor**: Radix UI components (~200KB)
- **Utils Vendor**: Utility libraries (~50KB)
- **AI Vendor**: LLM and database libraries (~100KB)
- **Main App**: Application code (~150KB)

**Total**: ~650KB (down from previous single bundle)

## 🔍 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] API keys obtained and tested
- [ ] Build completes without errors: `npm run build:prod`
- [ ] Test deployment: `npm run preview`
- [ ] Bundle size analyzed: `npm run analyze-bundle`

## 🌐 Production URLs

After deployment, your app will be available at:
- **Vercel**: `https://your-project.vercel.app`
- **Netlify**: `https://your-project.netlify.app`
- **Custom Domain**: `https://your-domain.com`

## 🔒 Security Features

- Content Security Policy headers
- X-Frame-Options protection
- No-sniff headers
- Secure referrer policy

## 📈 Monitoring & Analytics

Add these optional services for production monitoring:

```bash
# Error tracking
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Analytics
VITE_GA_TRACKING_ID=GA-XXXXXXXXXX
```

## 🚨 Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite && npm run build:prod
```

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Restart deployment after adding variables
- Check variable names match exactly

### API Connection Issues
- Verify API keys are correct
- Check CORS settings on external services
- Test API endpoints manually first

## 🎯 Performance Optimization

### Current Optimizations
- ✅ Code splitting by vendor libraries
- ✅ Tree shaking enabled
- ✅ Minification with Terser
- ✅ Source maps disabled for production

### Additional Optimizations (Future)
- Service worker for caching
- Image optimization
- CDN for static assets
- Lazy loading for routes

## 📞 Support

For deployment issues:
1. Check the build logs in your deployment platform
2. Verify environment variables are set correctly
3. Test API connections independently
4. Review the troubleshooting section above

---

**Ready to deploy?** Run `npm run build:prod` and deploy the `dist/` folder! 🚀