/**
 * Email Service - Netlify Serverless Function Integration
 * 
 * This service sends emails via a Netlify serverless function
 * that uses EmailIt SMTP with Nodemailer.
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

    const result = await response.json();
    console.log('📊 Response Body:', result);

    if (response.ok && result.success) {
      console.log('✅ [SUCCESS] Emails sent successfully');
      return {
        adminSent: true,
        userSent: true,
        error: null
      };
    } else {
      console.error('❌ [ERROR] Email send failed:', result.error);
      return {
        adminSent: false,
        userSent: false,
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
  console.log('🧪 Testing Netlify email function configuration...');
  
  try {
    const testPayload = {
      organization: 'Test Organization',
      user_email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      score: 50,
      max_score: 96,
      percentage: 52,
      risk_category: 'Medium',
      level: 2,
      levelName: 'Exploring',
      description: 'Test description',
      recommendations: ['Test recommendation'],
      sectionScores: {
        section_0: 8,
        section_1: 8,
        section_2: 8,
        section_3: 8,
        section_4: 8,
        section_5: 8
      },
      phone: '555-1234',
      companySize: '10-24 employees'
    };

    console.log('📤 Sending test request to: /.netlify/functions/sendEmail');

    const response = await fetch('/.netlify/functions/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📊 Test Response Status:', response.status);
    
    const result = await response.json();
    console.log('📊 Test Response Body:', result);

    if (response.ok && result.success) {
      console.log('✅ [SUCCESS] Email function is properly configured');
      return {
        success: true,
        message: 'Email function is properly configured',
        data: result
      };
    } else {
      console.error('❌ [ERROR] Email function returned error:', result.error);
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