# Quick Deployment Command Guide

## Local Setup & Testing

### Backend
```bash
# Install dependencies (includes Cloudinary)
cd backend
npm install

# Create .env file with Cloudinary credentials
cp .env.example .env
# Edit .env and add Cloudinary credentials

# Run development server
npm run dev

# Build for production
npm run build
```

### Frontend
```bash
# Install dependencies
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env and set VITE_API_URL

# Run development server
npm run dev

# Build for production
npm run build
```

## Vercel Deployment Setup

### Step 1: Push to GitHub
```bash
# From root directory
git add .
git commit -m "Add Cloudinary integration for file uploads"
git push origin main
```

### Step 2: Deploy Backend

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Configure:
   - **Framework**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Start Command**: `node dist/index.js`

5. Click "Environment Variables" and add:
   ```
   PORT=5002
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edujobs_scholars
   JWT_SECRET=your-strong-secret-key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend.vercel.app
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-backend.vercel.app/api/auth/google/callback
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

6. Click "Deploy"

7. Get your backend URL (e.g., `https://edujobs-scholars-backend.vercel.app`)

### Step 3: Deploy Frontend

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select the same GitHub repository
4. Configure:
   - **Framework**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Click "Environment Variables" and add:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_API_URL=https://your-backend.vercel.app/api
   ```

6. Click "Deploy"

## Environment Variables Checklist

### Backend Variables
- [ ] `MONGODB_URI` - From MongoDB Atlas
- [ ] `JWT_SECRET` - Generate secure random string
- [ ] `FRONTEND_URL` - Your frontend Vercel URL
- [ ] `EMAIL_USER` - Gmail address
- [ ] `EMAIL_PASS` - Gmail app password (not regular password)
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- [ ] `GOOGLE_CALLBACK_URL` - Backend URL + `/api/auth/google/callback`
- [ ] `CLOUDINARY_CLOUD_NAME` - From Cloudinary Dashboard
- [ ] `CLOUDINARY_API_KEY` - From Cloudinary Dashboard
- [ ] `CLOUDINARY_API_SECRET` - From Cloudinary Dashboard

### Frontend Variables
- [ ] `VITE_GOOGLE_CLIENT_ID` - Same as backend
- [ ] `VITE_API_URL` - Your backend Vercel URL + `/api`

## Testing After Deployment

### Backend Tests
```bash
# Test API is responding
curl https://your-backend.vercel.app/api/universities

# Test authentication endpoint
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test file upload (requires valid JWT token)
curl -X POST https://your-backend.vercel.app/api/heroImages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@path/to/image.jpg"
```

### Frontend Tests
- [ ] App loads without errors (check browser console)
- [ ] Login page displays correctly
- [ ] Google OAuth button works
- [ ] Can upload profile picture
- [ ] Images appear in UI
- [ ] Navigation works

## Production Domains (Optional)

To use custom domains instead of vercel.app:

### For Backend
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### For Frontend
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

Then update:
- Backend: `FRONTEND_URL` environment variable
- Frontend: `VITE_API_URL` environment variable

## Monitoring & Debugging

### View Deployment Logs
- Go to project on Vercel
- Click "Deployments"
- Click recent deployment
- Scroll to "Build Logs" and "Runtime Logs"

### View Real-Time Logs
- Use Vercel CLI:
  ```bash
  npm install -g vercel
  vercel logs https://your-backend.vercel.app
  ```

### View Database Activity
- Go to MongoDB Atlas: https://cloud.mongodb.com
- Click your cluster
- Go to "Metrics" tab
- View real-time database operations

### View Cloudinary Activity
- Go to https://console.cloudinary.com
- Click "Media Library" to see all uploaded files
- Click "Account" → "Reports" for upload statistics

## Rollback If Issues

### Rollback Backend
1. Go to Vercel project
2. Click "Deployments"
3. Find stable deployment
4. Click "..." → "Promote to Production"

### Rollback Frontend
1. Same process as backend

## Performance Tips

### Backend Optimization
- [ ] Enable CORS caching in helmet middleware
- [ ] Use MongoDB indexes for frequently queried fields
- [ ] Set appropriate JWT expiration (7d is reasonable)

### Frontend Optimization
- [ ] Enable Vite minification (enabled by default)
- [ ] Optimize images using Cloudinary transformations
- [ ] Lazy load routes with React Router

### Cloudinary Optimization
- [ ] Auto-format images (WebP for modern browsers)
- [ ] Set quality to 'auto'
- [ ] Use responsive images

## Support Resources

| Issue | Resource |
|-------|----------|
| Vercel Deployment | https://vercel.com/docs/concepts/deployments/overview |
| MongoDB Atlas | https://docs.atlas.mongodb.com/ |
| Cloudinary Setup | See `CLOUDINARY_SETUP.md` |
| Google OAuth | https://developers.google.com/identity/protocols/oauth2 |
| Gmail App Passwords | https://support.google.com/accounts/answer/185833 |

## Troubleshooting Common Issues

### "Cannot find module" errors
- Solution: Run `npm install` in the appropriate folder

### Cloudinary files not uploading
- Solution: Check `CLOUDINARY_*` environment variables in Vercel
- Check backend logs for detailed errors

### CORS errors
- Solution: Verify `FRONTEND_URL` in backend matches actual frontend URL

### 401 JWT errors
- Solution: Check `JWT_SECRET` matches between local and Vercel

### MongoDB connection errors
- Solution: Check `MONGODB_URI` connection string
- Verify IP whitelist in MongoDB Atlas (0.0.0.0/0 for test, or Vercel IPs in production)

---

**Ready to deploy? Follow the steps above in order!** 🚀
