import nodemailer from 'nodemailer';

function createTransport() {
  const user = process.env.GMAIL_SENDER_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('GMAIL_SENDER_EMAIL and GMAIL_APP_PASSWORD environment variables are required');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

export async function sendWinnerEmail(winner: {
  prizeName: string;
  prizeType: string;
  prizeValue?: string | null;
  userFullName?: string | null;
  userEmail: string;
  userPhone?: string | null;
  userBankName?: string | null;
  userBankAccountName?: string | null;
  userBankAccountNumber?: string | null;
}) {
  const transporter = createTransport();
  const fromEmail = process.env.GMAIL_SENDER_EMAIL!;

  await transporter.sendMail({
    from: `"Wazosports" <${fromEmail}>`,
    to: 'wazosportswinners@gmail.com',
    subject: `New Winner Alert: ${winner.prizeName}`,
    html: `
      <h2>New Prize Winner 🏆</h2>
      <p><strong>Prize:</strong> ${winner.prizeName}</p>
      <p><strong>Prize Type:</strong> ${winner.prizeType}</p>
      <p><strong>Prize Value:</strong> ${winner.prizeValue ? `₦${winner.prizeValue}` : 'N/A'}</p>
      <hr />
      <h3>Winner Details</h3>
      <p><strong>Name:</strong> ${winner.userFullName || 'Not provided'}</p>
      <p><strong>Email:</strong> ${winner.userEmail}</p>
      <p><strong>Phone:</strong> ${winner.userPhone || 'Not provided'}</p>
      <h4>Bank Details</h4>
      <p><strong>Bank:</strong> ${winner.userBankName || 'Not provided'}</p>
      <p><strong>Account Name:</strong> ${winner.userBankAccountName || 'Not provided'}</p>
      <p><strong>Account Number:</strong> ${winner.userBankAccountNumber || 'Not provided'}</p>
      <hr />
      <p><small>Won at: ${new Date().toLocaleString()}</small></p>
    `,
  });
}
