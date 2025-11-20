# S3 CORS Configuration

To enable direct file uploads from the frontend to S3, you need to configure CORS on your S3 bucket.

## CORS Configuration

Add the following CORS configuration to your S3 bucket:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://your-production-domain.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

## How to Configure

1. Go to AWS S3 Console
2. Select your bucket
3. Go to "Permissions" tab
4. Scroll to "Cross-origin resource sharing (CORS)"
5. Click "Edit" and paste the JSON configuration above
6. Update `AllowedOrigins` with your actual frontend domains
7. Save changes

## Alternative: Server-Side Upload

If CORS cannot be configured, you can use the server-side upload endpoint:
- `POST /api/v1/docs/upload` (requires authentication)

This endpoint accepts `multipart/form-data` and uploads the file server-side.

