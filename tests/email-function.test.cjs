const assert = require('node:assert/strict');
const test = require('node:test');

const functionPath = '../.test-build/sendEmail.cjs';

const loadHandler = () => {
  delete require.cache[require.resolve(functionPath)];
  return require(functionPath).handler;
};

test('accepts a valid zero score and sends both readiness emails', async () => {
  process.env.RESEND_API_KEY = 'test-key';
  const requests = [];
  global.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return { ok: true, status: 200, text: async () => JSON.stringify({ id: 'email-id' }) };
  };

  const response = await loadHandler()({
    httpMethod: 'POST',
    body: JSON.stringify({
      assessmentType: 'ai-readiness',
      organization: 'DataSolved',
      user_email: 'test@example.com',
      firstName: 'Website',
      lastName: 'Test',
      score: 0,
      max_score: 96,
      percentage: 0,
      levelName: 'Emerging',
    }),
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), {
    success: true,
    userSent: true,
    adminSent: true,
    error: null,
  });
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[1].to, ['ssanford@datasolved.com', 'sales@datasolved.com']);
});

test('supports cybersecurity reports without Supabase or EmailJS', async () => {
  process.env.RESEND_API_KEY = 'test-key';
  const requests = [];
  global.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return { ok: true, status: 200, text: async () => JSON.stringify({ id: 'email-id' }) };
  };

  const response = await loadHandler()({
    httpMethod: 'POST',
    body: JSON.stringify({
      assessmentType: 'cybersecurity',
      organization: 'DataSolved',
      email: 'test@example.com',
      name: 'Website Test',
      score: 7,
      max_score: 33,
      risk_category: 'High Risk',
      assessment_summary: 'Summary',
      risk_actions: 'Actions',
      sendCustomerCopy: true,
    }),
  });

  assert.equal(response.statusCode, 200);
  assert.equal(requests.length, 2);
  assert.match(requests[1].subject, /Cybersecurity Assessment/);
});

test('health check does not send email', async () => {
  process.env.RESEND_API_KEY = 'test-key';
  let fetchCalled = false;
  global.fetch = async () => {
    fetchCalled = true;
    throw new Error('fetch should not be called');
  };

  const response = await loadHandler()({ httpMethod: 'GET' });
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).configured, true);
  assert.equal(fetchCalled, false);
});
