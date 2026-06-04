# 🚀 Quick Reference: Vercel Deployment

## 5-Minute Setup Summary

### 1️⃣ Get Cloudinary Credentials
- Go to https://cloudinary.com → Sign up (free)
- Dashboard → Copy "API Environment variable"
- Extract: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 2️⃣ Set Backend Environment Variables (Vercel Project Settings)
```
MONGODB_URI=your-mongodb-connection-string
CLOUDINARY_CLOUD_NAME=your-value
CLOUDINARY_API_KEY=your-value
CLOUDINARY_API_SECRET=your-value
JWT_SECRET=your-random-secret
GOOGLE_CLIENT_ID=your-value
GOOGLE_CLIENT_SECRET=your-value
GOOGLE_CALLBACK_URL=https://your-backend.vercel.app/api/auth/google/callback
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3️⃣ Set Frontend Environment Variables (Vercel Project Settings)
```
VITE_API_URL=https://your-backend.vercel.app/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4️⃣ Deploy
```bash
git add .
git commit -m "Ready for deployment"
git push
# Vercel auto-deploys on push
```

## File Upload Flow

```
User uploads image
       ↓
Multer middleware
       ↓
Cloudinary (production) or Memory (dev)
       ↓
Database stores URL
       ↓
Frontend displays image from URL
```

## Important URLs After Deployment

- Backend API: `https://your-backend.vercel.app/api`
- Frontend: `https://your-frontend.vercel.app`
- Cloudinary Dashboard: https://console.cloudinary.com/media_library

## Verify It's Working

1. Check Backend: `https://your-backend.vercel.app/api/universities`
2. Check Frontend: Loads without errors
3. Try Login: Google OAuth works
4. Upload Picture: Appears in profile & in Cloudinary dashboard

## Documentation Files

- **Getting Started**: `CLOUDINARY_SETUP.md`
- **Full Deployment**: `DEPLOYMENT_CHECKLIST.md`
- **Commands**: `DEPLOYMENT_COMMANDS.md`
- **Checklist**: `FINAL_CHECKLIST.md`

## WhatsNew

✅ Persistent file uploads (Cloudinary)  
✅ Auto CDN delivery  
✅ Free 25GB storage  
✅ Production ready  

## Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| Files not uploading | Add Cloudinary env vars to Vercel |
| API errors | Check `VITE_API_URL` in frontend |
| Login fails | Update Google OAuth redirect URIs |
| Database errors | Verify MongoDB connection string |

---

**Need more details? Check the full documentation files above!** 📖
