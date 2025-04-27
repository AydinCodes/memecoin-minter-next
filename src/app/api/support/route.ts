// src/app/api/support/route.ts

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const EMAIL_USERNAME = process.env.EMAIL_USERNAME
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD

// Maximum allowed file size (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Create form data parser
    const formData = await request.formData();
    
    // Get form fields
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const screenshot = formData.get('screenshot') as File | null;
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate screenshot size if provided
    if (screenshot && screenshot.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Screenshot must be less than 2MB' },
        { status: 400 }
      );
    }
    
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_APP_PASSWORD
      }
    });
    
    // Prepare email content
    const mailOptions: any = {
      from: `"SolHype Support" <${EMAIL_USERNAME}>`,
      to: process.env.NOTIFICATION_RECIPIENT,
      subject: `Support Request from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6d28d9;">SolHype Support Request</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #6d28d9;">
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `
    };
    
    // Add screenshot attachment if provided
    if (screenshot) {
      const buffer = await screenshot.arrayBuffer();
      mailOptions.attachments = [
        {
          filename: screenshot.name,
          content: Buffer.from(buffer)
        }
      ];
    }
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Support request sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending support request:', error);
    return NextResponse.json(
      { error: 'Failed to send support request' },
      { status: 500 }
    );
  }
}