import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeadCapture from './components/LeadCapture';
import Survey from './components/Survey';
import FinalContact from './components/FinalContact';
import Results from './components/Results';
import { sendReadinessReport, testEmailConfiguration } from './lib/emailService';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState('lead'); // lead, survey, contact, results
  const [leadData, setLeadData] = useState({});
  const [surveyData, setSurveyData] = useState({});
  const [contactData, setContactData] = useState({});
  const [resultsData, setResultsData] = useState({});

  // Test email configuration on app load
  React.useEffect(() => {
    testEmailConfiguration().then(isValid => {
      console.log('🔧 EmailJS configuration test result:', isValid ? '✅ Valid' : '❌ Invalid');
    });
  }, []);

  const handleLeadSubmit = (data) => {
    setLeadData(data);
    setCurrentStep('survey');
  };

  const handleSurveyComplete = (data) => {
    setSurveyData(data);
    setCurrentStep('contact');
  };

  const handleContactSubmit = async (data) => {
    setContactData(data);
    const results = calculateResults(data, surveyData);
    setResultsData(results);

    const fullReportData = {
      ...leadData,
      ...data, // contactData
      ...results,
      surveyData,
      organization: leadData.companyName,
      user_email: data.email || leadData.email,
      firstName: data.firstName,
      lastName: data.lastName
    };

    console.log('📋 Full report data prepared:', {
      organization: fullReportData.organization,
      email: fullReportData.user_email,
      firstName: fullReportData.firstName,
      lastName: fullReportData.lastName,
      score: fullReportData.score
    });

    // Send emails using the EmailJS service
    await sendEmailReport(fullReportData);
    setCurrentStep('results');
  };

  const calculateResults = (contactData, surveyData) => {
    const totalQuestions = 24;
    const maxScore = 96;
    let totalScore = 0;
    const sectionScores = {};

    // Calculate scores for each section
    Object.entries(surveyData).forEach(([sectionKey, sectionAnswers]) => {
      const sectionTotal = Object.values(sectionAnswers).reduce((sum, score) => sum + parseInt(score || 0), 0);
      sectionScores[sectionKey] = sectionTotal;
      totalScore += sectionTotal;
    });

    const percentage = Math.round((totalScore / maxScore) * 100);
    let level, levelName, riskCategory, description, recommendations;

    // Dynamic recommendations based on actual survey responses
    const dynamicRecommendations = generateDynamicRecommendations(surveyData, sectionScores, percentage);

    if (percentage <= 24) {
      level = 1;
      levelName = "Emerging";
      riskCategory = "High";
      description = "Your organization is in the early stages of AI and cybersecurity readiness. Focus on foundational elements before advancing to more complex initiatives.";
    } else if (percentage <= 49) {
      level = 2;
      levelName = "Exploring";
      riskCategory = "Medium";
      description = "You've begun exploring AI and cybersecurity initiatives but need to strengthen governance and infrastructure to scale effectively.";
    } else if (percentage <= 74) {
      level = 3;
      levelName = "Advancing";
      riskCategory = "Low";
      description = "Your organization shows good progress in AI and cybersecurity readiness. Focus on optimization and scaling your existing initiatives.";
    } else {
      level = 4;
      levelName = "Leading";
      riskCategory = "Low";
      description = "Your organization demonstrates advanced AI and cybersecurity capabilities. Focus on innovation and maintaining your competitive edge.";
    }

    return { 
      totalScore, 
      percentage, 
      score: totalScore,
      max_score: maxScore,
      level, 
      levelName, 
      risk_category: riskCategory,
      description, 
      recommendations: dynamicRecommendations,
      key_risks: dynamicRecommendations.slice(0, 3),
      sectionScores
    };
  };

  const generateDynamicRecommendations = (surveyData, sectionScores, overallPercentage) => {
    const recommendations = [];
    const insights = [];

    // Analyze each section for specific recommendations
    if (sectionScores.section_0 !== undefined) {
      const leadershipScore = (sectionScores.section_0 / 16) * 100;
      if (leadershipScore < 50) {
        recommendations.push("Establish an AI steering committee with executive sponsorship to drive strategic alignment and resource allocation");
      } else if (leadershipScore >= 75) {
        recommendations.push("Leverage your strong leadership support to accelerate AI adoption across the organization");
      }
    }

    if (sectionScores.section_1 !== undefined) {
      const dataScore = (sectionScores.section_1 / 16) * 100;
      if (dataScore < 50) {
        recommendations.push("Implement a data governance framework and consolidate data systems to create a reliable foundation for AI initiatives");
      } else if (dataScore >= 75) {
        recommendations.push("Advanced your data infrastructure with real-time analytics and automated data quality controls");
      }
    }

    if (sectionScores.section_2 !== undefined) {
      const securityScore = (sectionScores.section_2 / 16) * 100;
      if (securityScore < 50) {
        recommendations.push("Prioritize cybersecurity investments including MFA, endpoint protection, and employee security awareness training");
      } else if (securityScore >= 75) {
        recommendations.push("Implement advanced threat detection and automated security response systems");
      }
    }

    if (sectionScores.section_3 !== undefined) {
      const aiRiskScore = (sectionScores.section_3 / 16) * 100;
      if (aiRiskScore < 50) {
        recommendations.push("Develop comprehensive AI usage policies and establish an AI governance framework to ensure responsible adoption");
      } else if (aiRiskScore >= 75) {
        recommendations.push("Create an AI innovation lab to explore emerging technologies and maintain competitive advantage");
      }
    }

    if (sectionScores.section_4 !== undefined) {
      const workforceScore = (sectionScores.section_4 / 16) * 100;
      if (workforceScore < 50) {
        recommendations.push("Launch a comprehensive change management program with targeted training to build employee confidence in new technologies");
      } else if (workforceScore >= 75) {
        recommendations.push("Establish an internal AI ambassador program to scale best practices and drive continuous learning");
      }
    }

    if (sectionScores.section_5 !== undefined) {
      const improvementScore = (sectionScores.section_5 / 16) * 100;
      if (improvementScore < 50) {
        recommendations.push("Implement regular assessment processes and create documented procedures for continuous improvement");
      } else if (improvementScore >= 75) {
        recommendations.push("Develop advanced analytics capabilities to measure and optimize ROI from technology investments");
      }
    }

    // Add overall strategic recommendations
    if (overallPercentage < 30) {
      recommendations.unshift("Focus on foundational cybersecurity and data management before investing in advanced AI solutions");
    } else if (overallPercentage > 70) {
      recommendations.push("Develop a strategic roadmap for AI innovation and competitive differentiation");
    }

    // Return top 6-8 unique recommendations
    return [...new Set(recommendations)].slice(0, 8);
  };

  const generatePDFReport = async (data) => {
    console.log('📄 Generating enhanced PDF for:', data);
    try {
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set fonts
      pdf.setFont('helvetica');
      
      // Title Page
      pdf.setFontSize(24);
      pdf.setTextColor(0, 120, 212); // Blue color
      pdf.text('AI & Cybersecurity', 20, 30);
      pdf.text('Readiness Report', 20, 40);
      
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
      pdf.text(`Prepared for: ${data.organization || 'Not provided'}`, 20, 65);
      
      // Executive Summary
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(0);
      pdf.text('Executive Summary', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setTextColor(60);
      const summaryText = `Your organization achieved a readiness score of ${data.percentage || 0}%, placing you in the ${data.levelName || 'Not specified'} category with a ${data.risk_category || 'Unknown'} risk profile. This assessment evaluated your capabilities across six critical dimensions of AI and cybersecurity readiness.`;
      
      const summaryLines = pdf.splitTextToSize(summaryText, 170);
      pdf.text(summaryLines, 20, 50);
      
      // Overall Score
      pdf.setFontSize(14);
      pdf.setTextColor(0, 120, 212);
      pdf.text(`Overall Score: ${data.score || 0}/${data.max_score || 100} (${data.percentage || 0}%)`, 20, 80);
      
      pdf.setFontSize(12);
      pdf.setTextColor(60);
      pdf.text('Risk Level: ' + (data.risk_category || 'Unknown'), 20, 90);
      pdf.text('Readiness Level: ' + (data.levelName || 'Not specified'), 20, 100);
      
      // Section Analysis
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(0);
      pdf.text('Section Analysis', 20, 30);
      
      const sectionNames = {
        'section_0': 'Business Strategy & AI Vision',
        'section_1': 'Data Management & Infrastructure',
        'section_2': 'Cybersecurity Confidence',
        'section_3': 'AI-Specific Risk & Governance',
        'section_4': 'Workforce & Change Readiness',
        'section_5': 'Ongoing Improvement'
      };
      
      let yPos = 50;
      pdf.setFontSize(12);
      
      if (data.sectionScores) {
        Object.entries(data.sectionScores).forEach(([sectionKey, score]) => {
          const sectionName = sectionNames[sectionKey] || sectionKey;
          const percentage = Math.round((score / 16) * 100);
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(sectionName, 20, yPos);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Score: ${percentage}% (${score}/16)`, 140, yPos);
          
          yPos += 10;
          
          // Add brief insight for each section
          if (percentage < 50) {
            pdf.setTextColor(220, 38, 38); // Red
            pdf.setFontSize(10);
            pdf.text('⚠️ Requires immediate attention', 20, yPos);
            pdf.setTextColor(60);
            pdf.setFontSize(12);
          } else if (percentage >= 75) {
            pdf.setTextColor(5, 150, 105); // Green
            pdf.setFontSize(10);
            pdf.text('✅ Strong performance', 20, yPos);
            pdf.setTextColor(60);
            pdf.setFontSize(12);
          }
          
          yPos += 15;
          
          if (yPos > 250) {
            pdf.addPage();
            yPos = 30;
          }
        });
      }
      
      // Business Insights
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(0);
      pdf.text('Key Business Insights', 20, 30);
      
      yPos = 50;
      pdf.setFontSize(12);
      pdf.setTextColor(60);
      
      // Generate insights based on data
      const insights = generatePDFInsights(data.sectionScores, data.percentage);
      insights.forEach(insight => {
        const insightLines = pdf.splitTextToSize(`• ${insight}`, 170);
        pdf.text(insightLines, 20, yPos);
        yPos += insightLines.length * 6 + 8;
        
        if (yPos > 250) {
          pdf.addPage();
          yPos = 30;
        }
      });
      
      // Recommendations
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(0);
      pdf.text('Strategic Recommendations', 20, 30);
      
      yPos = 50;
      pdf.setFontSize(12);
      pdf.setTextColor(60);
      
      if (data.recommendations && data.recommendations.length > 0) {
        data.recommendations.forEach((rec, index) => {
          const recLines = pdf.splitTextToSize(`${index + 1}. ${rec}`, 170);
          pdf.text(recLines, 20, yPos);
          yPos += recLines.length * 6 + 10;
          
          if (yPos > 250) {
            pdf.addPage();
            yPos = 30;
          }
        });
      }
      
      // Next Steps
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(0);
      pdf.text('Next Steps', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setTextColor(60);
      const nextSteps = [
        'Schedule a consultation with DataSolved experts to develop your implementation roadmap',
        'Prioritize high-impact recommendations based on your business objectives',
        'Establish metrics to track progress and measure ROI',
        'Create a timeline for implementation with clear milestones'
      ];
      
      yPos = 50;
      nextSteps.forEach(step => {
        const stepLines = pdf.splitTextToSize(`• ${step}`, 170);
        pdf.text(stepLines, 20, yPos);
        yPos += stepLines.length * 6 + 8;
      });
      
      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text('This report was generated by DataSolved AI & Cybersecurity Readiness Assessment', 20, 280);
      pdf.text('© 2024 DataSolved. All rights reserved.', 20, 285);
      
      // Save the PDF
      const fileName = `${(data.organization || 'Readiness').replace(/[^a-z0-9]/gi, '_')}_Readiness_Report.pdf`;
      pdf.save(fileName);
      
      console.log('✅ Enhanced PDF generated successfully:', fileName);
      return true;
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      throw error;
    }
  };

  const generatePDFInsights = (sectionScores, overallPercentage) => {
    const insights = [];
    
    if (!sectionScores) {
      return ['Survey data analysis was not available for detailed insights.'];
    }
    
    // Leadership insights
    if (sectionScores.section_0 < 8) {
      insights.push('Leadership engagement is critical for digital transformation success. Consider establishing an executive steering committee to drive AI initiatives.');
    } else if (sectionScores.section_0 >= 12) {
      insights.push('Your strong leadership support provides excellent foundation for AI adoption and should be leveraged to accelerate transformation.');
    }
    
    // Data insights
    if (sectionScores.section_1 < 8) {
      insights.push('Data infrastructure gaps will significantly impact AI effectiveness. Prioritize data governance and integration before scaling AI initiatives.');
    }
    
    // Security insights
    if (sectionScores.section_2 < 8) {
      insights.push('Cybersecurity vulnerabilities pose immediate risks to your business. Address fundamental security gaps before implementing AI solutions.');
    }
    
    // Overall insights
    if (overallPercentage < 30) {
      insights.push('Your organization has significant opportunity for competitive advantage by addressing these foundational gaps quickly.');
    } else if (overallPercentage > 70) {
      insights.push('Your advanced readiness position enables you to focus on innovation and maintaining competitive leadership.');
    }
    
    return insights.slice(0, 4);
  };

  const sendEmailReport = async (data) => {
    console.log('📧 Starting email report process for:', {
      organization: data.organization,
      email: data.user_email,
      score: data.score
    });

    // Validate required fields before sending
    if (!data.organization || !data.user_email || !data.firstName || !data.lastName) {
      console.error('❌ Missing required contact information:', {
        organization: !!data.organization,
        email: !!data.user_email,
        firstName: !!data.firstName,
        lastName: !!data.lastName
      });
      return;
    }

    try {
      console.log('📤 Sending emails...');
      const results = await sendReadinessReport(data);
      
      console.log('📊 Email sending results:', {
        adminSent: results.adminSent,
        userSent: results.userSent,
        error: results.error
      });
      
      if (!results.adminSent) {
        console.warn('⚠️ Admin email failed to send:', results.error);
      }
      if (!results.userSent) {
        console.error('❌ User email failed to send:', results.error);
      }
      if (results.adminSent && results.userSent) {
        console.log('🎉 Both emails sent successfully!');
      }
    } catch (error) {
      console.error('❌ Email send failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {currentStep === 'lead' && (
          <motion.div key="lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <LeadCapture onSubmit={handleLeadSubmit} />
          </motion.div>
        )}
        {currentStep === 'survey' && (
          <motion.div key="survey" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Survey onComplete={handleSurveyComplete} />
          </motion.div>
        )}
        {currentStep === 'contact' && (
          <motion.div key="contact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <FinalContact onSubmit={handleContactSubmit} />
          </motion.div>
        )}
        {currentStep === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Results 
              data={resultsData} 
              contactData={{ ...leadData, ...contactData }} 
              onGeneratePDF={() => generatePDFReport({ ...leadData, ...contactData, ...resultsData, surveyData })} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;