import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  userEmail: string;
  userName: string;
  userPhone?: string;
  userId: string;
  prizeName: string;
  prizeValue?: number;
  prizeType: string;
  timestamp: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (!sendgridApiKey) {
      console.error("SENDGRID_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: NotificationRequest = await req.json();
    const {
      userEmail,
      userName,
      userPhone,
      userId,
      prizeName,
      prizeValue,
      prizeType,
      timestamp,
    } = body;

    const prizeValueText = prizeValue ? `₦${prizeValue.toLocaleString()}` : "N/A";
    const phoneText = userPhone || "Not provided";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .prize-info {
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
            }
            .prize-name {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .prize-value {
              font-size: 24px;
              font-weight: bold;
            }
            .info-row {
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: bold;
              color: #059669;
              display: inline-block;
              width: 150px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Prize Winner!</h1>
              <p>A user has won a prize on the Sports Quiz Platform</p>
            </div>
            <div class="content">
              <div class="prize-info">
                <div class="prize-name">${prizeName}</div>
                <div class="prize-value">${prizeValueText}</div>
                <p style="margin-top: 10px; opacity: 0.9;">Prize Type: ${prizeType}</p>
              </div>

              <h2 style="color: #059669; margin-top: 30px;">Winner Information</h2>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span>${userName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span>${userEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span>${phoneText}</span>
              </div>
              <div class="info-row">
                <span class="info-label">User ID:</span>
                <span>${userId}</span>
              </div>
              <div class="info-row" style="border-bottom: none;">
                <span class="info-label">Date & Time:</span>
                <span>${new Date(timestamp).toLocaleString()}</span>
              </div>

              ${prizeType === 'cash' ? '<p style="margin-top: 20px; padding: 15px; background-color: #dcfce7; border-left: 4px solid #10b981; border-radius: 4px;"><strong>Note:</strong> Cash prize has been automatically added to the winner\'s wallet.</p>' : ''}
              ${prizeType === 'item' ? '<p style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;"><strong>Action Required:</strong> Please contact the winner to arrange prize delivery.</p>' : ''}
              ${prizeType === 'draw' ? '<p style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;"><strong>Note:</strong> Winner has been entered into the weekly draw.</p>' : ''}
            </div>
            <div class="footer">
              <p>Sports Quiz Platform - Prize Notification System</p>
              <p>This is an automated notification</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
New Prize Winner!

Prize: ${prizeName}
Value: ${prizeValueText}
Type: ${prizeType}

Winner Information:
Name: ${userName}
Email: ${userEmail}
Phone: ${phoneText}
User ID: ${userId}
Date & Time: ${new Date(timestamp).toLocaleString()}

${prizeType === 'cash' ? 'Cash prize has been automatically added to the winner\'s wallet.' : ''}
${prizeType === 'item' ? 'Action Required: Please contact the winner to arrange prize delivery.' : ''}
${prizeType === 'draw' ? 'Winner has been entered into the weekly draw.' : ''}

Sports Quiz Platform - Prize Notification System
    `;

    const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sendgridApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: "kingspridevas@gmail.com" }],
            subject: `🎉 New Prize Winner: ${prizeName} - ${userName}`,
          },
        ],
        from: {
          email: "noreply@yourdomain.com",
          name: "Sports Quiz Platform",
        },
        content: [
          {
            type: "text/plain",
            value: emailText,
          },
          {
            type: "text/html",
            value: emailHtml,
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("SendGrid API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const emailData = emailResponse.status === 202 ? { success: true } : await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent successfully via SendGrid",
        emailStatus: emailData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send notification",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});