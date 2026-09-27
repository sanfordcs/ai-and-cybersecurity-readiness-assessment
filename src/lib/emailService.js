/**
 * Email Service - Netlify Serverless Function Integration
 * 
 * This service sends emails via a Netlify serverless function
 * that sends through Resend. No provider credentials are exposed to the browser.
 */

export const sendReadinessReport = async (data) => {
  console.log('🚀 Starting email send process via Netlify function');
  console.log('📍 Using endpoint: /.netlify/functions/sendEmail');

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
      body: JSON.stringify(data)
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
      error: error.message
    };
  }
};

export const testEmailConfiguration = async () => {
  console.log('🧪 Checking Netlify email function configuration...');
  try {
    const response = await fetch('/.netlify/functions/sendEmail', {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    console.log('📊 Test Response Status:', response.status);
    
    const result = await response.json();
    console.log('📊 Test Response Body:', result);

    if (response.ok && result.success) {
      console.log('✅ [SUCCESS] Email function is available');
      return {
        success: true,
        message: 'Email function is available',
        data: result
      };
    } else {
      console.error('❌ [ERROR] Email function is unavailable:', result.error);
      return {
        success: false,
        error: result.error || 'Email function test failed'
      };
    }
  } catch (error) {
    console.error('❌ Email function test failed:', error);
    console.error('❌ Error stack:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
};

export const testAPIConnectivity = async () => {
  console.log('🔍 Testing Netlify email function connectivity...');
  
  try {
    const result = await testEmailConfiguration();
    console.log(result.success ? '✅ Email function available' : '❌ Email function unavailable');
    return result.success;
  } catch (error) {
    console.error('❌ Email function connection failed:', error);
    return false;
  }
};
