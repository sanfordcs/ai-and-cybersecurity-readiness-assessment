// netlify/functions/sendEmail.js
const handler = async (event) => {
  try {
    const data = JSON.parse(event.body || "{}");

    // Accept both old and new field names
    const to = data.to || data.email;
    const name = data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim();
    const organization = data.organization;
    const score = data.score;

    if (!to || !organization || !score) {
      console.error("❌ Missing fields:", { to, name, organization, score });
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing required fields" }),
      };
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendUrl = "https://api.resend.com/emails";

    // --- USER EMAIL ---
    const userEmail = {
      from: "DataSolved <hello@datasolved.com>",
      to: [to],
      subject: "Your AI & Cybersecurity Readiness Assessment Results",
      html: `
        <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0;">
          <div style="max-width:600px;margin:auto;padding:30px;background:#f9f9f9;">
            <h2 style="text-align:center;color:#0078D4;">🎯 Your Results Are In</h2>
            <p>Hi ${name || "there"},</p>
            <p>Thank you for completing the <strong>AI & Cybersecurity Readiness Assessment</strong> with DataSolved.</p>
            <p><strong>Organization:</strong> ${organization}<br/>
            <strong>Score:</strong> ${score}</p>
            <p>We'll follow up soon with personalized recommendations to help your business improve security and AI readiness.</p>
            <div style="text-align:center;margin-top:30px;">
              <a href="https://datasolved.com/meet" style="background:#0078D4;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Schedule a Call</a>
            </div>
            <p style="margin-top:40px;font-size:12px;color:#888;">This message was sent automatically by DataSolved's AI Readiness platform.</p>
          </div>
        </body>
        </html>
      `,
    };

    // --- ADMIN EMAIL ---
    const adminEmail = {
      from: "DataSolved <hello@datasolved.com>",
      to: ["ssanford@datasolved.com", "sales@datasolved.com"],
      subject: "📩 New AI & Cybersecurity Readiness Submission",
      html: `
        <html>
        <body style="font-family: Arial, sans-serif; color:#333; line-height:1.6; margin:0; padding:0;">
          <div style="max-width:600px;margin:auto;padding:30px;background:#f9f9f9;">
            <h2 style="color:#0078D4;">New Readiness Assessment Submission</h2>
            <p><strong>Name:</strong> ${name || "N/A"}</p>
            <p><strong>Organization:</strong> ${organization}</p>
            <p><strong>Score:</strong> ${score}</p>
            <p><strong>User Email:</strong> ${to}</p>
            <p style="margin-top:30px;">Submitted: ${new Date().toLocaleString()}</p>
            <hr/>
            <p style="font-size:12px;color:#888;">Automated notification from DataSolved's AI Readiness platform.</p>
          </div>
        </body>
        </html>
      `,
    };

    // Helper: send via Resend API
    const sendResendEmail = async (payload) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);
      return JSON.parse(text);
    };

    // Send both
    await sendResendEmail(userEmail);
    await sendResendEmail(adminEmail);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error in sendEmail:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};

module.exports = { handler };
