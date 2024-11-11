/* eslint-env node */
/* eslint-disable no-console */

const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const semver = require('semver');

// Read package.json
const packagePath = './package.json';
const packageJson = require(packagePath);
const { name, version } = packageJson;

// Handle version bumping
const bumpType = process.argv.find(arg => ['patch', 'minor', 'major'].includes(arg));
if (bumpType) {
  const newVersion = semver.inc(version, bumpType);
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Version bumped from ${version} to ${newVersion}`);
}

const force = process.argv.some(arg => arg.includes('force'));
const extensionPath = `./build/${name}-v${packageJson.version}.zip`;

// Check if file already exists
if (fs.existsSync(extensionPath) && !force) {
  console.error(`
Error: ${extensionPath} already exists!
Options:
  1. Increment the version: build:patch, build:minor, or build:major
  2. Delete the existing file: rm -rf ${extensionPath}
  3. Force the build to overwrite the existing file: pnpm build:force
`);
  process.exit(1);
}

// Create build directory if it doesn't exist
const buildDir = path.dirname(extensionPath);
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

const output = fs.createWriteStream(extensionPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

output.on('close', () => {
  console.log(`
Extension has been zipped successfully to: ${extensionPath}
Total bytes: ${archive.pointer()}
`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add files and directories to include
archive.glob('**/*', {
  ignore: [
    'node_modules/**',
    'build/**',
    '.git/**',
    '.gitignore',
    'build.js',
    'package.json',
    'package-lock.json'
  ]
});

archive.finalize();