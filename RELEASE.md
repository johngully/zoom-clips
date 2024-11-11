# Release Process

This document outlines the steps needed to build and release the Zoom Clips Chrome extension.

## Prerequisites

- Node.js (v16 or higher)
- pnpm package manager
- Chrome browser
- Access to Chrome Web Store Developer Dashboard

## Development Setup

1. Install dependencies:
```bash
pnpm install
```

## Build Commands

Build the extension with one of the following commands:

```bash
pnpm build        # Creates production build
pnpm build:patch  # Bumps patch version (1.0.0 -> 1.0.1) and builds
pnpm build:minor  # Bumps minor version (1.0.0 -> 1.1.0) and builds
pnpm build:major  # Bumps major version (1.0.0 -> 2.0.0) and builds
```

Add `--force` to any build command to overwrite existing builds:
```bash
pnpm build --force
pnpm build:patch --force
```

Builds are created in the `build` directory with the naming format: `zoom-clips-v{version}.zip`

## Release Steps

1. **Update Version**
   - Choose appropriate version bump command (patch, minor, or major)
   - This will automatically update package.json and create a new build

2. **Test the Build**
   - Unzip the generated file from `build/zoom-clips-v{version}.zip`
   - Load the extension in Chrome:
     1. Navigate to `chrome://extensions/`
     2. Enable "Developer mode"
     3. Click "Load unpacked"
     4. Select the unzipped build directory
   - Verify all functionality works as expected

3. **Submit to Chrome Web Store**
   - Log into [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload the new zip file
   - Update release notes if needed
   - Submit for review

4. **Create Release Tag**
   ```bash
   git tag v{version}
   git push origin v{version}
   ```

5. **Update Main Branch**
   ```bash
   git add package.json
   git commit -m "Bump version to {version}"
   git push origin main
   ```

## Troubleshooting

- If a build already exists, either:
  - Use `--force` flag to overwrite
  - Delete the existing zip file
  - Increment the version number

- If the build fails, check:
  - All dependencies are installed
  - Node.js version is current
  - Write permissions exist for build directory

## Pre-Release Checklist

1. **Code Quality**
   - Run linter: `pnpm lint`
   - All console.log statements removed (except in build scripts)
   - Manifest.json version matches package.json
   - All permissions are correctly specified in manifest.json

2. **Required Assets**
   - Icon files present and correct:
     - 16x16 icon
     - 48x48 icon
     - 128x128 icon
   - Screenshots updated (if UI changes):
     - At least one screenshot (1280x800 or 640x400)
     - Screenshots reflect current functionality
   - Store listing assets:
     - Description is up to date
     - Features list is current
     - Privacy policy URL is valid (if required)

3. **Testing**
   - Extension loads without errors
   - Works in incognito mode (if applicable)

4. **Store Requirements**
   - Privacy policy updated (if needed)
   - Description under 132 characters