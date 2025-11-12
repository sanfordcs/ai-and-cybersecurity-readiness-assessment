import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiPhone, FiUsers, FiCheck } = FiIcons;

const FinalContact = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companySize: '',
    phone: '',
    agreedToReceiveReport: false
  });
  const [errors, setErrors] = useState({});

  const companySizes = [
    '2-9 employees',
    '10-24 employees',
    '25-49 employees',
    '50-99 employees',
    '100-200 employees',
    '200+ employees'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.companySize) {
      newErrors.companySize = 'Company size is required';
    }
    if (!formData.agreedToReceiveReport) {
      newErrors.agreedToReceiveReport = 'You must agree to receive your report';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiCheck} className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#2B2B2B' }}>
              Almost Done!
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Complete your information to receive your personalized readiness report.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="First Name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Last Name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size *
              </label>
              <div className="relative">
                <SafeIcon icon={FiUsers} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${errors.companySize ? 'border-red-300' : 'border-gray-300'}`}
                >
                  <option value="">Select company size</option>
                  {companySizes.map((size, index) => (
                    <option key={index} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              {errors.companySize && (
                <p className="mt-1 text-sm text-red-600">{errors.companySize}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <SafeIcon icon={FiPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="agreedToReceiveReport"
                name="agreedToReceiveReport"
                checked={formData.agreedToReceiveReport}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreedToReceiveReport" className="text-sm text-gray-700 leading-relaxed">
                I agree to receive my report by email and occasional updates from DataSolved. I can opt out anytime. *
              </label>
            </div>
            {errors.agreedToReceiveReport && (
              <p className="text-sm text-red-600">{errors.agreedToReceiveReport}</p>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
            >
              Generate My Readiness Report
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default FinalContact;