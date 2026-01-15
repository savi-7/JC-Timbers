# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the JC-Timbers project.

## Available Workflows

### 🚀 Deploy Server to AWS Lightsail

**File:** `deploy-server.yml`

**Purpose:** Automatically deploys the Node.js server to AWS Lightsail instance via SSH.

**Triggers:**
- Automatically on push to `main` branch when files in `server/` directory change
- Manually via GitHub Actions UI (workflow_dispatch)

**What it does:**
1. Connects to your Lightsail instance via SSH
2. Pulls the latest code from GitHub
3. Installs/updates npm dependencies
4. Restarts the server using PM2 process manager
5. Reports deployment status

**Required Secrets:**
- `LIGHTSAIL_HOST` - IP address or domain of your Lightsail instance
- `LIGHTSAIL_USERNAME` - SSH username (usually `ubuntu`)
- `LIGHTSAIL_SSH_KEY` - Private SSH key for authentication
- `LIGHTSAIL_PORT` - SSH port (optional, defaults to 22)
- `DEPLOY_PATH` - Path to project on server (optional, defaults to `~/JC-Timbers1`)

**Dependencies:**
- Uses `appleboy/ssh-action@v1.0.3` for SSH operations
- Requires PM2 to be installed on the Lightsail instance
- Requires Git to be configured on the Lightsail instance

## Setup Instructions

See the detailed setup instructions in:
- [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) - Full setup guide
- [DEPLOYMENT_QUICK_START.md](../../DEPLOYMENT_QUICK_START.md) - Quick reference

## Monitoring Deployments

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. View deployment history and logs

## Troubleshooting

If a deployment fails:
1. Check the workflow logs in GitHub Actions
2. SSH into your Lightsail instance and check:
   - Git can pull code: `cd ~/JC-Timbers1 && git pull`
   - PM2 status: `pm2 list`
   - Server logs: `pm2 logs jc-timbers-server`
3. Verify all GitHub secrets are correctly configured

## Adding More Workflows

You can add more workflows to this directory for:
- Running tests before deployment
- Building and deploying the client application
- Database backups
- Scheduled tasks
- etc.

Simply create new `.yml` files following the GitHub Actions syntax.

