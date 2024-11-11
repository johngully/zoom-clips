/* eslint-env node */
/* eslint-disable no-console */

const { execSync } = require('child_process');
const { version } = require('./package.json');

const tag = `v${version}`;
const CHROME_DASHBOARD = 'https://chrome.google.com/webstore/devconsole';

try {
  // Create and push tag
  console.log(`
Creating tag ${tag}...`);
  execSync(`git tag ${tag}`);
  execSync(`git push origin ${tag}`);
  console.log('✓ Tag created and pushed');

  // Commit and push package.json changes
  execSync('git add package.json');
  execSync(`git commit -m "Bump version to ${version}"`);
  execSync('git push origin main');
  console.log('✓ Version bump committed and pushed');

  console.log(`
✨ Release complete!

Next steps:
1. Upload the build to Chrome Web Store:
   ${CHROME_DASHBOARD}
2. Submit for review
3. Monitor the extension status in the developer dashboard`);
} catch (error) {
  console.error(`
❌ Release failed: ${error.message}`);
  process.exit(1);
} 