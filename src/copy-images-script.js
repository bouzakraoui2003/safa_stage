// This script helps copy images from your local paths to the project
// You can run this with Node.js

const fs = require("fs")
const path = require("path")

// Create directories if they don't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`Created directory: ${dirPath}`)
  }
}

// Source paths (your local paths)
const sourcePaths = {
  logo: "C:\\Users\\Setup Game\\Desktop\\safa_stage_2\\lps-cars\\src\\images\\LPS.png",
  carState: "C:\\Users\\Setup Game\\Desktop\\safa_stage_2\\lps-cars\\src\\images\\etatVoiture.jpeg",
}

// Destination paths in your project
const destPaths = {
  logo: "./src/images/LPS.png",
  carState: "./src/images/etatVoiture.jpeg",
}

// Ensure directories exist
ensureDirectoryExists("./src/images")

// Copy files
try {
  fs.copyFileSync(sourcePaths.logo, destPaths.logo)
  console.log(`Copied logo from ${sourcePaths.logo} to ${destPaths.logo}`)

  fs.copyFileSync(sourcePaths.carState, destPaths.carState)
  console.log(`Copied car state image from ${sourcePaths.carState} to ${destPaths.carState}`)

  console.log("Images copied successfully!")
} catch (error) {
  console.error("Error copying files:", error)
}
