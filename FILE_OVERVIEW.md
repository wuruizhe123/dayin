# Ziddy Document Print System - File Overview

## 📁 Project Structure

```
ziddy/
├── .trae/                          # TRAE IDE configuration
│   ├── documents/
│   │   ├── prd.md                  # Product Requirements Document
│   │   └── technical.md            # Technical Architecture Document
│
├── deploy/                         # Deployment package output
│   ├── dist/                       # Built frontend assets
│   ├── README.md                   # Deployment instructions
│   ├── deploy.bat                  # Windows deployment script
│   ├── deploy.sh                   # Linux/Mac deployment script
│   └── package*.json               # NPM package files
│
├── dist/                           # Frontend build output
│   ├── assets/                     # Compiled JS/CSS resources
│   └── index.html                  # Main HTML entry
│
├── installer/                      # Electron-based installer (deprecated)
│   ├── index.html                  # Installer GUI
│   ├── main.js                     # Electron main process
│   ├── renderer.js                 # Electron renderer process
│   ├── style.css                   # Installer styles
│   └── package.json                # Installer dependencies
│
├── packager/                       # Project packaging system
│   ├── src/
│   │   ├── index.js                # CLI entry point
│   │   ├── packager.js             # Packager core logic
│   │   └── utils/
│   │       ├── integrity.js        # File integrity verification
│   │       ├── logger.js           # Logging utilities
│   │       └── version.js          # Version management
│   ├── starter/                    # Electron starter program
│   │   ├── index.html              # Starter GUI
│   │   ├── main.js                 # Electron main process
│   │   ├── renderer.js             # Electron renderer process
│   │   ├── style.css               # Starter styles
│   │   └── package.json            # Starter dependencies
│   ├── README.md                   # Packager documentation
│   ├── TEST_REPORT.md              # Test results
│   └── package.json                # Packager dependencies
│
├── project-starter/                # Project initialization CLI
│   ├── src/
│   │   ├── commands/               # CLI commands
│   │   │   ├── init.ts             # Project initialization
│   │   │   ├── build.ts            # Build project
│   │   │   ├── start.ts            # Start project
│   │   │   └── help.ts             # Help information
│   │   ├── generators/             # Project template generators
│   │   │   ├── projectGenerator.ts # Generator core
│   │   │   └── templates/          # Project templates (React, Vue, Angular, Express, etc.)
│   │   ├── types/                  # TypeScript type definitions
│   │   └── utils/                  # Utility functions
│   │       ├── env.ts              # Environment detection
│   │       ├── git.ts              # Git initialization
│   │       └── install.ts          # Dependency installation
│   ├── dist/                       # Compiled output
│   └── package.json                # CLI dependencies
│
├── public/                         # Static assets
│   └── favicon.svg                 # Application icon
│
├── src/                            # Main frontend source code
│   ├── assets/                     # Static assets
│   ├── components/                 # React components
│   │   ├── DocumentList/           # Document list display
│   │   ├── DocumentPreview/        # Document preview component
│   │   ├── FileUpload/             # File upload component
│   │   ├── Header/                 # Page header
│   │   ├── ParseStatus/            # Parse status display
│   │   ├── PrintControl/           # Print control panel
│   │   ├── PrintQueue/             # Print queue management
│   │   ├── PrintSettings/          # Print settings
│   │   ├── PrinterSelector/        # Printer selection
│   │   └── Empty.tsx               # Empty state component
│   ├── hooks/                      # Custom hooks
│   │   ├── usePrinterDetection.ts  # Printer detection hook
│   │   └── useTheme.ts             # Theme management hook
│   ├── lib/                        # Shared utilities
│   │   └── utils.ts                # General utilities
│   ├── stores/                     # Zustand state management
│   │   └── printStore.ts           # Print state store
│   ├── types/                      # Type definitions
│   │   └── mammoth.d.ts            # Mammoth types
│   ├── utils/                      # Utility functions
│   │   ├── documentParser.ts       # Document parsing logic
│   │   ├── fileUtils.ts            # File utilities
│   │   └── printUtils.ts           # Print utilities
│   ├── App.tsx                     # Root component
│   ├── index.css                   # Global styles
│   ├── main.tsx                    # Application entry point
│   └── vite-env.d.ts               # Vite environment types
│
├── .gitignore                      # Git ignore rules
├── README.md                       # Project README
├── eslint.config.js                # ESLint configuration
├── index.html                      # Main HTML template
├── install.html                    # Dependency detection & installation GUI
├── installer-server.js             # Installation API server
├── package-lock.json               # NPM lockfile
├── package.json                    # Project dependencies
├── postcss.config.js               # PostCSS configuration
├── start.bat                       # Windows one-click startup
├── start.sh                        # Linux/Mac one-click startup
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite configuration
```

