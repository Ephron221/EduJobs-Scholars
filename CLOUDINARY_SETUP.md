# Cloudinary Setup Guide for EduJobs Scholars

## What is Cloudinary?

Cloudinary is a cloud-based media management platform that allows you to store, manage, and deliver images and videos. Since Vercel's filesystem is ephemeral (resets on each deployment), using Cloudinary is the best solution for persisting file uploads.

## Free Tier Benefits

- **Storage**: 25 GB free storage
- **Bandwidth**: 25 GB/month free bandwidth
- **API Calls**: Unlimited
- **Perfect for**: Development and small-to-medium projects

## Step 1: Create a Cloudinary Account

1. Visit [https://cloudinary.com](https://cloudinary.com)
2. Click "Sign up for free"
3. Complete the registration (email, password, optional company info)
4. Verify your email

## Step 2: Get Your Credentials

After signing in:

1. Go to your **Dashboard** (https://console.cloudinary.com)
2. Look for "API Environment variable" section at the top
3. You'll see a code snippet like:
   ```
   CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD_NAME
   ```
4. Extract these values:
   - **Cloud Name**: `your-cloud-name` (in the URL)
   - **API Key**: `your-api-key` (in the URL)
   - **API Secret**: `your-api-secret` (in the URL)

## Step 3: Configure Backend Environment Variables

### For Local Development:

Update your `.env` file in the `backend/` directory:

```env
# Existing variables...
PORT=5002
NODE_ENV=development

# Add Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### For Production (Vercel):

1. Go to your **Backend Project** on Vercel
2. Go to **Settings → Environment Variables**
3. Add these variables:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret

## Step 4: How It Works in Your App

### Local Development
- When `NODE_ENV=development` and no Cloudinary credentials: Uses local memory storage
- When Cloudinary credentials are present: Uses Cloudinary automatically

### Production (Vercel)
- Automatically uses Cloudinary (since it's configured)
- All uploaded files go to your Cloudinary account
- Images and PDFs are organized in folders:
  - `/edujobs-scholars/images` - Profile pics, hero images, etc.
  - `/edujobs-scholars/documents` - PDFs, resumes, etc.

## Step 5: Cloudinary Dashboard Features

Once files are uploaded, you can:

1. **View all uploads**: https://console.cloudinary.com/media_library
2. **Manage folders**: Organize by type or date
3. **Get public URLs**: Right-click any file to copy the URL
4. **Transform images**: Cloudinary offers on-the-fly transformations
   - Example: Add watermark, resize, optimize quality
   - Documentation: https://cloudinary.com/documentation/image_transformations_reference

## Step 6: (Optional) Advanced - Image Optimization

You can generate optimized URLs automatically:

```typescript
// Example of Cloudinary URL with optimizations
const optimizedUrl = `${cloudinaryUrl}?w=200&h=200&c=fill&q=auto&f=auto`;
```

This will:
- Resize to 200x200
- Fill to cover the space
- Automatically optimize quality
- Serve in best format (WebP for modern browsers)

## Troubleshooting

### Files not uploading?
1. Check Cloudinary credentials are correct
2. Ensure `NODE_ENV` matches your deployment
3. Check backend logs for errors

### Getting 401 errors?
- Verify API Key and API Secret are correct
- Make sure you've copied the full values (no spaces)

### Storage limit reached?
- Upgrade to Cloudinary Pro ($84/year) for 500GB
- Or delete old/test uploads from dashboard

## Security Notes

1. **Never commit credentials** to git
2. **Always use environment variables** for secrets
3. **Use API Secret only server-side** (backend)
4. **API Key can be used client-side** (frontend - optional)
5. **Set upload restrictions** in Cloudinary dashboard if needed:
   - Settings → Upload → Allowed file types
   - Settings → Upload → File size limits

## File Size Limits

By default:
- Images: 5 MB (can be increased)
- Documents (PDFs): 20 MB (can be increased)

To change in backend, update `src/middleware/upload.ts`:
```typescript
limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
```

## API Reference

See uploaded files in:
1. **Cloudinary Dashboard**: https://console.cloudinary.com/media_library
2. **API Method**: GET `https://api.cloudinary.com/v1_1/{cloud_name}/resources/image`
   - Requires API Key and Secret

## More Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Image Upload Tutorial](https://cloudinary.com/documentation/upload_images)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Multer Storage Plugin](https://github.com/jonathanmv/multer-storage-cloudinary)

## Support

If you encounter issues:
1. Check Cloudinary status: https://status.cloudinary.com
2. Contact Cloudinary Support: https://support.cloudinary.com
3. Check backend logs: `npm run dev` and check console output
