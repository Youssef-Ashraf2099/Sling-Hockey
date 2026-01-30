#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏒 Building Sling Hockey Pro for itch.io distribution...\n');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  execSync('rmdir /s /q release', { stdio: 'inherit' });
} catch (e) {
  // Directory might not exist, that's fine
}

try {
  execSync('rmdir /s /q dist', { stdio: 'inherit' });
} catch (e) {
  // Directory might not exist, that's fine
}

// Install dependencies
console.log('📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Build web version
console.log('🔨 Building web application...');
execSync('npm run build', { stdio: 'inherit' });

// Build Electron apps for all platforms
console.log('⚡ Building Electron applications...');

// Windows
console.log('🪟 Building for Windows...');
execSync('npm run dist-win', { stdio: 'inherit' });

// macOS (if on macOS)
if (process.platform === 'darwin') {
  console.log('🍎 Building for macOS...');
  execSync('npm run dist-mac', { stdio: 'inherit' });
}

// Linux
console.log('🐧 Building for Linux...');
execSync('npm run dist-linux', { stdio: 'inherit' });

// Create itch.io distribution folder
console.log('📁 Creating itch.io distribution...');
const itchDir = path.join(__dirname, '../itch-distribution');
if (!fs.existsSync(itchDir)) {
  fs.mkdirSync(itchDir, { recursive: true });
}

// Copy builds to itch distribution
const releaseDir = path.join(__dirname, '../release');
const builds = fs.readdirSync(releaseDir);

builds.forEach(build => {
  const buildPath = path.join(releaseDir, build);
  const targetPath = path.join(itchDir, build);
  
  console.log(`📋 Copying ${build}...`);
  
  if (fs.statSync(buildPath).isDirectory()) {
    // Copy directory
    execSync(`xcopy "${buildPath}" "${targetPath}" /E /I /H /Y`, { stdio: 'inherit' });
  } else {
    // Copy file
    fs.copyFileSync(buildPath, targetPath);
  }
});

// Copy additional files for itch.io
console.log('📄 Adding itch.io files...');
fs.copyFileSync(
  path.join(__dirname, '../ITCH_README.md'),
  path.join(itchDir, 'README.md')
);

fs.copyFileSync(
  path.join(__dirname, '../CHANGELOG.md'),
  path.join(itchDir, 'CHANGELOG.md')
);

// Create version info
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const versionInfo = {
  version: packageJson.version,
  buildDate: new Date().toISOString(),
  platforms: ['Windows', 'macOS', 'Linux'],
  features: [
    'ELO Ranking System',
    'Secure Data Encryption',
    'Cross-Platform Support',
    '12 Unique Puck Skins',
    '16 Board Themes',
    'Offline Play',
    'Native Desktop Performance'
  ]
};

fs.writeFileSync(
  path.join(itchDir, 'version-info.json'),
  JSON.stringify(versionInfo, null, 2)
);

// Create installation instructions
const installInstructions = `# Installation Instructions

## Windows
1. Download "Sling Hockey Pro Setup.exe"
2. Run the installer
3. Follow the setup wizard
4. Launch from Start Menu or Desktop shortcut

## macOS
1. Download "Sling Hockey Pro.dmg"
2. Open the DMG file
3. Drag the app to Applications folder
4. Launch from Applications or Launchpad

## Linux
1. Download "Sling Hockey Pro.AppImage"
2. Make it executable: chmod +x "Sling Hockey Pro.AppImage"
3. Run the AppImage file
4. Optionally integrate with system using AppImageLauncher

## System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 200MB available space
- **OS**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)

## First Launch
1. Complete the tutorial to learn the controls
2. Start with Easy difficulty to practice
3. Customize your puck and board in the Shop
4. Begin your ranking journey!

## Support
If you encounter any issues, please report them in the itch.io comments section.
`;

fs.writeFileSync(
  path.join(itchDir, 'INSTALL.md'),
  installInstructions
);

console.log('\n✅ Build complete!');
console.log(`📦 Distribution files created in: ${itchDir}`);
console.log('\n🚀 Ready for itch.io upload!');
console.log('\nNext steps:');
console.log('1. Zip the contents of itch-distribution folder');
console.log('2. Upload to itch.io');
console.log('3. Set up your game page with screenshots and description');
console.log('4. Configure pricing and availability');
console.log('5. Publish your game!');

// Display file sizes
console.log('\n📊 Build sizes:');
builds.forEach(build => {
  const buildPath = path.join(releaseDir, build);
  try {
    const stats = fs.statSync(buildPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   ${build}: ${sizeMB} MB`);
  } catch (e) {
    console.log(`   ${build}: Directory`);
  }
});

console.log('\n🎉 Sling Hockey Pro is ready for the world!');