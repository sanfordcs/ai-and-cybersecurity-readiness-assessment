/**
 * Email Service - Netlify Serverless Function Integration
 * 
 * This service sends emails via a Netlify serverless function
 * that sends through Resend. No provider credentials are exposed to the browser.
 */

export const sendReadinessReport = async (data) => {
  console.log('🚀 Starting email send process via Netlify function');
  console.log('📍 Using endpoint: /.netlify/functions/sendEmail');

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30000);

  try {
    console.log('📧 Sending request to serverless function');
    console.log('📤 Request data:', {
      organization: data.organization,
      email: data.user_email,
      firstName: data.firstName,
      lastName: data.lastName,
      score: data.score
    });

    const response = await fetch('/.netlify/functions/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Status Text:', response.statusText);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Email service returned an invalid response (${response.status})`);
    }

    const result = await response.json();
    console.log('📊 Response Body:', result);

    if (response.ok && result.success) {
      console.log('✅ [SUCCESS] Emails sent successfully');
      return {
        adminSent: result.adminSent === true,
        userSent: result.userSent === true,
        error: null
      };
    } else {
      console.error('❌ [ERROR] Email send failed:', result.error);
      return {
        adminSent: result.adminSent === true,
        userSent: result.userSent === true,
        error: result.error || 'Failed to send emails'
      };
    }
  } catch (error) {
    console.error('❌ [ERROR] Email send exception:', error.message);
    console.error('❌ [ERROR] Exception stack:', error.stack);
    return {
      adminSent: false,
      userSent: false,
      error: error.name === 'AbortError'
        ? 'Email service timed out. Please try again.'
        : error.message
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};
