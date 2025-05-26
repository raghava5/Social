#!/bin/bash

echo "🚀 Setting up CLIP Image Analysis Service for Social Media Platform"
echo "============================================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

echo "✅ pip3 found: $(pip3 --version)"

# Create virtual environment (optional but recommended)
echo "📦 Setting up virtual environment..."
python3 -m venv clip-env 2>/dev/null || echo "Virtual environment already exists or couldn't be created"

# Activate virtual environment if it exists
if [ -d "clip-env" ]; then
    echo "🔄 Activating virtual environment..."
    source clip-env/bin/activate || echo "Continuing without virtual environment..."
fi

# Install CLIP dependencies
echo "📥 Installing CLIP dependencies..."
pip3 install -r requirements-clip.txt

if [ $? -eq 0 ]; then
    echo "✅ CLIP dependencies installed successfully!"
else
    echo "❌ Failed to install CLIP dependencies. Trying alternative method..."
    
    # Alternative installation method
    echo "🔄 Installing dependencies individually..."
    pip3 install torch torchvision torchaudio
    pip3 install ftfy regex tqdm Pillow numpy
    pip3 install git+https://github.com/openai/CLIP.git
fi

# Make the CLIP service executable
chmod +x lib/clip-service.py

# Test the CLIP service with a dummy image (if available)
echo "🧪 Testing CLIP service..."

# Create a test image if it doesn't exist
if [ ! -f "test-image.jpg" ]; then
    echo "📸 Creating test image..."
    python3 -c "
from PIL import Image
import numpy as np

# Create a simple test image
img = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
img.save('test-image.jpg')
print('Test image created: test-image.jpg')
"
fi

# Test the CLIP service
if [ -f "test-image.jpg" ]; then
    echo "🔍 Running CLIP analysis test..."
    python3 lib/clip-service.py test-image.jpg --json
    
    if [ $? -eq 0 ]; then
        echo "✅ CLIP service is working correctly!"
    else
        echo "❌ CLIP service test failed. Please check the installation."
    fi
else
    echo "⚠️ Test image not found. CLIP service installed but not tested."
fi

echo ""
echo "🎉 CLIP Setup Complete!"
echo "============================================================="
echo "✅ CLIP image analysis service is ready to use"
echo "🖼️ Place images in the public/ directory to analyze them"
echo "🚀 Start your Next.js application with: npm run dev"
echo ""
echo "Usage examples:"
echo "  # Analyze an image from command line:"
echo "  python3 lib/clip-service.py public/images/example.jpg"
echo ""
echo "  # Analyze via API:"
echo "  curl -X POST http://localhost:3000/api/ai/analyze-image-spoke \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"imagePath\": \"images/example.jpg\"}'"
echo ""

# Cleanup test files
if [ -f "test-image.jpg" ]; then
    rm test-image.jpg
    echo "🧹 Cleaned up test files"
fi

echo "📚 For more information, see the SCALABILITY-GUIDE.md" 