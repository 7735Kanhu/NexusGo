import nodemailer from 'nodemailer';

interface SendWelcomeEmailParams {
  driverName: string;
  driverEmail: string;
  deliveryBoyId: string;
  fhrId?: string;
  phone: string;
  paymentType: 'COMMISSION' | 'SALARY';
  defaultCommission: number;
  monthlySalary: number;
  joiningDate: string;
}

export async function sendDriverWelcomeEmail(params: SendWelcomeEmailParams) {
  const {
    driverName,
    driverEmail,
    deliveryBoyId,
    fhrId,
    phone,
    paymentType,
    defaultCommission,
    monthlySalary,
    joiningDate,
  } = params;

  if (!driverEmail || !driverEmail.includes('@')) {
    console.log(`ℹ️ No valid email provided for driver ${driverName}. Skipping email dispatch.`);
    return { sent: false, reason: 'No email provided' };
  }

  const effectiveId = fhrId || deliveryBoyId;
  const payoutText =
    paymentType === 'SALARY'
      ? `Fixed Monthly Salary: ₹${(monthlySalary || 15000).toLocaleString('en-IN')}/month`
      : `Commission Rate: ₹${defaultCommission || 13} per successful parcel`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #10b981, #047857); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 28px 24px; }
          .card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #cbd5e1; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .detail-label { color: #64748b; font-weight: 600; }
          .detail-val { color: #0f172a; font-weight: 700; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          .badge { display: inline-block; background: #d1fae5; color: #065f46; font-weight: 800; padding: 6px 16px; border-radius: 9999px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Welcome to NexusGo Logistics!</h1>
            <p>Official Delivery Partner Registration Confirmation</p>
          </div>
          <div class="content">
            <p>Hello <strong>${driverName}</strong>,</p>
            <p>Congratulations! You have been successfully registered as an official Delivery Partner at <strong>NexusGo Logistics Business Management System</strong>.</p>
            
            <div class="card">
              <div style="text-align: center; margin-bottom: 16px;">
                <span class="badge">Employee ID (FHRID): ${effectiveId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Driver Name:</span>
                <span class="detail-val">${driverName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Member ID / FHRID:</span>
                <span class="detail-val" style="color: #047857; font-weight: 800;">${effectiveId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">System Driver ID:</span>
                <span class="detail-val">${deliveryBoyId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Mobile Phone:</span>
                <span class="detail-val">+91 ${phone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Joining Date:</span>
                <span class="detail-val">${joiningDate}</span>
              </div>
              <div class="detail-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
                <span class="detail-label">Payout Structure:</span>
                <span class="detail-val" style="color: #059669;">${payoutText}</span>
              </div>
            </div>

            <p>Please report to the central Logistics Hub for operational guidelines and route assignment. Always quote your <strong>Employee ID / FHRID (${effectiveId})</strong> for attendance, parcel pickups, and payout verification.</p>
            <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
              If you have any questions regarding your registration or payouts, please contact your logistics manager.
            </p>
          </div>
          <div class="footer">
            &copy; 2026 NexusGo Logistics Owner Portal. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"NexusGo Logistics" <${user}>`,
        to: driverEmail,
        subject: `Welcome to NexusGo Logistics! Your Employee ID (FHRID): ${effectiveId}`,
        html: htmlContent,
      });

      console.log(`✅ Driver welcome email sent via SMTP to ${driverEmail}`);
      return { sent: true, mode: 'smtp' };
    } catch (err) {
      console.error('SMTP email sending error:', err);
      return { sent: false, error: err };
    }
  } else {
    console.log(`📧 [Simulated Email Sent] To: ${driverEmail} | Driver: ${driverName} | ID: ${effectiveId}`);
    return { sent: true, mode: 'simulated' };
  }
}
