const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

const sendInvoiceEmail = async ({ to, invoiceNumber, vendorName, totalAmount, pdfBuffer }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"VendorBridge ERP" <${process.env.SMTP_USER}>`,
      to,
      subject: `Invoice ${invoiceNumber} from VendorBridge`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#16a34a;padding:20px 30px;border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0">VendorBridge</h2>
          </div>
          <div style="padding:30px;border:1px solid #e5e7eb;border-radius:0 0 8px 8px">
            <p>Dear <strong>${vendorName}</strong>,</p>
            <p>Please find attached your invoice <strong>${invoiceNumber}</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <tr style="background:#f3f4f6">
                <td style="padding:10px;font-weight:600">Invoice Number</td>
                <td style="padding:10px">${invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding:10px;font-weight:600">Total Amount</td>
                <td style="padding:10px;font-size:18px;color:#16a34a"><strong>₹${totalAmount?.toLocaleString('en-IN') || '0'}</strong></td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:13px">Payment is due within 30 days. For queries, reply to this email.</p>
            <p>Regards,<br><strong>VendorBridge Procurement Team</strong></p>
          </div>
        </div>
      `,
      attachments: pdfBuffer
        ? [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
        : [],
    });
  } catch (err) {
    console.error('Email send error:', err.message);
    throw new Error('Failed to send email. Check SMTP settings.');
  }
};

module.exports = { sendInvoiceEmail };
