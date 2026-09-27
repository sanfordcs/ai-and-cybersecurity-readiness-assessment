const DEFAULT_ADMIN_RECIPIENTS = ["ssanford@datasolved.com", "sales@datasolved.com"];

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const parseAdminRecipients = () => {
  const configured = process.env.ADMIN_RECIPIENTS
    ?.split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  return configured?.length ? configured : DEFAULT_ADMIN_RECIPIENTS;
};

const sendResendEmail = async (apiKey, payload) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error(`Resend returned ${response.status}: ${responseText}`);
  return responseText ? JSON.parse(responseText) : {};
};

const buildReadinessEmails = (data, fromAddress, adminRecipients) => {
  const recipient = data.user_email || data.email;
  const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
  const organization = data.organization;
  const score = Number(data.score);
  const maxScore = Number(data.max_score || 96);
  const percentage = Number.isFinite(Number(data.percentage))
    ? Number(data.percentage)
    : Math.round((score / maxScore) * 100);

  if (!recipient || !organization || !Number.isFinite(score)) {
    throw new TypeError("Missing required assessment fields");
  }

  const safeName = escapeHtml(name || "there");
  const safeOrganization = escapeHtml(organization);
  const safeRecipient = escapeHtml(recipient);

  return {
    user: {
      from: fromAddress,
      to: [recipient],
      subject: "Your AI & Cybersecurity Readiness Assessment Results",
      html: `
        <div style="max-width:600px;margin:auto;padding:30px;background:#f7f9fc;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
          <h2 style="color:#0078d4">Your readiness results</h2>
          <p>Hi ${safeName},</p>
          <p>Thank you for completing DataSolved's AI and Cybersecurity Readiness Assessment.</p>
          <p><strong>Organization:</strong> ${safeOrganization}<br><strong>Score:</strong> ${score}/${maxScore} (${percentage}%)</p>
          <p>Your results and recommendations remain available on the completed assessment page.</p>
          <p><a href="https://datasolved.com/meet" style="display:inline-block;background:#0078d4;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px">Schedule a readiness consultation</a></p>
          <p style="font-size:12px;color:#6b7280">DataSolved Consulting Group</p>
        </div>`,
    },
    admin: {
      from: fromAddress,
      to: adminRecipients,
      reply_to: recipient,
      subject: "New AI & Cybersecurity Readiness Submission",
      html: `
        <div style="max-width:600px;margin:auto;padding:30px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
          <h2 style="color:#0078d4">New readiness assessment</h2>
          <p><strong>Name:</strong> ${escapeHtml(name || "N/A")}</p>
          <p><strong>Organization:</strong> ${safeOrganization}</p>
          <p><strong>Email:</strong> ${safeRecipient}</p>
          <p><strong>Score:</strong> ${score}/${maxScore} (${percentage}%)</p>
          <p><strong>Readiness level:</strong> ${escapeHtml(data.levelName || "N/A")}</p>
        </div>`,
    },
  };
};

const buildCybersecurityEmails = (data, fromAddress, adminRecipients) => {
  const recipient = data.user_email || data.email;
  const name = data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim();
  const organization = data.organization;
  const score = Number(data.score);
  const maxScore = Number(data.max_score);
  const riskCategory = data.risk_category || "Not calculated";
  const sendCustomerCopy = data.sendCustomerCopy !== false;

  if (!recipient || !organization || !Number.isFinite(score) || !Number.isFinite(maxScore)) {
    throw new TypeError("Missing required assessment fields");
  }

  const percentage = Math.round((score / maxScore) * 100);
  const safeName = escapeHtml(name || "there");
  const safeOrganization = escapeHtml(organization);
  const safeRecipient = escapeHtml(recipient);
  const safeRiskCategory = escapeHtml(riskCategory);
  const summary = escapeHtml(data.assessment_summary || "No assessment summary was provided.");
  const actions = escapeHtml(data.risk_actions || "No priority actions were provided.");

  return {
    user: sendCustomerCopy
      ? {
          from: fromAddress,
          to: [recipient],
          subject: "Your DataSolved Cybersecurity Assessment Results",
          html: `
            <div style="max-width:600px;margin:auto;padding:30px;background:#f7f9fc;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
              <h2 style="color:#0078d4">Your cybersecurity assessment results</h2>
              <p>Hi ${safeName},</p>
              <p><strong>Organization:</strong> ${safeOrganization}<br><strong>Score:</strong> ${score}/${maxScore} (${percentage}%)<br><strong>Risk category:</strong> ${safeRiskCategory}</p>
              <p>Your full results and priority actions remain available on the completed assessment page.</p>
              <p><a href="https://datasolved.com/meet" style="display:inline-block;background:#0078d4;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px">Schedule a cybersecurity consultation</a></p>
              <p style="font-size:12px;color:#6b7280">DataSolved Consulting Group</p>
            </div>`,
        }
      : null,
    admin: {
      from: fromAddress,
      to: adminRecipients,
      reply_to: recipient,
      subject: `New Cybersecurity Assessment: ${riskCategory}`,
      html: `
        <div style="max-width:700px;margin:auto;padding:30px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
          <h2 style="color:#0078d4">New cybersecurity assessment</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Organization:</strong> ${safeOrganization}</p>
          <p><strong>Email:</strong> ${safeRecipient}</p>
          <p><strong>Score:</strong> ${score}/${maxScore} (${percentage}%)</p>
          <p><strong>Risk category:</strong> ${safeRiskCategory}</p>
          <h3>Assessment summary</h3><pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${summary}</pre>
          <h3>Priority actions</h3><pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${actions}</pre>
        </div>`,
    },
  };
};

const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return jsonResponse(204, {});
  if (event.httpMethod === "GET") {
    return jsonResponse(200, {
      success: true,
      configured: Boolean(process.env.RESEND_API_KEY),
      service: "datasolved-assessment-email",
    });
  }
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { success: false, error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return jsonResponse(503, { success: false, error: "Email service is not configured" });

    const data = JSON.parse(event.body || "{}");
    const fromAddress = process.env.EMAIL_FROM || "DataSolved <hello@datasolved.com>";
    const adminRecipients = parseAdminRecipients();
    const emails = data.assessmentType === "cybersecurity"
      ? buildCybersecurityEmails(data, fromAddress, adminRecipients)
      : buildReadinessEmails(data, fromAddress, adminRecipients);
    const [userResult, adminResult] = await Promise.allSettled([
      emails.user ? sendResendEmail(apiKey, emails.user) : Promise.resolve({ skipped: true }),
      sendResendEmail(apiKey, emails.admin),
    ]);

    const userSent = userResult.status === "fulfilled";
    const adminSent = adminResult.status === "fulfilled";
    const errors = [
      userResult.status === "rejected" ? `Customer email: ${userResult.reason.message}` : null,
      adminResult.status === "rejected" ? `Internal email: ${adminResult.reason.message}` : null,
    ].filter(Boolean);

    return jsonResponse(userSent && adminSent ? 200 : 502, {
      success: userSent && adminSent,
      userSent,
      adminSent,
      error: errors.join(" | ") || null,
    });
  } catch (error) {
    const statusCode = error instanceof TypeError ? 400 : 500;
    console.error("Assessment email failed", error);
    return jsonResponse(statusCode, {
      success: false,
      userSent: false,
      adminSent: false,
      error: error.message,
    });
  }
};

module.exports = { handler, buildReadinessEmails, buildCybersecurityEmails };
