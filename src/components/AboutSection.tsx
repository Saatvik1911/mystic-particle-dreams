
import React from 'react';
import { motion } from 'framer-motion';

const AboutSection = () => {
  const skills = [
    { name: "User Research", level: 95 },
    { name: "Interaction Design", level: 90 },
    { name: "Prototyping", level: 88 },
    { name: "Visual Design", level: 85 },
    { name: "Usability Testing", level: 92 },
    { name: "Design Systems", level: 87 }
  ];

  const tools = ["Figma", "Sketch", "Adobe XD", "Principle", "InVision", "Miro"];

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              About Me
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-purple-400 to-transparent mb-8"></div>
            
            <div className="space-y-6 text-slate-300 leading-relaxed">
              <p className="text-lg">
                I'm a passionate UX designer with over 6 years of experience creating 
                digital products that users love. I believe great design happens at the 
                intersection of user needs, business goals, and technical possibilities.
              </p>
              
              <p>
                My approach combines deep user research with rapid prototyping to validate 
                ideas early and often. I'm particularly interested in designing for complex 
                workflows and making data-heavy interfaces more intuitive.
              </p>
              
              <p>
                When I'm not designing, you'll find me exploring new cities, 
                experimenting with photography, or learning about emerging technologies 
                that could shape the future of digital experiences.
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Tools I Use</h3>
              <div className="flex flex-wrap gap-3">
                {tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors duration-300"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop&crop=face"
                alt="Alex Chen"
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl"></div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-6">Skills</h3>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm text-slate-300 mb-2">
                      <span>{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
