import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const LeadCapture = ({ onSubmit }) => {
  return (
    <div className="readiness-intro">
      <div className="readiness-intro-grid">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="readiness-intro-copy"
        >
          <p className="readiness-eyebrow">DataSolved Readiness Assessment</p>
          <h1>AI readiness.<br /><span>Security confidence.</span></h1>
          <p className="readiness-lede">See where your business is prepared to adopt AI, where security gaps could slow you down, and what to address first.</p>
          <div className="readiness-trust-list">
            <span>Confidential responses</span>
            <span>About 7 minutes</span>
            <span>Practical next steps</span>
          </div>
        </motion.section>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="readiness-intro-card"
      >
        <div>
          <div className="text-center mb-8">
            <div className="readiness-card-icon">
              <SafeIcon icon={FiIcons.FiShield} className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#2B2B2B' }}>
              Start your readiness check
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Answer 24 practical questions. You will receive your score, question responses, summary, and prioritized recommendations.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => onSubmit({})}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="assessment-button assessment-button-primary w-full"
          >
            Start Assessment
          </motion.button>
          <p className="text-center text-sm text-gray-500 mt-4">
            No contact information required to begin.
          </p>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default LeadCapture;
