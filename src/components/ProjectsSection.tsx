
import React from 'react';
import { motion } from 'framer-motion';

const ProjectsSection = () => {
  const projects = [
    {
      id: 1,
      title: "E-commerce Mobile App",
      subtitle: "Redesigning the shopping experience",
      description: "A complete mobile app redesign focusing on user journey optimization and conversion improvement.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
      tags: ["Mobile Design", "UX Research", "Prototyping"],
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      title: "SaaS Dashboard",
      subtitle: "Data visualization and analytics",
      description: "Designing an intuitive dashboard for complex data analysis with focus on usability and clarity.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      tags: ["Dashboard Design", "Data Viz", "B2B"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 3,
      title: "Healthcare Platform",
      subtitle: "Connecting patients and doctors",
      description: "A comprehensive telemedicine platform designed to improve accessibility and patient outcomes.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
      tags: ["Healthcare", "Accessibility", "Web App"],
      color: "from-green-500 to-teal-500"
    }
  ];

  return (
    <section id="work" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Selected Work
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mb-6"></div>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Crafting digital experiences that solve real problems and delight users
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-purple-400 text-sm font-medium mb-3">
                    {project.subtitle}
                  </p>
                  <p className="text-slate-400 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="px-8 py-3 border border-purple-500 text-purple-400 rounded-full hover:bg-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105">
            View All Projects
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
