
import React from 'react';
import { motion } from 'framer-motion';

const ProcessSection = () => {
  const processSteps = [
    {
      number: "01",
      title: "Research & Discovery",
      description: "Understanding user needs, business goals, and market context through interviews, surveys, and competitive analysis.",
      icon: "🔍"
    },
    {
      number: "02",
      title: "Define & Ideate",
      description: "Synthesizing research insights to define problems and generate creative solutions through workshops and brainstorming.",
      icon: "💡"
    },
    {
      number: "03",
      title: "Design & Prototype",
      description: "Creating wireframes, mockups, and interactive prototypes to visualize and test design concepts.",
      icon: "🎨"
    },
    {
      number: "04",
      title: "Test & Iterate",
      description: "Validating designs with real users, gathering feedback, and refining solutions based on insights.",
      icon: "🔄"
    }
  ];

  return (
    <section id="process" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            My Process
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mb-6"></div>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            A human-centered approach to solving complex design challenges
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300 h-full">
                <div className="text-4xl mb-4">{step.icon}</div>
                
                <div className="text-purple-400 text-sm font-bold mb-2 tracking-wider">
                  {step.number}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4">
                  {step.title}
                </h3>
                
                <p className="text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connection line for desktop */}
              {index < processSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-purple-500 to-transparent transform -translate-y-1/2 z-10"></div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Ready to start your project?
            </h3>
            <p className="text-slate-300 mb-6">
              Let's work together to create something amazing that your users will love.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
              Let's Collaborate
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
