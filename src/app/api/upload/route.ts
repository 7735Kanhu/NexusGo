import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    // If Cloudinary configuration exists, upload to Cloudinary Cloud API
    if (cloudName) {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const cloudFormData = new FormData();

      if (uploadPreset) {
        // Unsigned Cloudinary Upload
        cloudFormData.append('file', base64Data);
        cloudFormData.append('upload_preset', uploadPreset);
      } else if (apiKey && apiSecret) {
        // Signed Cloudinary Upload
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signatureString = `timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

        cloudFormData.append('file', base64Data);
        cloudFormData.append('api_key', apiKey);
        cloudFormData.append('timestamp', timestamp);
        cloudFormData.append('signature', signature);
      } else {
        // Fallback to base64 if credentials incomplete
        return NextResponse.json({
          success: true,
          url: base64Data,
          provider: 'local_base64',
          message: 'Cloudinary config incomplete. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local',
        });
      }

      const res = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: cloudFormData,
      });

      const data = await res.json();

      if (res.ok && data.secure_url) {
        return NextResponse.json({
          success: true,
          url: data.secure_url,
          provider: 'cloudinary',
          publicId: data.public_id,
        });
      } else {
        console.warn('Cloudinary upload warning:', data);
        // Fallback to base64 data URL if Cloudinary API rejects or fails
        return NextResponse.json({
          success: true,
          url: base64Data,
          provider: 'fallback_base64',
          error: data?.error?.message || 'Cloudinary upload fallback',
        });
      }
    }

    // Default fallback: return base64 Data URL if Cloudinary is not configured
    return NextResponse.json({
      success: true,
      url: base64Data,
      provider: 'base64',
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json(
      { error: err.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
