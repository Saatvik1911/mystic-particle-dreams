
import React from 'react';
import { motion } from 'framer-motion';

const AboutSection = () => {
  return (
    <section className="min-h-screen py-20 bg-black relative overflow-hidden">
      {/* Space background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-48 right-20 w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-60 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-80 right-16 w-1 h-1 bg-purple-200 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
        <div className="absolute top-96 left-12 w-1 h-1 bg-white rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-light text-white mb-6 tracking-tight">
            About Me
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="prose prose-lg text-slate-300 leading-relaxed space-y-6">
              <p className="text-xl text-slate-200 font-light leading-relaxed">
                I'm a passionate UX designer and product manager with over 6 years of experience 
                creating digital products that users love. I believe great design happens at the 
                intersection of user needs, business goals, and technical possibilities.
              </p>
              
              <p className="text-lg">
                My approach combines deep user research with rapid prototyping to validate 
                ideas early and often. I'm particularly interested in designing for complex 
                workflows and making data-heavy interfaces more intuitive and delightful to use.
              </p>
              
              <p className="text-lg">
                Currently, I'm focused on building products that bridge the gap between 
                artificial intelligence and human creativity, exploring how we can make 
                powerful technologies accessible to everyone.
              </p>
              
              <p className="text-lg">
                When I'm not designing, you'll find me exploring new cities, 
                experimenting with photography, or learning about emerging technologies 
                that could shape the future of digital experiences.
              </p>
            </div>

            {/* Skills section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12"
            >
              <h3 className="text-2xl font-semibold text-white mb-6">Core Skills</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "User Research",
                  "Product Strategy", 
                  "Interaction Design",
                  "Prototyping",
                  "Design Systems",
                  "Usability Testing",
                  "Data Analysis",
                  "Team Leadership",
                  "Stakeholder Management"
                ].map((skill) => (
                  <div
                    key={skill}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 text-center hover:bg-slate-700/50 transition-all duration-300"
                  >
                    <span className="text-slate-300 font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tools section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h3 className="text-2xl font-semibold text-white mb-6">Tools & Technologies</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  "Figma", "Sketch", "Adobe XD", "Principle", "InVision", "Miro", 
                  "Notion", "Amplitude", "Mixpanel", "Hotjar", "Loom", "Slack"
                ].map((tool) => (
                  <span
                    key={tool}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-slate-300 rounded-full border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Profile image and contact */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="relative">
              <div className="relative w-full max-w-sm mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face"
                  alt="Saatvik Agrawal"
                  className="w-full rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-2xl blur opacity-75"></div>
              </div>
            </div>

            {/* Quick facts */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Facts</h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="text-purple-400">6+ Years</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-purple-400">San Francisco, CA</span>
                </div>
                <div className="flex justify-between">
                  <span>Focus:</span>
                  <span className="text-purple-400">Product Design</span>
                </div>
                <div className="flex justify-between">
                  <span>Industries:</span>
                  <span className="text-purple-400">SaaS, FinTech</span>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              >
                Let's Work Together
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
