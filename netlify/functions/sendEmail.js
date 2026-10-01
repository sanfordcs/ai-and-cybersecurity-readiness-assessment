const { jsPDF } = require("jspdf");

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

const buildAnswerRows = (answers) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    return '<p>No question-level answers were included.</p>';
  }

  return answers.map((item, index) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #dbe4e8;vertical-align:top;color:#60727d">${index + 1}</td>
      <td style="padding:10px;border-bottom:1px solid #dbe4e8;vertical-align:top">
        <strong>${escapeHtml(item.section || 'Assessment')}</strong><br>
        ${escapeHtml(item.question || '')}
      </td>
      <td style="padding:10px;border-bottom:1px solid #dbe4e8;vertical-align:top">
        <strong>${escapeHtml(item.answer || 'Not answered')}</strong>
        ${item.detail ? `<br><span style="color:#60727d">${escapeHtml(item.detail)}</span>` : ''}
      </td>
    </tr>`).join('');
};

const buildReadinessPdfAttachment = (data) => {
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const organization = data.organization || data.companyName || "Organization";
  const score = Number(data.score ?? data.totalScore ?? 0);
  const maxScore = Number(data.max_score || 96);
  const percentage = Number.isFinite(Number(data.percentage))
    ? Number(data.percentage)
    : Math.round((score / maxScore) * 100);
  const recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
  const answers = Array.isArray(data.answers) ? data.answers : [];
  const margin = 48;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = 54;

  const ensureSpace = (height = 28) => {
    if (y + height > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };
  const writeWrapped = (text, size = 10, gap = 6) => {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(String(text || ""), contentWidth);
    ensureSpace(lines.length * (size + 3) + gap);
    pdf.text(lines, margin, y);
    y += lines.length * (size + 3) + gap;
  };

  pdf.setTextColor(15, 31, 36);
  pdf.setFont("helvetica", "bold");
  writeWrapped("DataSolved AI & Cybersecurity Readiness Report", 20, 14);
  pdf.setFont("helvetica", "normal");
  writeWrapped(`Prepared for: ${organization}`, 11, 4);
  writeWrapped(`Score: ${score}/${maxScore} (${percentage}%)`, 11, 4);
  writeWrapped(`Readiness level: ${data.levelName || "Not specified"}`, 11, 14);

  pdf.setFont("helvetica", "bold");
  writeWrapped("Executive Summary", 14, 7);
  pdf.setFont("helvetica", "normal");
  writeWrapped(data.description || "No summary was generated.", 10, 14);

  pdf.setFont("helvetica", "bold");
  writeWrapped("Recommended Next Steps", 14, 7);
  pdf.setFont("helvetica", "normal");
  recommendations.forEach((item, index) => writeWrapped(`${index + 1}. ${item}`, 10, 6));

  ensureSpace(42);
  pdf.setFont("helvetica", "bold");
  writeWrapped("Assessment Responses", 14, 7);
  pdf.setFont("helvetica", "normal");
  answers.forEach((item, index) => {
    writeWrapped(`${index + 1}. ${item.question || "Assessment question"}`, 10, 3);
    pdf.setTextColor(35, 120, 104);
    writeWrapped(`Response: ${item.answer || "Not answered"}${item.detail ? ` - ${item.detail}` : ""}`, 9, 8);
    pdf.setTextColor(15, 31, 36);
  });

  const safeOrganization = String(organization).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "readiness";
  return {
    filename: `${safeOrganization}-AI-Readiness-Report.pdf`,
    content: Buffer.from(pdf.output("arraybuffer")).toString("base64"),
    content_type: "application/pdf",
  };
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
  const organization = data.organization || data.companyName;
  const score = Number(data.score ?? data.totalScore);
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
  const answerRows = buildAnswerRows(data.answers);
  const recommendations = Array.isArray(data.recommendations) && data.recommendations.length
    ? `<ol>${data.recommendations.map((item) => `<li style="margin-bottom:8px">${escapeHtml(item)}</li>`).join('')}</ol>`
    : '<p>No recommendations were generated.</p>';
  const summary = escapeHtml(data.description || `Readiness level: ${data.levelName || 'Not specified'}`);

  return {
    user: {
      from: fromAddress,
      to: [recipient],
      subject: "Your AI & Cybersecurity Readiness Assessment Results",
      html: `
        <div style="margin:0;padding:28px 12px;background:#0f2028;font-family:Arial,sans-serif;color:#20313a;line-height:1.55">
          <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.24)">
            <div style="padding:32px;background:#17323c;color:#f4f8fa;border-bottom:4px solid #27c3a3">
              <p style="margin:0 0 10px;color:#62ddc3;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">DataSolved Readiness Report</p>
              <h1 style="margin:0;font-size:28px;line-height:1.2">Your AI and cybersecurity readiness results</h1>
              <p style="margin:12px 0 0;color:#d7e5ea">Prepared for ${safeOrganization}</p>
            </div>
            <div style="padding:30px">
              <p style="margin-top:0">Hi ${safeName},</p>
              <p>Thank you for completing the assessment. Your detailed PDF report is attached for your records.</p>
              <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:10px 0;margin:22px -10px">
                <tr>
                  <td style="width:33%;padding:18px;background:#e9f9f5;border-radius:12px;text-align:center"><strong style="display:block;color:#167b68;font-size:24px">${percentage}%</strong><span style="font-size:12px;color:#52656e">Readiness score</span></td>
                  <td style="width:33%;padding:18px;background:#f1f5f7;border-radius:12px;text-align:center"><strong style="display:block;color:#17323c;font-size:20px">${escapeHtml(data.levelName || 'Not specified')}</strong><span style="font-size:12px;color:#52656e">Readiness level</span></td>
                  <td style="width:33%;padding:18px;background:#f1f5f7;border-radius:12px;text-align:center"><strong style="display:block;color:#17323c;font-size:20px">${score}/${maxScore}</strong><span style="font-size:12px;color:#52656e">Points</span></td>
                </tr>
              </table>
              <h2 style="margin:28px 0 8px;color:#17323c;font-size:18px">Executive summary</h2>
              <p style="margin-top:0;color:#435861">${summary}</p>
              <h2 style="margin:28px 0 8px;color:#17323c;font-size:18px">Recommended next steps</h2>
              <div style="padding:18px 22px;background:#f1f8f7;border-left:4px solid #27c3a3;border-radius:10px">${recommendations}</div>
              <h2 style="margin:28px 0 8px;color:#17323c;font-size:18px">Your responses</h2>
              <table style="width:100%;border-collapse:collapse;font-size:13px"><tbody>${answerRows}</tbody></table>
              <p style="margin:30px 0 8px"><a href="https://datasolved.com/meet" style="display:inline-block;background:#27c3a3;color:#071a20;padding:13px 22px;text-decoration:none;border-radius:9px;font-weight:700">Schedule a readiness consultation</a></p>
            </div>
            <div style="padding:18px 30px;background:#eef3f5;color:#63747c;font-size:12px">DataSolved Consulting Group · Confidential assessment report</div>
          </div>
        </div>`,
    },
    admin: {
      from: fromAddress,
      to: adminRecipients,
      reply_to: recipient,
      subject: "New AI & Cybersecurity Readiness Submission",
      html: `
        <div style="max-width:700px;margin:auto;padding:30px;background:#f3f7f8;border-top:5px solid #27c3a3;font-family:Arial,sans-serif;color:#20313a;line-height:1.6">
          <h2 style="color:#17323c">New AI readiness assessment</h2>
          <p><strong>Name:</strong> ${escapeHtml(name || "N/A")}</p>
          <p><strong>Organization:</strong> ${safeOrganization}</p>
          <p><strong>Email:</strong> ${safeRecipient}</p>
          <p><strong>Score:</strong> ${score}/${maxScore} (${percentage}%)</p>
          <p><strong>Readiness level:</strong> ${escapeHtml(data.levelName || "N/A")}</p>
          <div style="padding:16px;background:#fff;border-radius:10px"><h3 style="margin-top:0">Summary</h3><p>${summary}</p></div>
          <h3>Recommended next steps</h3><div style="padding:16px;background:#e9f9f5;border-radius:10px">${recommendations}</div>
          <h3>Question responses</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px"><tbody>${answerRows}</tbody></table>
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
    if (data.assessmentType !== "cybersecurity") {
      const reportAttachment = buildReadinessPdfAttachment(data);
      if (emails.user) emails.user.attachments = [reportAttachment];
      emails.admin.attachments = [reportAttachment];
    }
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

module.exports = { handler, buildReadinessEmails, buildCybersecurityEmails, buildReadinessPdfAttachment };
