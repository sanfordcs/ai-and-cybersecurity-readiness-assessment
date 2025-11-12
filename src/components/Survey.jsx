import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiBrain, FiDatabase, FiShield, FiUsers, FiFileText, FiTrendingUp, FiChevronLeft, FiChevronRight } = FiIcons;

const Survey = ({ onComplete }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});

  const sections = [
    {
      title: "Business Strategy and AI Vision",
      icon: FiBrain,
      questions: [
        {
          text: "How involved is leadership in shaping the company's approach to AI and cybersecurity?",
          options: [
            { value: 0, label: "Not involved", description: "Leadership hasn't addressed this" },
            { value: 1, label: "Aware but not active", description: "Leadership knows it exists" },
            { value: 2, label: "Occasionally involved", description: "Discussed in some meetings" },
            { value: 3, label: "Sets goals and reviews", description: "Leadership tracks progress" },
            { value: 4, label: "Core to strategy", description: "Integrated into business planning" }
          ]
        },
        {
          text: "How clearly have you defined what success with AI looks like for your business?",
          options: [
            { value: 0, label: "No clear goals", description: "Haven't defined success" },
            { value: 1, label: "General ideas", description: "Vague sense of benefits" },
            { value: 2, label: "Basic objectives", description: "Some specific targets" },
            { value: 3, label: "Clear outcomes", description: "Defined business goals" },
            { value: 4, label: "Comprehensive targets", description: "Detailed metrics and timelines" }
          ]
        },
        {
          text: "Who is accountable for driving AI initiatives and ensuring cybersecurity in your organization?",
          options: [
            { value: 0, label: "No clear ownership", description: "Responsibility is unclear" },
            { value: 1, label: "Informal ownership", description: "Ad-hoc responsibility" },
            { value: 2, label: "Single owner", description: "One person accountable" },
            { value: 3, label: "Dedicated team", description: "Small group with clear roles" },
            { value: 4, label: "Executive sponsor", description: "C-level ownership and committee" }
          ]
        },
        {
          text: "How often do leadership discussions include AI and cybersecurity planning?",
          options: [
            { value: 0, label: "Never discussed", description: "Not on the agenda" },
            { value: 1, label: "Rarely mentioned", description: "Occasional references" },
            { value: 2, label: "Sometimes included", description: "Periodic discussions" },
            { value: 3, label: "Regularly covered", description: "Standard meeting topic" },
            { value: 4, label: "Always integrated", description: "Core to every major decision" }
          ]
        }
      ]
    },
    {
      title: "Data Management and Infrastructure",
      icon: FiDatabase,
      questions: [
        {
          text: "How organized and accessible is your business data for making decisions?",
          options: [
            { value: 0, label: "Very scattered", description: "Data in many places, hard to find" },
            { value: 1, label: "Somewhat organized", description: "We know where data lives" },
            { value: 2, label: "Mostly centralized", description: "Main systems unified" },
            { value: 3, label: "Well organized", description: "Data is clean and accessible" },
            { value: 4, label: "Fully unified", description: "Single source of truth" }
          ]
        },
        {
          text: "How confident are you that your business systems work together seamlessly?",
          options: [
            { value: 0, label: "Many disconnected systems", description: "Information silos exist" },
            { value: 1, label: "Basic connections", description: "Some systems talk to each other" },
            { value: 2, label: "Partial integration", description: "Key systems connected" },
            { value: 3, label: "Well connected", description: "Most systems integrated" },
            { value: 4, label: "Fully integrated", description: "Seamless data flow" }
          ]
        },
        {
          text: "How confident are you that your company could recover critical data quickly after a major IT failure or cyberattack?",
          options: [
            { value: 0, label: "No recovery plan", description: "Haven't addressed this" },
            { value: 1, label: "Basic backups only", description: "We have backups but never tested" },
            { value: 2, label: "Tested occasionally", description: "Recovery tested periodically" },
            { value: 3, label: "Regularly tested", description: "Recovery verified frequently" },
            { value: 4, label: "Fully automated recovery", description: "Reliable, tested systems" }
          ]
        },
        {
          text: "How well do you understand who has access to your sensitive business information?",
          options: [
            { value: 0, label: "No clear visibility", description: "Access is untracked" },
            { value: 1, label: "Basic understanding", description: "We know some access levels" },
            { value: 2, label: "Documented access", description: "Most access is recorded" },
            { value: 3, label: "Well documented", description: "Comprehensive access records" },
            { value: 4, label: "Fully managed", description: "Access controlled and reviewed" }
          ]
        }
      ]
    },
    {
      title: "Cybersecurity Confidence",
      icon: FiShield,
      questions: [
        {
          text: "How confident are you that only authorized people can access your business systems?",
          options: [
            { value: 0, label: "Passwords only", description: "Basic protection" },
            { value: 1, label: "Some restrictions", description: "Sensitive areas limited" },
            { value: 2, label: "Secure logins", description: "Most systems protected" },
            { value: 3, label: "Controlled access", description: "All business systems secured" },
            { value: 4, label: "Advanced security", description: "Multiple layers of protection" }
          ]
        },
        {
          text: "How proactive are you in keeping your business systems protected against new threats?",
          options: [
            { value: 0, label: "No schedule", description: "Ad-hoc maintenance" },
            { value: 1, label: "Inconsistent", description: "Irregular updates" },
            { value: 2, label: "Basic schedule", description: "Regular maintenance" },
            { value: 3, label: "Proactive monitoring", description: "Continuous protection" },
            { value: 4, label: "Automated defense", description: "Real-time threat response" }
          ]
        },
        {
          text: "How recently have you assessed your cybersecurity risks?",
          options: [
            { value: 0, label: "Never assessed", description: "No formal evaluation" },
            { value: 1, label: "Over a year ago", description: "Outdated assessment" },
            { value: 2, label: "Within the past year", description: "Slightly dated" },
            { value: 3, label: "Within 6 months", description: "Recent evaluation" },
            { value: 4, label: "Within 3 months", description: "Current assessment" }
          ]
        },
        {
          text: "How prepared are you to respond to a cybersecurity incident?",
          options: [
            { value: 0, label: "No plan", description: "Would react in the moment" },
            { value: 1, label: "Basic plan", description: "Documented but untested" },
            { value: 2, label: "Developed plan", description: "Reviewed and understood" },
            { value: 3, label: "Tested plan", description: "Regular practice drills" },
            { value: 4, label: "Mature response", description: "Comprehensive and practiced" }
          ]
        }
      ]
    },
    {
      title: "AI-Specific Risk and Governance",
      icon: FiShield,
      questions: [
        {
          text: "How do you ensure employees use AI tools safely with your business information?",
          options: [
            { value: 0, label: "No guidance", description: "Employees use AI freely" },
            { value: 1, label: "Informal guidance", description: "Verbal warnings only" },
            { value: 2, label: "Basic rules", description: "Some restrictions in place" },
            { value: 3, label: "Clear policies", description: "Comprehensive guidelines" },
            { value: 4, label: "Strict enforcement", description: "Technical controls in place" }
          ]
        },
        {
          text: "How carefully do you evaluate AI tools before employees use them?",
          options: [
            { value: 0, label: "No review process", description: "Anyone can use any AI tool" },
            { value: 1, label: "Informal checks", description: "Basic validation" },
            { value: 2, label: "Standard review", description: "Regular evaluation process" },
            { value: 3, label: "Thorough evaluation", description: "Detailed assessment" },
            { value: 4, label: "Rigorous vetting", description: "Comprehensive validation" }
          ]
        },
        {
          text: "How well do you understand how AI is being used across your organization?",
          options: [
            { value: 0, label: "No visibility", description: "Unknown usage patterns" },
            { value: 1, label: "Limited awareness", description: "Basic tracking" },
            { value: 2, label: "Partial visibility", description: "Some departments monitored" },
            { value: 3, label: "Good visibility", description: "Most usage tracked" },
            { value: 4, label: "Full visibility", description: "Comprehensive monitoring" }
          ]
        },
        {
          text: "How well are your employees trained on using AI responsibly?",
          options: [
            { value: 0, label: "No training", description: "Employees learn on their own" },
            { value: 1, label: "Basic awareness", description: "General information shared" },
            { value: 2, label: "Formal training", description: "Structured sessions provided" },
            { value: 3, label: "Regular training", description: "Ongoing education programs" },
            { value: 4, label: "Comprehensive program", description: "Culture of responsible AI use" }
          ]
        }
      ]
    },
    {
      title: "Workforce and Change Readiness",
      icon: FiUsers,
      questions: [
        {
          text: "How ready are your employees to adopt new technology and AI tools?",
          options: [
            { value: 0, label: "Very resistant", description: "Strong opposition to change" },
            { value: 1, label: "Somewhat hesitant", description: "Cautious about new tools" },
            { value: 2, label: "Neutral", description: "Mixed reactions to change" },
            { value: 3, label: "Generally open", description: "Willing to try new things" },
            { value: 4, label: "Very enthusiastic", description: "Eager to innovate" }
          ]
        },
        {
          text: "How are your employees currently using AI tools in their daily work?",
          options: [
            { value: 0, label: "No AI usage", description: "Not using AI tools" },
            { value: 1, label: "Minimal experimentation", description: "Few individuals exploring" },
            { value: 2, label: "Department adoption", description: "Some teams using AI" },
            { value: 3, label: "Widespread use", description: "Many employees using AI" },
            { value: 4, label: "Universal adoption", description: "AI embedded in workflows" }
          ]
        },
        {
          text: "How prepared are your employees to use technology and AI tools safely and effectively?",
          options: [
            { value: 0, label: "No training provided", description: "Employees figure it out alone" },
            { value: 1, label: "Occasional tips", description: "Informal guidance only" },
            { value: 2, label: "Annual training", description: "Regular educational sessions" },
            { value: 3, label: "Role-specific training", description: "Tailored education programs" },
            { value: 4, label: "Continuous learning", description: "Ongoing skill development" }
          ]
        },
        {
          text: "How clearly does leadership communicate that technology and AI support employees rather than replace them?",
          options: [
            { value: 0, label: "No communication", description: "Silence on the topic" },
            { value: 1, label: "Rarely mentioned", description: "Occasional references" },
            { value: 2, label: "Sometimes addressed", description: "Periodic messaging" },
            { value: 3, label: "Regularly communicated", description: "Consistent messaging" },
            { value: 4, label: "Consistently reinforced", description: "Clear, frequent communication" }
          ]
        }
      ]
    },
    {
      title: "Ongoing Improvement",
      icon: FiFileText,
      questions: [
        {
          text: "How well documented are your guidelines for using AI and maintaining cybersecurity?",
          options: [
            { value: 0, label: "No documentation", description: "Guidelines don't exist" },
            { value: 1, label: "Draft documents", description: "In development phase" },
            { value: 2, label: "Basic guidelines", description: "Core rules documented" },
            { value: 3, label: "Comprehensive guides", description: "Detailed policies in place" },
            { value: 4, label: "Robust framework", description: "Complete governance system" }
          ]
        },
        {
          text: "How regularly do you review your AI and cybersecurity practices?",
          options: [
            { value: 0, label: "No reviews", description: "No formal oversight" },
            { value: 1, label: "Informal checks", description: "Casual reviews only" },
            { value: 2, label: "Periodic reviews", description: "Regular assessments" },
            { value: 3, label: "Systematic process", description: "Structured evaluation" },
            { value: 4, label: "Continuous monitoring", description: "Ongoing oversight" }
          ]
        },
        {
          text: "How clearly is responsibility assigned for data and AI oversight at the executive level?",
          options: [
            { value: 0, label: "Unclear ownership", description: "Responsibility undefined" },
            { value: 1, label: "Shared responsibility", description: "Distributed accountability" },
            { value: 2, label: "Clear owner", description: "Specific executive accountable" },
            { value: 3, label: "Dedicated focus", description: "Executive with dedicated time" },
            { value: 4, label: "Executive sponsorship", description: "C-level champion and committee" }
          ]
        },
        {
          text: "How effectively do you measure the business impact of your AI and technology investments?",
          options: [
            { value: 0, label: "No measurement", description: "Don't track ROI" },
            { value: 1, label: "Basic tracking", description: "Simple success metrics" },
            { value: 2, label: "Regular measurement", description: "Periodic performance reviews" },
            { value: 3, label: "Advanced analytics", description: "Comprehensive metrics" },
            { value: 4, label: "Sophisticated tracking", description: "Real-time optimization" }
          ]
        }
      ]
    }
  ];

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  const handleAnswerChange = (sectionIndex, questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [`section_${sectionIndex}`]: {
        ...prev[`section_${sectionIndex}`],
        [`question_${questionIndex}`]: value
      }
    }));
  };

  const isCurrentSectionComplete = () => {
    const currentSectionAnswers = answers[`section_${currentSection}`];
    if (!currentSectionAnswers) return false;
    
    return sections[currentSection].questions.every((_, index) => 
      currentSectionAnswers[`question_${index}`] !== undefined
    );
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const currentSectionData = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentSection + 1} of {sections.length}
            </span>
            <span className="text-sm font-medium" style={{ color: '#0078D4' }}>
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full rounded-full h-2" style={{ backgroundColor: '#E8EEF4' }}>
            <motion.div
              className="h-2 rounded-full"
              style={{ 
                background: 'linear-gradient(90deg, #0078D4, #38B6FF)',
                width: `${progress}%`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
        >
          {/* Section Header */}
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" 
                 style={{ background: 'linear-gradient(135deg, #0078D4, #38B6FF)' }}>
              <SafeIcon icon={currentSectionData.icon} className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#2B2B2B' }}>
                {currentSectionData.title}
              </h2>
              <p className="text-gray-600 mt-1">
                Select the option that best describes your current situation
              </p>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-10">
            {currentSectionData.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border-b border-gray-100 pb-8 last:border-b-0">
                <h3 className="text-lg font-medium mb-6" style={{ color: '#2B2B2B' }}>
                  {question.text}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {question.options.map((option) => {
                    const isSelected = answers[`section_${currentSection}`]?.[`question_${questionIndex}`] === option.value;
                    
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleAnswerChange(currentSection, questionIndex, option.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-lg border-2 text-center transition-all cursor-pointer flex flex-col justify-center items-center min-h-[8rem] ${
                          isSelected
                            ? 'border-blue-500 text-blue-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                        style={{
                          backgroundColor: isSelected ? '#F0F7FF' : '#F8FAFC'
                        }}
                      >
                        <div className="font-bold text-base mb-1 break-words">{option.label}</div>
                        <div className="text-xs leading-tight text-gray-500">{option.description}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <motion.button
              type="button"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              whileHover={{ scale: currentSection === 0 ? 1 : 1.02 }}
              whileTap={{ scale: currentSection === 0 ? 1 : 0.98 }}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                currentSection === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SafeIcon icon={FiChevronLeft} className="mr-2" />
              Previous
            </motion.button>

            <motion.button
              type="button"
              onClick={handleNext}
              disabled={!isCurrentSectionComplete()}
              whileHover={{ scale: isCurrentSectionComplete() ? 1.02 : 1 }}
              whileTap={{ scale: isCurrentSectionComplete() ? 0.98 : 1 }}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all shadow-lg ${
                isCurrentSectionComplete()
                  ? 'text-white hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              style={{
                background: isCurrentSectionComplete() 
                  ? 'linear-gradient(135deg, #0078D4, #38B6FF)' 
                  : '#E5E7EB'
              }}
            >
              {currentSection === sections.length - 1 ? 'Complete Survey' : 'Next Section'}
              <SafeIcon icon={FiChevronRight} className="ml-2" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Survey;