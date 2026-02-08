# Adaptive Agent Nexus - Multi-Platform Packaging Guide

## Overview
Your Adaptive Agent Nexus application can now be packaged as desktop applications for Windows, macOS, and Linux using Electron.

## Current Setup
- ✅ Electron configured
- ✅ Build system ready
- ✅ Multi-platform build scripts added

## Available Commands

### Development
```bash
# Run web app in development
npm run dev

# Run Electron app in development (connects to dev server)
npm run electron:dev

# Run Electron app with production build
npm run electron
```

### Building for Distribution
```bash
# Build web app only
npm run build

# Build for all platforms
npm run dist

# Build for specific platforms
npm run build:electron:win     # Windows
npm run build:electron:mac     # macOS
npm run build:electron:linux   # Linux
```

## Platform-Specific Builds

### Windows
- **Output**: `dist-electron/Adaptive Agent Nexus Setup X.X.X.exe` (installer)
- **Requirements**: Windows 10 or later
- **Additional files**: `Adaptive Agent Nexus X.X.X.exe` (portable)

### macOS
- **Output**: `dist-electron/Adaptive Agent Nexus-X.X.X.dmg` (disk image)
- **Requirements**: macOS 10.13 or later
- **Code Signing**: Required for App Store distribution

### Linux
- **Output**:
  - `Adaptive Agent Nexus_X.X.X_amd64.AppImage` (universal Linux app)
  - `adaptive-agent-nexus_X.X.X_amd64.deb` (Debian/Ubuntu package)
- **Requirements**: Most modern Linux distributions

## Build Output Location
All packaged applications will be created in the `dist-electron/` directory.

## Prerequisites for Building

### Windows
```bash
# No additional setup needed for basic builds
```

### macOS
```bash
# Install additional tools if needed
brew install create-dmg
```

### Linux
```bash
# Install fuse for AppImage (Ubuntu/Debian)
sudo apt-get install fuse libfuse2

# Or for RPM-based systems
sudo dnf install fuse fuse-libs
```

## Advanced Configuration

### Custom Icons
1. Add your app icon as `public/favicon.ico` (Windows/Linux)
2. Add `build/icon.icns` for macOS
3. Update `electron.js` to reference the correct icon path

### Code Signing (Recommended for Distribution)
- **Windows**: Use `electron-builder` with certificate
- **macOS**: Use Apple Developer certificate
- **Linux**: Not typically required

### Build Configuration
Edit the `build` section in `package.json` to customize:
- App metadata
- File inclusions/exclusions
- Platform-specific settings
- Installer options

## Distribution Options

### Desktop Apps (Current)
- ✅ **Electron**: Full desktop applications
- Native performance
- Offline capability
- System tray support
- File system access

### Mobile Apps (Future Enhancement)
Consider these options for mobile packaging:

#### React Native
```bash
npx react-native init AdaptiveAgentNexusMobile
# Convert components to React Native equivalents
```

#### Capacitor (Ionic)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
```

#### Cordova/PhoneGap
```bash
npm install -g cordova
cordova create adaptive-agent-nexus-mobile
cd adaptive-agent-nexus-mobile
cordova platform add android ios
```

### Web App (Current)
- ✅ **Progressive Web App (PWA)**
- Service worker for offline functionality
- Installable on mobile/desktop
- No build process needed

## Next Steps

1. **Test the desktop app**:
   ```bash
   npm run electron:dev
   ```

2. **Create distributable packages**:
   ```bash
   npm run dist
   ```

3. **Add custom icons** for professional appearance

4. **Consider mobile deployment** if needed

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed
- Check Node.js version compatibility
- Verify build tools are available

### Runtime Issues
- Check console for errors in Electron DevTools
- Verify API endpoints are accessible
- Test localStorage functionality

### Distribution Issues
- Code signing requirements for app stores
- Platform-specific dependencies
- File size optimization

## Performance Considerations

- **Bundle Size**: Current build is ~560KB JS (minified)
- **Memory Usage**: Electron apps use more memory than web apps
- **Startup Time**: Desktop apps may have slower initial load

## Security Notes

- Electron apps have Node.js access - be careful with user data
- Use preload scripts for secure IPC communication
- Keep dependencies updated to avoid vulnerabilities
- Consider sandboxing options for enhanced security