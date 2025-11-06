import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    
    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      return NextResponse.json(
        { error: 'Logo not found' },
        { status: 404 }
      );
    }

    // Read and serve the file
    const fileBuffer = fs.readFileSync(logoPath);
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('[Logo API] Error serving logo:', error);
    return NextResponse.json(
      { error: 'Failed to serve logo' },
      { status: 500 }
    );
  }
}

