# Image Cropping Library Demo

This is a demo application showcasing the image cropping library components built with React, TypeScript, and Vite.

## Features

- **Live Development**: Hot reloading enabled for both demo and library changes
- **Sample Images**: Pre-loaded sample images for quick testing
- **File Upload**: Upload your own images to test cropping functionality
- **Responsive Design**: Works on desktop and mobile devices

## Development

To start the demo application:

```bash
cd demo
npm install
npm run dev
```

The demo will be available at `http://localhost:3001`

## Hot Reloading

The demo is configured to automatically reload when you make changes to:
- Demo application code (`demo/src/`)
- Main library code (`src/`)

This makes it perfect for developing and testing the library components in real-time.

## Usage Example

The demo shows how to import and use the image cropping library:

```tsx
import { App as ImageCroppingApp } from 'image-cropping-library'

function MyApp() {
  return (
    <div>
      <ImageCroppingApp />
    </div>
  )
}
```

## Building

To build the demo for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```