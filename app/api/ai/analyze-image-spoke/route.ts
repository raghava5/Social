import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    const { imagePath } = await request.json()

    if (!imagePath || typeof imagePath !== 'string') {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      )
    }

    // Resolve the full path to the image
    const fullImagePath = path.resolve(process.cwd(), 'public', imagePath.replace(/^\//, ''))
    
    // Check if image exists
    if (!fs.existsSync(fullImagePath)) {
      return NextResponse.json(
        { error: 'Image file not found' },
        { status: 404 }
      )
    }

    // Call the CLIP Python service
    const result = await runClipAnalysis(fullImagePath)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error, spoke: null },
        { status: 500 }
      )
    }

    console.log(`🖼️ CLIP analyzed image: ${imagePath} -> ${result.spoke || 'None'} (${result.confidence})`)

    return NextResponse.json({
      spoke: result.spoke,
      confidence: result.confidence,
      analysis: `CLIP classified this image as ${result.spoke || 'unclassifiable'}`,
      all_scores: result.all_scores
    })

  } catch (error) {
    console.error('Image analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image', spoke: null },
      { status: 500 }
    )
  }
}

/**
 * Run CLIP analysis using the Python service
 */
function runClipAnalysis(imagePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.resolve(process.cwd(), 'lib', 'clip-service.py')
    
    // Check if Python script exists
    if (!fs.existsSync(pythonScript)) {
      resolve({
        error: 'CLIP service not available',
        spoke: null,
        confidence: 0.0
      })
      return
    }

    // Spawn Python process
    const python = spawn('python3', [pythonScript, imagePath, '--json'], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    python.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    python.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    python.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse the JSON output from CLIP service
          const result = JSON.parse(stdout)
          resolve(result)
        } catch (parseError) {
          console.error('Failed to parse CLIP output:', parseError)
          resolve({
            error: 'Failed to parse CLIP analysis',
            spoke: null,
            confidence: 0.0
          })
        }
      } else {
        console.error('CLIP service error:', stderr)
        resolve({
          error: `CLIP service failed (code ${code})`,
          spoke: null,
          confidence: 0.0
        })
      }
    })

    python.on('error', (error) => {
      console.error('Failed to start CLIP service:', error)
      resolve({
        error: 'CLIP service unavailable',
        spoke: null,
        confidence: 0.0
      })
    })

    // Timeout after 30 seconds
    setTimeout(() => {
      python.kill()
      resolve({
        error: 'CLIP analysis timeout',
        spoke: null,
        confidence: 0.0
      })
    }, 30000)
  })
} 