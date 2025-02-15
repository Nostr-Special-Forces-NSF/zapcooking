import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';

// Configuration
const REMOTE_USER = 'root';
const REMOTE_HOST = 'relay.nostrsf.org';
const REMOTE_PATH = '/var/www/cooking.nostrsf.org/build';
const REMOTE_SCRIPT = `pm2 restart ${REMOTE_PATH}/index.js`;
const LOCAL_DIST = 'build';
const TEMP_OLD_DIST = 'old_build';

try {
  console.log('🚀 Starting Deploy Script...');

  // Step 1: Backup old build files (if they exist)
  if (existsSync(LOCAL_DIST)) {
    console.log('📂 Backing up existing dist/ files...');
    if (!existsSync(TEMP_OLD_DIST)) mkdirSync(TEMP_OLD_DIST);
    execSync(`rsync -a ${LOCAL_DIST}/ ${TEMP_OLD_DIST}/`);
  }

  // Step 2: Run the Vite build process
  console.log('🔨 Running Vite build...');
  execSync('pnpm run build', { stdio: 'inherit' });

  // Step 3: Restore timestamps for unchanged files
  console.log('🔄 Restoring timestamps for unchanged files...');
  execSync(`rsync -a --ignore-existing ${TEMP_OLD_DIST}/ ${LOCAL_DIST}/`);

  // Step 4: Deploy to remote server using rsync
  console.log(`📡 Deploying to ${REMOTE_USER}@${REMOTE_HOST}...`);
  execSync(
    `rsync -avz --delete -e "ssh" ${LOCAL_DIST}/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}`
  );

  // Step 5: Execute post-deploy script on remote server
  console.log('🖥️ Running remote post-deployment script...');
  execSync(`ssh ${REMOTE_USER}@${REMOTE_HOST} '${REMOTE_SCRIPT}'`);

  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} finally {
  // Final step: Cleanup local temp files
  console.log('🧹 Cleaning up temporary files...');
  rmSync(TEMP_OLD_DIST, { recursive: true, force: true });
}
