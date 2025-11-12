import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { sendReadinessReport, testEmailConfiguration, testAPIConnectivity } from '../lib/emailService';

const {
  FiAward,
  FiExternalLink,
  FiFileText,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiTrendingUp,
  FiShield,
  FiUsers,
  FiTarget,
  FiBug,
  FiSettings
} = FiIcons;

const Results = ({ data, contactData, onGeneratePDF }) => {
  const [emailStatus, setEmailStatus] = useState('idle');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [testResults, setTestResults] = useState(null);

  const { percentage, levelName, description, recommendations, sectionScores } = data;

  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${type.toUpperCase()}] ${timestamp}: ${message}`);
  };

  const CircularProgress = ({ percentage }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0078D4" />
              <stop offset="100%" stopColor="#38B6FF" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="text-4xl font-bold"
              style={{ color: '#2B2B2B' }}
            >
              {percentage}%
            </motion.div>
            <div className="text-sm text-gray-600 font-medium">Readiness Score</div>
          </div>
        </div>
      </div>
    );
  };

  const SectionScoreBar = ({ title, score, icon }) => {
    const percentage = Math.round((score / 16) * 100);
    const getStatusColor = (percentage) => {
      if (percentage < 50) return 'bg-red-500';
      if (percentage < 75) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <SafeIcon icon={icon} className="w-4 h-4 mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </div>
          <span className="text-sm font-bold" style={{ color: '#0078D4' }}>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getStatusColor(percentage)}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>
    );
  };

  const handleDownloadPDF = async () => {
    console.log('📄 PDF download requested');
    setIsGeneratingPDF(true);
    try {
      await onGeneratePDF();
      console.log('✅ PDF generated successfully');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again or contact support.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleResendEmail = async () => {
    console.log('🔄 Email resend requested');
    setEmailStatus('sending');
    setDebugLogs([]);
    addDebugLog('Starting email resend process', 'info');

    const emailData = {
      organization: contactData.companyName,
      user_email: contactData.email,
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      score: data.score,
      max_score: data.max_score,
      percentage: data.percentage,
      risk_category: data.risk_category,
      recommendations: data.recommendations,
      levelName: data.levelName,
      level: data.level,
      description: data.description,
      surveyData: data.surveyData,
      sectionScores: data.sectionScores,
      phone: contactData.phone,
      companySize: contactData.companySize
    };

    addDebugLog(`Email data prepared for: ${emailData.user_email}`, 'info');
    addDebugLog(`Organization: ${emailData.organization}`, 'info');
    addDebugLog(`Score: ${emailData.score}/${emailData.max_score}`, 'info');

    try {
      const results = await sendReadinessReport(emailData);
      addDebugLog(`EmailIt API returned: ${JSON.stringify(results)}`, 'info');

      if (results.userSent) {
        setEmailStatus('success');
        addDebugLog('[SUCCESS] User email sent', 'success');
      } else {
        setEmailStatus('failure');
        addDebugLog(`[ERROR] User email failed: ${results.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error resending email:', error);
      addDebugLog(`Exception caught: ${error.message}`, 'error');
      setEmailStatus('failure');
    }
  };

  const handleTestEmail = async () => {
    addDebugLog('Starting EmailIt API configuration test', 'info');
    setTestResults({ testing: true });

    try {
      addDebugLog('Testing EmailIt API connectivity...', 'info');
      const connectivityAvailable = await testAPIConnectivity();
      addDebugLog(
        `EmailIt API connectivity: ${connectivityAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}`,
        connectivityAvailable ? 'success' : 'error'
      );

      addDebugLog('Testing EmailIt API configuration...', 'info');
      const configResult = await testEmailConfiguration();
      addDebugLog(
        `Configuration: ${configResult.success ? 'VALID' : 'INVALID'}`,
        configResult.success ? 'success' : 'error'
      );

      if (!configResult.success) {
        addDebugLog(`Configuration error: ${configResult.error}`, 'error');
      }

      setTestResults({
        testing: false,
        connectivityAvailable,
        configValid: configResult.success,
        error: configResult.error,
        timestamp: new Date().toISOString()
      });

      addDebugLog('EmailIt API test completed', 'info');
    } catch (error) {
      addDebugLog(`EmailIt API test failed: ${error.message}`, 'error');
      setTestResults({
        testing: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  const getBusinessInsights = () => {
    const insights = [];

    if (sectionScores) {
      if (sectionScores.section_0 < 8) {
        insights.push({
          icon: FiTarget,
          title: 'Leadership Engagement Needed',
          description: 'Your organization requires stronger executive involvement to drive successful AI transformation.',
          priority: 'high'
        });
      }

      if (sectionScores.section_1 < 8) {
        insights.push({
          icon: FiFileText,
          title: 'Data Infrastructure Priority',
          description: 'Consolidate data systems and establish governance to enable effective AI initiatives.',
          priority: 'high'
        });
      }

      if (sectionScores.section_2 < 8) {
        insights.push({
          icon: FiShield,
          title: 'Security Foundation Critical',
          description: 'Address cybersecurity gaps before implementing AI solutions to protect business assets.',
          priority: 'high'
        });
      }

      if (sectionScores.section_4 < 8) {
        insights.push({
          icon: FiUsers,
          title: 'Workforce Transformation',
          description: 'Invest in change management and training to build employee confidence in new technologies.',
          priority: 'medium'
        });
      }
    }

    return insights.slice(0, 3);
  };

  const businessInsights = getBusinessInsights();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Debug Mode Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="bg-gray-800 text-white p-3 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
            title="Toggle Debug Mode"
          >
            <SafeIcon icon={FiBug} className="w-5 h-5" />
          </button>
        </div>

        {/* Debug Panel */}
        {debugMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-bold">📧 EmailIt API Debug Console</h3>
                <button
                  onClick={() => setDebugMode(false)}
                  className="text-white hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Test Controls */}
                <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold mb-3">EmailIt API Configuration Test</h4>
                  <div className="flex gap-3">
                    <button
                      onClick={handleTestEmail}
                      disabled={testResults?.testing}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {testResults?.testing ? 'Testing...' : 'Run Configuration Test'}
                    </button>
                    <button
                      onClick={handleResendEmail}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Test Send Email
                    </button>
                    <button
                      onClick={() => setDebugLogs([])}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Clear Logs
                    </button>
                  </div>

                  {testResults && !testResults.testing && (
                    <div className="mt-4 p-3 bg-white rounded border">
                      <h5 className="font-semibold mb-2">Test Results:</h5>
                      <div className="text-sm space-y-1">
                        <div>
                          EmailIt API Connectivity:{' '}
                          <span className={testResults.connectivityAvailable ? 'text-green-600' : 'text-red-600'}>
                            {testResults.connectivityAvailable ? '✅ Available' : '❌ Unavailable'}
                          </span>
                        </div>
                        <div>
                          Configuration:{' '}
                          <span className={testResults.configValid ? 'text-green-600' : 'text-red-600'}>
                            {testResults.configValid ? '✅ Valid' : '❌ Invalid'}
                          </span>
                        </div>
                        {testResults.error && (
                          <div className="text-red-600">Error: {testResults.error}</div>
                        )}
                        <div className="text-gray-500 text-xs">
                          Tested: {testResults.timestamp}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Debug Logs */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Debug Logs</h4>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs overflow-y-auto max-h-64">
                    {debugLogs.length === 0 ? (
                      <div className="text-gray-500">
                        No logs yet. Try running a test or sending an email.
                      </div>
                    ) : (
                      debugLogs.map((log, index) => (
                        <div key={index} className="mb-1">
                          <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                          <span
                            className={
                              log.type === 'error'
                                ? 'text-red-400'
                                : log.type === 'success'
                                ? 'text-green-400'
                                : log.type === 'warning'
                                ? 'text-yellow-400'
                                : 'text-blue-400'
                            }
                          >
                            [{log.type.toUpperCase()}]
                          </span>{' '}
                          {log.message}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Configuration Info */}
                <div className="p-4 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold mb-3">📧 Using EmailIt API (Browser-Safe)</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>API Endpoint:</strong> https://api.emailit.com/v1/send
                    </div>
                    <div>
                      <strong>From:</strong> hello@datasolved.com
                    </div>
                    <div>
                      <strong>Admin Email:</strong> ssanford@datasolved.com
                    </div>
                    <div>
                      <strong>User Email:</strong> {contactData.email}
                    </div>
                    <div>
                      <strong>CC:</strong> info@centricartistry.com
                    </div>
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <strong>✅ BROWSER-COMPATIBLE:</strong> EmailIt's HTTP API works directly in the browser.
                      No backend server required!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Status Modal */}
        {emailStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
            >
              {emailStatus === 'sending' && (
                <>
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h2 className="text-xl font-bold" style={{ color: '#2B2B2B' }}>
                    Sending Report...
                  </h2>
                  <p className="text-gray-600 mt-2">Please wait a moment.</p>
                </>
              )}

              {emailStatus === 'success' && (
                <>
                  <SafeIcon icon={FiCheckCircle} className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold" style={{ color: '#2B2B2B' }}>
                    Report Sent
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Your AI and Cybersecurity Readiness Report is on the way to {contactData.email}.
                  </p>
                  <div className="mt-6 space-y-3">
                    <a
                      href="https://datasolved.com/meet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                    >
                      Book My Readiness Consult
                    </a>
                    <button
                      onClick={() => setEmailStatus('idle')}
                      className="block w-full border-2 border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}

              {emailStatus === 'failure' && (
                <>
                  <SafeIcon icon={FiAlertCircle} className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold" style={{ color: '#2B2B2B' }}>
                    Email Could Not Be Sent
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {contactData.email
                      ? 'There was an error sending the email. Please check the debug panel for details or contact support.'
                      : 'No email address provided.'}{' '}
                    If the issue persists, contact hello@datasolved.com.
                  </p>
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleResendEmail}
                      className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setEmailStatus('idle')}
                      className="block w-full border-2 border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiAward} className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#2B2B2B' }}>
            Your Readiness Assessment is Complete
          </h1>
          <p className="text-xl text-gray-600">
            Hello {contactData.firstName || 'there'}, here are your results
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Score Display */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <CircularProgress percentage={percentage} />
            <h2 className="text-2xl font-bold mt-6 mb-2" style={{ color: '#2B2B2B' }}>
              Level {data.level}: {levelName}
            </h2>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </motion.div>

          {/* Section Scores */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-bold mb-6" style={{ color: '#2B2B2B' }}>
              Performance by Category
            </h3>
            {sectionScores && (
              <div className="space-y-2">
                <SectionScoreBar
                  title="Business Strategy & AI Vision"
                  score={sectionScores.section_0 || 0}
                  icon={FiTarget}
                />
                <SectionScoreBar
                  title="Data Management & Infrastructure"
                  score={sectionScores.section_1 || 0}
                  icon={FiFileText}
                />
                <SectionScoreBar
                  title="Cybersecurity Confidence"
                  score={sectionScores.section_2 || 0}
                  icon={FiShield}
                />
                <SectionScoreBar
                  title="AI-Specific Risk & Governance"
                  score={sectionScores.section_3 || 0}
                  icon={FiShield}
                />
                <SectionScoreBar
                  title="Workforce & Change Readiness"
                  score={sectionScores.section_4 || 0}
                  icon={FiUsers}
                />
                <SectionScoreBar
                  title="Ongoing Improvement"
                  score={sectionScores.section_5 || 0}
                  icon={FiTrendingUp}
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Business Insights */}
        {businessInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-12"
          >
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#2B2B2B' }}>
              Key Business Insights
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {businessInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  className="p-6 border-2 border-gray-100 rounded-xl"
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                        insight.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}
                    >
                      <SafeIcon
                        icon={insight.icon}
                        className={`text-xl ${
                          insight.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                        }`}
                      />
                    </div>
                    <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{insight.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12"
        >
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#2B2B2B' }}>
            Strategic Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {recommendations &&
              recommendations.length > 0 &&
              recommendations.slice(0, 6).map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 + index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">{recommendation}</p>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#2B2B2B' }}>
            Ready to Take the Next Step?
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your detailed report has been generated with personalized insights and recommendations. Let us
            discuss how DataSolved can help you implement these strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="https://datasolved.com/meet"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
            >
              Book My Readiness Consult
              <SafeIcon icon={FiExternalLink} className="ml-2" />
            </motion.a>
            <motion.button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              whileHover={{ scale: isGeneratingPDF ? 1 : 1.02 }}
              whileTap={{ scale: isGeneratingPDF ? 1 : 0.98 }}
              className={`inline-flex items-center justify-center px-8 py-4 font-medium rounded-lg transition-all duration-200 ${
                isGeneratingPDF
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <SafeIcon icon={FiDownload} className="mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Download My Report'}
            </motion.button>
          </div>
          <button
            onClick={() => setEmailStatus('sending')}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 underline"
          >
            <SafeIcon icon={FiMail} className="inline mr-1" />
            Resend Report Email
          </button>
          <p className="text-sm text-gray-500 mt-6">
            DataSolved helps businesses adopt AI securely and confidently.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;