---

## 🎯 Core Application Files

### Main Frontend
| File | Description |
|------|-------------|
| [src/main.tsx](file:///c:/Users/27349/Desktop/ziddy/src/main.tsx) | Application entry point, renders React app |
| [src/App.tsx](file:///c:/Users/27349/Desktop/ziddy/src/App.tsx) | Root component, main layout |
| [src/index.css](file:///c:/Users/27349/Desktop/ziddy/src/index.css) | Global styles with Tailwind directives |
| [index.html](file:///c:/Users/27349/Desktop/ziddy/index.html) | HTML template for Vite build |

### Components
| Component | Description |
|-----------|-------------|
| [FileUpload](file:///c:/Users/27349/Desktop/ziddy/src/components/FileUpload/index.tsx) | Drag-and-drop file upload interface |
| [DocumentPreview](file:///c:/Users/27349/Desktop/ziddy/src/components/DocumentPreview/index.tsx) | PDF/Word/Excel/image preview |
| [DocumentList](file:///c:/Users/27349/Desktop/ziddy/src/components/DocumentList/index.tsx) | Uploaded documents list |
| [PrinterSelector](file:///c:/Users/27349/Desktop/ziddy/src/components/PrinterSelector/index.tsx) | Available printers selection |
| [PrintControl](file:///c:/Users/27349/Desktop/ziddy/src/components/PrintControl/index.tsx) | Print settings and control |
| [PrintQueue](file:///c:/Users/27349/Desktop/ziddy/src/components/PrintQueue/index.tsx) | Batch print queue management |
| [PrintSettings](file:///c:/Users/27349/Desktop/ziddy/src/components/PrintSettings/index.tsx) | Print parameters configuration |
| [ParseStatus](file:///c:/Users/27349/Desktop/ziddy/src/components/ParseStatus/index.tsx) | Document parsing status display |

### Utilities
| File | Description |
|------|-------------|
| [src/utils/documentParser.ts](file:///c:/Users/27349/Desktop/ziddy/src/utils/documentParser.ts) | PDF/Word/Excel/image parsing |
| [src/utils/printUtils.ts](file:///c:/Users/27349/Desktop/ziddy/src/utils/printUtils.ts) | Print operations and settings |
| [src/utils/fileUtils.ts](file:///c:/Users/27349/Desktop/ziddy/src/utils/fileUtils.ts) | File handling utilities |
| [src/lib/utils.ts](file:///c:/Users/27349/Desktop/ziddy/src/lib/utils.ts) | Shared utility functions |

### State Management
| File | Description |
|------|-------------|
| [src/stores/printStore.ts](file:///c:/Users/27349/Desktop/ziddy/src/stores/printStore.ts) | Zustand store for print state |

### Hooks
| File | Description |
|------|-------------|
| [src/hooks/usePrinterDetection.ts](file:///c:/Users/27349/Desktop/ziddy/src/hooks/usePrinterDetection.ts) | Detect available printers |
| [src/hooks/useTheme.ts](file:///c:/Users/27349/Desktop/ziddy/src/hooks/useTheme.ts) | Theme management |

---

## 📦 Dependency Management System

### Installation GUI
| File | Description |
|------|-------------|
| [install.html](file:///c:/Users/27349/Desktop/ziddy/install.html) | Web-based installer interface |
| [installer-server.js](file:///c:/Users/27349/Desktop/ziddy/installer-server.js) | Backend API server for installation |

#### install.html Features
- **System Scan**: Detects Node.js, npm, and project dependencies
- **Status Display**: Shows installation status with visual indicators
- **One-Click Install**: Installs all missing dependencies
- **Progress Tracking**: Real-time installation progress
- **Log System**: Detailed installation logs

#### installer-server.js API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/check-node` | GET | Check Node.js installation status |
| `/check-npm` | GET | Check npm installation status |
| `/check-dependencies` | GET | Check project dependencies |
| `/install-dependencies` | POST | Run npm install |

---

## 🚀 Startup Scripts

| File | Description |
|------|-------------|
| [start.bat](file:///c:/Users/27349/Desktop/ziddy/start.bat) | Windows one-click startup |
| [start.sh](file:///c:/Users/27349/Desktop/ziddy/start.sh) | Linux/Mac one-click startup |

### Startup Flow
1. **Node.js Check**: Verifies Node.js installation
2. **Dependencies Check**: Installs missing dependencies
3. **Service Startup**: Starts frontend and optional backend

---

## 📤 Packaging System

### Packager Core
| File | Description |
|------|-------------|
| [packager/src/index.js](file:///c:/Users/27349/Desktop/ziddy/packager/src/index.js) | CLI entry point |
| [packager/src/packager.js](file:///c:/Users/27349/Desktop/ziddy/packager/src/packager.js) | Packaging logic |
| [packager/src/utils/integrity.js](file:///c:/Users/27349/Desktop/ziddy/packager/src/utils/integrity.js) | SHA256 integrity verification |
| [packager/src/utils/logger.js](file:///c:/Users/27349/Desktop/ziddy/packager/src/utils/logger.js) | Colorful logging |
| [packager/src/utils/version.js](file:///c:/Users/27349/Desktop/ziddy/packager/src/utils/version.js) | Version generation |

### Starter Program
| File | Description |
|------|-------------|
| [packager/starter/main.js](file:///c:/Users/27349/Desktop/ziddy/packager/starter/main.js) | Electron main process |
| [packager/starter/renderer.js](file:///c:/Users/27349/Desktop/ziddy/packager/starter/renderer.js) | GUI logic |
| [packager/starter/index.html](file:///c:/Users/27349/Desktop/ziddy/packager/starter/index.html) | Starter GUI |

---

## 🛠️ Project Starter CLI

| File | Description |
|------|-------------|
| [project-starter/src/index.ts](file:///c:/Users/27349/Desktop/ziddy/project-starter/src/index.ts) | CLI entry |
| [project-starter/src/commands/init.ts](file:///c:/Users/27349/Desktop/ziddy/project-starter/src/commands/init.ts) | Project initialization |
| [project-starter/src/commands/build.ts](file:///c:/Users/27349/Desktop/ziddy/project-starter/src/commands/build.ts) | Build command |
| [project-starter/src/commands/start.ts](file:///c:/Users/27349/Desktop/ziddy/project-starter/src/commands/start.ts) | Start command |
| [project-starter/src/generators/projectGenerator.ts](file:///c:/Users/27349/Desktop/ziddy/project-starter/src/generators/projectGenerator.ts) | Template generator |

### Supported Templates
- React (JavaScript/TypeScript)
- Vue (JavaScript/TypeScript)
- Angular
- Express (JavaScript/TypeScript)
- Koa (TypeScript)
- NestJS

---

## ⚙️ Configuration Files

| File | Description |
|------|-------------|
| [package.json](file:///c:/Users/27349/Desktop/ziddy/package.json) | Project dependencies and scripts |
| [vite.config.ts](file:///c:/Users/27349/Desktop/ziddy/vite.config.ts) | Vite build configuration |
| [tsconfig.json](file:///c:/Users/27349/Desktop/ziddy/tsconfig.json) | TypeScript configuration |
| [tailwind.config.js](file:///c:/Users/27349/Desktop/ziddy/tailwind.config.js) | Tailwind CSS configuration |
| [postcss.config.js](file:///c:/Users/27349/Desktop/ziddy/postcss.config.js) | PostCSS configuration |
| [eslint.config.js](file:///c:/Users/27349/Desktop/ziddy/eslint.config.js) | ESLint configuration |

---

## 📋 Key Dependencies

### Runtime Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM rendering |
| pdfjs-dist | ^5.4.624 | PDF rendering |
| mammoth | ^1.12.0 | Word document parsing |
| xlsx | ^0.18.5 | Excel parsing |
| tesseract.js | ^7.0.0 | OCR text recognition |
| zustand | ^5.0.3 | State management |
| lucide-react | ^0.511.0 | Icons |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^6.3.5 | Build tool |
| typescript | ~5.8.3 | TypeScript |
| tailwindcss | ^3.4.17 | CSS framework |
| eslint | ^9.25.0 | Linting |

---

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build
```bash
npm run build
```

### Dependency Installation (GUI)
```bash
# Start installer server
node installer-server.js

# Open install.html in browser
# Or double-click install.html
```

### One-Click Startup
- **Windows**: Double-click `start.bat`
- **Linux/Mac**: Run `chmod +x start.sh && ./start.sh`

### Packaging
```bash
cd packager
npm install
node src/index.js
```

---

## 📝 File Summary

| Category | Files |
|----------|-------|
| Main Application | 14 files (src/) |
| Components | 10 components |
| Utilities | 4 files |
| Configuration | 6 files |
| Installation | 2 files |
| Startup | 2 files |
| Packager | 7 files |
| Project Starter | 14 files |
| Deployment | 6 files |

**Total**: ~60 files