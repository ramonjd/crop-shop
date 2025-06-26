import { useState } from 'react'
import { App as ImageCroppingApp } from 'image-cropping-library'
import './App.css'

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Sample images for demonstration
  const sampleImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80'
  ]

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Image Cropping Library Demo</h1>
        <p>Showcase of the image cropping functionality with sample images and upload capabilities</p>
      </header>

      <main className="main-content">
        {!selectedImage ? (
          <div className="image-selection">
            <h2>Choose an image to crop</h2>
            
            <div className="upload-section">
              <label htmlFor="file-upload" className="upload-button">
                Upload Your Image
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div className="sample-images">
              <h3>Or choose from sample images:</h3>
              <div className="image-grid">
                {sampleImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="sample-image"
                    onClick={() => handleImageSelect(imageUrl)}
                  >
                    <img src={imageUrl} alt={`Sample ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="cropping-section">
            <button 
              className="back-button"
              onClick={() => setSelectedImage(null)}
            >
              ← Back to Image Selection
            </button>
            
            <div className="cropping-container">
              <ImageCroppingApp />
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with React, TypeScript, and Vite</p>
        <p>Hot reloading enabled for development</p>
      </footer>
    </div>
  )
}

export default App