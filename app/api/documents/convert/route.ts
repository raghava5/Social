import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

interface ConversionResult {
  success: boolean
  htmlContent?: string
  textContent?: string
  metadata?: {
    pages?: number
    title?: string
    author?: string
    wordCount?: number
    characterCount?: number
  }
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle cookie setting error
            }
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const conversionType = formData.get('type') as string || 'html'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log(`🔄 Converting document: ${file.name} (${file.type})`)

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp', 'conversions')
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = path.extname(file.name)
    const baseName = `${timestamp}-${randomId}`
    const inputPath = path.join(tempDir, `${baseName}${fileExtension}`)

    try {
      // Save uploaded file to temp location
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(inputPath, buffer)

      // Convert based on file type
      const result = await convertDocument(inputPath, file.name, conversionType)

      // Clean up temp file
      await unlink(inputPath).catch(() => {}) // Ignore cleanup errors

      return NextResponse.json(result)

    } catch (error) {
      // Clean up temp file on error
      await unlink(inputPath).catch(() => {})
      throw error
    }

  } catch (error) {
    console.error('Document conversion error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Conversion failed' 
      },
      { status: 500 }
    )
  }
}

async function convertDocument(
  inputPath: string, 
  originalName: string, 
  conversionType: string
): Promise<ConversionResult> {
  const extension = path.extname(originalName).toLowerCase()
  
  try {
    switch (extension) {
      case '.txt':
        return await convertTextFile(inputPath)
      
      case '.csv':
        return await convertCSVFile(inputPath)
      
      case '.pdf':
        return await convertPDFFile(inputPath)
      
      case '.doc':
      case '.docx':
        return await convertWordDocument(inputPath)
      
      case '.xls':
      case '.xlsx':
        return await convertExcelDocument(inputPath)
      
      case '.ppt':
      case '.pptx':
        return await convertPowerPointDocument(inputPath)
      
      case '.rtf':
        return await convertRTFDocument(inputPath)
      
      case '.odt':
      case '.ods':
      case '.odp':
        return await convertOpenOfficeDocument(inputPath, extension)
      
      default:
        return {
          success: false,
          error: `Unsupported file format: ${extension}`
        }
    }
  } catch (error) {
    console.error(`Conversion error for ${extension}:`, error)
    return {
      success: false,
      error: `Failed to convert ${extension} file: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function convertTextFile(inputPath: string): Promise<ConversionResult> {
  try {
    const content = await readFile(inputPath, 'utf-8')
    const lines = content.split('\n')
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length
    
    const htmlContent = `
      <div class="document-content text-document">
        <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; line-height: 1.6; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">${content}</pre>
      </div>
    `
    
    return {
      success: true,
      htmlContent,
      textContent: content,
      metadata: {
        wordCount,
        characterCount: content.length
      }
    }
  } catch (error) {
    throw new Error(`Failed to read text file: ${error}`)
  }
}

async function convertCSVFile(inputPath: string): Promise<ConversionResult> {
  try {
    const content = await readFile(inputPath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      return {
        success: true,
        htmlContent: '<p>Empty CSV file</p>',
        textContent: '',
        metadata: { wordCount: 0, characterCount: 0 }
      }
    }
    
    // Parse CSV (simple implementation)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      result.push(current.trim())
      return result
    }
    
    const headers = parseCSVLine(lines[0])
    const rows = lines.slice(1).map(line => parseCSVLine(line))
    
    let htmlContent = `
      <div class="document-content csv-document">
        <style>
          .csv-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .csv-table th {
            background-color: #4f46e5;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
          }
          .csv-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .csv-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .csv-table tr:hover {
            background-color: #f3f4f6;
          }
        </style>
        <table class="csv-table">
          <thead>
            <tr>
    `
    
    headers.forEach(header => {
      htmlContent += `<th>${escapeHtml(header)}</th>`
    })
    
    htmlContent += `
            </tr>
          </thead>
          <tbody>
    `
    
    rows.forEach(row => {
      htmlContent += '<tr>'
      headers.forEach((_, index) => {
        const cellValue = row[index] || ''
        htmlContent += `<td>${escapeHtml(cellValue)}</td>`
      })
      htmlContent += '</tr>'
    })
    
    htmlContent += `
          </tbody>
        </table>
      </div>
    `
    
    return {
      success: true,
      htmlContent,
      textContent: content,
      metadata: {
        wordCount: content.split(/\s+/).length,
        characterCount: content.length
      }
    }
  } catch (error) {
    throw new Error(`Failed to convert CSV file: ${error}`)
  }
}

async function convertPDFFile(inputPath: string): Promise<ConversionResult> {
  // For PDF files, we'll use a placeholder since PDF.js handles rendering on the client
  // In a production environment, you might use pdf2htmlEX or similar tools
  
  try {
    // Try to extract text using pdftotext if available
    let textContent = ''
    try {
      const { stdout } = await execAsync(`pdftotext "${inputPath}" -`)
      textContent = stdout
    } catch (error) {
      console.warn('pdftotext not available, using placeholder')
      textContent = 'PDF content extraction requires additional tools'
    }
    
    const htmlContent = `
      <div class="document-content pdf-document">
        <div style="text-align: center; padding: 40px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
          <h3 style="color: #374151; margin-bottom: 8px;">PDF Document</h3>
          <p style="color: #6b7280; margin-bottom: 16px;">This PDF will be rendered using the built-in PDF viewer</p>
          ${textContent && textContent !== 'PDF content extraction requires additional tools' ? 
            `<div style="text-align: left; max-height: 300px; overflow-y: auto; background: white; padding: 16px; border-radius: 4px; margin-top: 16px;">
              <pre style="white-space: pre-wrap; font-size: 12px; line-height: 1.4;">${escapeHtml(textContent.substring(0, 1000))}${textContent.length > 1000 ? '...' : ''}</pre>
            </div>` : ''
          }
        </div>
      </div>
    `
    
    return {
      success: true,
      htmlContent,
      textContent,
      metadata: {
        wordCount: textContent.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: textContent.length
      }
    }
  } catch (error) {
    throw new Error(`Failed to process PDF file: ${error}`)
  }
}

async function convertWordDocument(inputPath: string): Promise<ConversionResult> {
  // Try to use LibreOffice for conversion
  try {
    const outputDir = path.dirname(inputPath)
    const baseName = path.basename(inputPath, path.extname(inputPath))
    const htmlPath = path.join(outputDir, `${baseName}.html`)
    
    // Convert using LibreOffice (if available)
    try {
      await execAsync(`libreoffice --headless --convert-to html --outdir "${outputDir}" "${inputPath}"`)
      
      if (existsSync(htmlPath)) {
        const htmlContent = await readFile(htmlPath, 'utf-8')
        await unlink(htmlPath).catch(() => {}) // Clean up
        
        // Extract text content
        const textContent = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
        
        return {
          success: true,
          htmlContent: `<div class="document-content word-document">${htmlContent}</div>`,
          textContent,
          metadata: {
            wordCount: textContent.split(/\s+/).filter(word => word.length > 0).length,
            characterCount: textContent.length
          }
        }
      }
    } catch (libreOfficeError) {
      console.warn('LibreOffice conversion failed:', libreOfficeError)
    }
    
    // Fallback: Return placeholder
    return {
      success: true,
      htmlContent: `
        <div class="document-content word-document">
          <div style="text-align: center; padding: 40px; background-color: #f8f9fa; border-radius: 8px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
            <h3 style="color: #374151;">Word Document</h3>
            <p style="color: #6b7280;">Document conversion requires LibreOffice to be installed</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
              Install LibreOffice for full document preview support
            </p>
          </div>
        </div>
      `,
      textContent: 'Word document content requires conversion tools',
      metadata: {
        wordCount: 0,
        characterCount: 0
      }
    }
  } catch (error) {
    throw new Error(`Failed to convert Word document: ${error}`)
  }
}

async function convertExcelDocument(inputPath: string): Promise<ConversionResult> {
  // Similar to Word documents, try LibreOffice conversion
  try {
    const outputDir = path.dirname(inputPath)
    const baseName = path.basename(inputPath, path.extname(inputPath))
    const htmlPath = path.join(outputDir, `${baseName}.html`)
    
    try {
      await execAsync(`libreoffice --headless --convert-to html --outdir "${outputDir}" "${inputPath}"`)
      
      if (existsSync(htmlPath)) {
        const htmlContent = await readFile(htmlPath, 'utf-8')
        await unlink(htmlPath).catch(() => {})
        
        const textContent = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
        
        return {
          success: true,
          htmlContent: `<div class="document-content excel-document">${htmlContent}</div>`,
          textContent,
          metadata: {
            wordCount: textContent.split(/\s+/).filter(word => word.length > 0).length,
            characterCount: textContent.length
          }
        }
      }
    } catch (libreOfficeError) {
      console.warn('LibreOffice conversion failed:', libreOfficeError)
    }
    
    return {
      success: true,
      htmlContent: `
        <div class="document-content excel-document">
          <div style="text-align: center; padding: 40px; background-color: #f8f9fa; border-radius: 8px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
            <h3 style="color: #374151;">Excel Spreadsheet</h3>
            <p style="color: #6b7280;">Spreadsheet conversion requires LibreOffice to be installed</p>
          </div>
        </div>
      `,
      textContent: 'Excel spreadsheet content requires conversion tools',
      metadata: { wordCount: 0, characterCount: 0 }
    }
  } catch (error) {
    throw new Error(`Failed to convert Excel document: ${error}`)
  }
}

async function convertPowerPointDocument(inputPath: string): Promise<ConversionResult> {
  // Similar approach for PowerPoint
  return {
    success: true,
    htmlContent: `
      <div class="document-content powerpoint-document">
        <div style="text-align: center; padding: 40px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
          <h3 style="color: #374151;">PowerPoint Presentation</h3>
          <p style="color: #6b7280;">Presentation conversion requires LibreOffice to be installed</p>
        </div>
      </div>
    `,
    textContent: 'PowerPoint presentation content requires conversion tools',
    metadata: { wordCount: 0, characterCount: 0 }
  }
}

async function convertRTFDocument(inputPath: string): Promise<ConversionResult> {
  try {
    // RTF is mostly plain text with formatting codes
    const content = await readFile(inputPath, 'utf-8')
    
    // Basic RTF to HTML conversion (simplified)
    let htmlContent = content
      .replace(/\\par\b/g, '<br>')
      .replace(/\\b\b/g, '<strong>')
      .replace(/\\b0\b/g, '</strong>')
      .replace(/\\i\b/g, '<em>')
      .replace(/\\i0\b/g, '</em>')
      .replace(/\{[^}]*\}/g, '') // Remove RTF control groups
      .replace(/\\[a-z]+\d*/g, '') // Remove RTF control words
    
    const textContent = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    
    return {
      success: true,
      htmlContent: `
        <div class="document-content rtf-document">
          <div style="padding: 20px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
            ${htmlContent}
          </div>
        </div>
      `,
      textContent,
      metadata: {
        wordCount: textContent.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: textContent.length
      }
    }
  } catch (error) {
    throw new Error(`Failed to convert RTF document: ${error}`)
  }
}

async function convertOpenOfficeDocument(inputPath: string, extension: string): Promise<ConversionResult> {
  const docType = extension === '.odt' ? 'Text Document' : 
                 extension === '.ods' ? 'Spreadsheet' : 'Presentation'
  const icon = extension === '.odt' ? '📝' : 
              extension === '.ods' ? '📊' : '📋'
  
  return {
    success: true,
    htmlContent: `
      <div class="document-content openoffice-document">
        <div style="text-align: center; padding: 40px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="font-size: 48px; margin-bottom: 16px;">${icon}</div>
          <h3 style="color: #374151;">OpenOffice ${docType}</h3>
          <p style="color: #6b7280;">Document conversion requires LibreOffice to be installed</p>
        </div>
      </div>
    `,
    textContent: `OpenOffice ${docType} content requires conversion tools`,
    metadata: { wordCount: 0, characterCount: 0 }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  )
} 