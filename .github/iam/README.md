# IAM policy for frontend static deploy

Use [frontend-deploy-policy.json](frontend-deploy-policy.json) for the IAM user/role used by GitHub Actions.

## Replace placeholders
- REPLACE_WITH_BUCKET_NAME
- REPLACE_WITH_ACCOUNT_ID
- REPLACE_WITH_DISTRIBUTION_ID

## Required GitHub secrets
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- S3_BUCKET_NAME
- CLOUDFRONT_DISTRIBUTION_ID

## Optional GitHub repository variables
- VITE_API_BASE_URL
- VITE_GOOGLE_CLIENT_ID

The workflow also supports monorepo frontend folder names: `fe` or `merxly_frontend`.
