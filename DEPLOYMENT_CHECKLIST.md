# Vercel Deployment Checklist for EduJobs Scholars

## ✅ Pre-Deployment Steps

### 1. Environment Variables Setup

#### Backend Environment Variables (in Vercel Dashboard):
- `MONGODB_URI` - Your MongoDB production URL (e.g., MongoDB Atlas)
- `JWT_SECRET` - Strong random secret (generate a new one for production)
- `JWT_EXPIRES_IN` - Set to "7d"
- `NODE_ENV` - Set to "production"
- `FRONTEND_URL` - Your deployed frontend URL (e.g., https://your-frontend.vercel.app)
- `EMAIL_HOST` - smtp.gmail.com or your email service
- `EMAIL_PORT` - 587
- `EMAIL_USER` - Your email address
- `EMAIL_PASS` - App password (NOT your regular password)
- `GOOGLE_CLIENT_ID` - Production Google OAuth ID
- `GOOGLE_CLIENT_SECRET` - Production Google OAuth secret
- `GOOGLE_CALLBACK_URL` - https://your-backend.vercel.app/api/auth/google/callback

#### Frontend Environment Variables (in Vercel Dashboard):
- `VITE_GOOGLE_CLIENT_ID` - Same as backend Google Client ID
- `VITE_API_URL` - https://your-backend.vercel.app/api

### 2. Code Changes Needed

#### Backend Updates:
1. Update `GOOGLE_CALLBACK_URL` to match production backend URL
2. Ensure MongoDB connection string handles Vercel deployment

#### Frontend Updates:
1. Update API URL in axios configuration to use environment variable
2. Ensure Google OAuth redirect URIs are updated in Google Cloud Console

### 3. Database Setup
- Create a MongoDB Atlas cluster (free tier available)
- Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/edujobs_scholars`
- Add Vercel IP to MongoDB Atlas IP whitelist (0.0.0.0/0 for development)

### 4. Storage Solution for Uploads
⚠️ **CRITICAL**: Vercel filesystem is ephemeral (resets on each deployment)

**Options:**
1. **Cloudinary** (Recommended for images)
   - Free tier includes 25GB storage
   - Update multer middleware to upload to Cloudinary
   
2. **AWS S3**
   - Reliable and scalable
   - Costs start at $0.023/GB
   
3. **Firebase Storage**
   - Simple integration
   - Good for free tier

**Action**: Update `src/middleware/upload.ts` and `src/utils/uploadPath.ts` to use cloud storage

### 5. Deployment Steps

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Vercel configuration for deployment"
git push origin main
```

#### Step 2: Deploy Backend
1. Go to vercel.com
2. Click "New Project"
3. Import GitHub repository
4. Select "Other" as framework
5. Root Directory: `backend`
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Add all environment variables
9. Deploy

#### Step 3: Deploy Frontend
1. Create new project in Vercel
2. Import same GitHub repository
3. Select "Other" (don't select React - Vite is better configured manually)
4. Root Directory: `frontend`
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add environment variables:
   - `VITE_API_URL=https://your-backend-url.vercel.app/api`
   - `VITE_GOOGLE_CLIENT_ID=your-client-id`
8. Deploy

### 6. Post-Deployment Verification
- [ ] Backend API responds (test with `/api/universities`)
- [ ] Frontend loads without errors
- [ ] Login/Google OAuth works
- [ ] Database queries work
- [ ] Email notifications send
- [ ] File uploads work (if using cloud storage)

### 7. Update Google OAuth Settings
In Google Cloud Console:
- Add production URLs to Authorized Redirect URIs:
  - `https://your-backend.vercel.app/api/auth/google/callback`
  - `https://your-frontend.vercel.app/login`

### 8. MongoDB Atlas Configuration
- Add Vercel's IP range to IP whitelist
- Ensure database name is `edujobs_scholars`
- Check connection permissions (read/write enabled)

## 🚨 Known Limitations & Solutions

| Issue | Solution |
|-------|----------|
| File uploads don't persist | Migrate to cloud storage (Cloudinary/S3) |
| Cold starts slow | Use Vercel Pro or keep-alive strategies |
| Environment variables exposed | Never commit .env to git |
| CORS issues | Ensure FRONTEND_URL matches deployed URL |

## 📝 Current Issues to Fix

1. **Backend**: No cloud storage integration for uploads
2. **Frontend**: API URL hardcoded in some places (check axios config)
3. **Backend**: Google callback URL uses localhost
4. **Both**: Missing production environment variables

## ✨ Next Steps

1. ✅ Push changes with vercel.json files
2. ⏳ Set up MongoDB Atlas database
3. ⏳ Choose and integrate cloud storage solution
4. ⏳ Update Google OAuth credentials for production
5. ⏳ Configure environment variables in Vercel dashboard
6. ⏳ Deploy backend first, then frontend
7. ⏳ Test all critical flows in production
