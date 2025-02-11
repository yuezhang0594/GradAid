import React from 'react';

const FeatureCard = ({ title, description }) => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h4 className="text-xl font-medium text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>
);

const LandingPage = ({ onGetStarted }) => {
  const features = [
    {
      title: "Application Strategy",
      description: "Get personalized advice on school selection and application strategy"
    },
    {
      title: "Essay Review",
      description: "Receive feedback on your statement of purpose and other essays"
    },
    {
      title: "24/7 Support",
      description: "Get instant answers to your application questions anytime"
    }
  ];

  return (
    <div className="text-center space-y-8">
      <h2 className="text-4xl font-bold text-gray-900">
        Welcome to GradAid
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Your AI-Powered Graduate Application Assistant. Get personalized guidance
        for your graduate school applications, 24/7.
      </p>
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800">Key Features</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
      <div>
        <button
          onClick={onGetStarted}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
