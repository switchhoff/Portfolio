import { motion } from 'motion/react';
import { Mail, Github, Linkedin, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

export default function App() {
  return (
    <div className="relative min-h-screen bg-white text-black overflow-x-hidden">
      {/* Subtle background grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* About Section */}
      <Section id="about" title="ABOUT ME" number="01">
        <div className="grid md:grid-cols-[150px,1fr] gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 border-2 border-red-600 translate-x-2 translate-y-2" />
              <div className="relative bg-gray-100 aspect-square overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-700 leading-relaxed mb-3 text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                I'm a passionate developer who loves creating innovative digital experiences.
                With a strong foundation in modern web technologies and a keen eye for design,
                I transform ideas into elegant, functional solutions.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                My approach combines technical expertise with creative problem-solving,
                ensuring every project not only works flawlessly but also delivers an
                exceptional user experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-base font-bold mb-2 text-red-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                INTERESTS
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'AI & Machine Learning',
                  'Web3 & Blockchain',
                  'UI/UX Design',
                  'Cloud Computing',
                  'Open Source',
                  'Cybersecurity'
                ].map((interest, i) => (
                  <div
                    key={interest}
                    className="border border-red-600/30 p-2 hover:border-red-600 hover:bg-red-600/5 transition-all"
                  >
                    <span className="text-red-600 text-[10px] mr-1" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                      [{String(i + 1).padStart(2, '0')}]
                    </span>
                    <span className="text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                      {interest}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Experience & Education Section */}
      <Section id="experience" title="EXPERIENCE & EDUCATION" number="02">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Experience Column */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-red-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              EXPERIENCE
            </h3>
            <div className="space-y-6">
              {[
                {
                  role: 'Senior Full Stack Developer',
                  company: 'Tech Innovations Inc.',
                  period: '2023 - Present',
                  description: 'Leading development of cloud-native applications using React, Node.js, and AWS.'
                },
                {
                  role: 'Frontend Developer',
                  company: 'Digital Solutions Co.',
                  period: '2021 - 2023',
                  description: 'Developed responsive web applications and improved user engagement by 40%.'
                },
                {
                  role: 'Junior Developer',
                  company: 'StartUp Labs',
                  period: '2019 - 2021',
                  description: 'Built web applications using React and TypeScript.'
                }
              ].map((exp, i) => (
                <ExperienceCard key={i} {...exp} />
              ))}
            </div>
          </div>

          {/* Education Column */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-red-600" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              EDUCATION
            </h3>
            <div className="space-y-4">
              {[
                {
                  degree: 'Master of Computer Science',
                  school: 'Tech University',
                  period: '2017 - 2019',
                  details: 'Specialized in AI and Machine Learning.'
                },
                {
                  degree: 'Bachelor of Software Engineering',
                  school: 'State University',
                  period: '2013 - 2017',
                  details: 'Honours program - Web Technologies and Database Systems.'
                }
              ].map((edu, i) => (
                <EducationCard key={i} {...edu} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Projects Section */}
      <Section id="projects" title="PROJECTS" number="03">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              name: 'AI Analytics Dashboard',
              tech: ['React', 'Python', 'TensorFlow'],
              description: 'Real-time data visualization with ML predictions.',
              image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop'
            },
            {
              name: 'Social Platform',
              tech: ['Next.js', 'Solidity', 'Web3'],
              description: 'Blockchain-based network with NFT integration.',
              image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop'
            },
            {
              name: 'Cloud Manager',
              tech: ['Vue.js', 'Go', 'Kubernetes'],
              description: 'Deploy and monitor containerized applications.',
              image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop'
            },
            {
              name: 'Collaboration Tool',
              tech: ['React', 'WebRTC', 'Node.js'],
              description: 'Live editing with video conferencing.',
              image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop'
            },
            {
              name: 'E-Commerce Platform',
              tech: ['React', 'Node.js', 'Stripe'],
              description: 'Full-stack shopping experience with payments.',
              image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop'
            },
            {
              name: 'Mobile Fitness App',
              tech: ['React Native', 'Firebase'],
              description: 'Track workouts and nutrition goals.',
              image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop'
            }
          ].map((project, i) => (
            <ProjectCard key={i} {...project} />
          ))}
        </div>
      </Section>

      {/* Contact Section */}
      <Section id="contact" title="CONTACT" number="04">
        <div className="max-w-2xl mx-auto">
          <motion.form
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1 text-gray-700" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                  NAME
                </label>
                <input
                  type="text"
                  className="w-full border border-red-600/30 bg-white px-3 py-2 text-sm focus:border-red-600 focus:outline-none transition-colors"
                  placeholder="Your Name"
                  style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-700" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                  CONTACT
                </label>
                <input
                  type="email"
                  className="w-full border border-red-600/30 bg-white px-3 py-2 text-sm focus:border-red-600 focus:outline-none transition-colors"
                  placeholder="your.email@example.com"
                  style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1 text-gray-700" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                SUBJECT
              </label>
              <input
                type="text"
                className="w-full border border-red-600/30 bg-white px-3 py-2 text-sm focus:border-red-600 focus:outline-none transition-colors"
                placeholder="What's this about?"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-gray-700" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                MESSAGE
              </label>
              <textarea
                rows={4}
                className="w-full border border-red-600/30 bg-white px-3 py-2 text-sm focus:border-red-600 focus:outline-none transition-colors resize-none"
                placeholder="Tell me what I can do for you..."
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              />
            </div>

            <button
              type="submit"
              className="w-full border-2 border-red-600 px-6 py-3 font-bold hover:bg-red-600 hover:text-white transition-all"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              SEND MESSAGE
            </button>
          </motion.form>

          <div className="mt-6 flex justify-center gap-6 flex-wrap">
            {[
              { icon: Mail, label: 'hello@example.com' },
              { icon: Github, label: 'github.com/username' },
              { icon: Linkedin, label: 'linkedin.com/in/username' }
            ].map((contact) => (
              <div
                key={contact.label}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <contact.icon className="w-4 h-4" />
                <span className="text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                  {contact.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

// Section Component
function Section({ id, title, number, children }: { id: string; title: string; number: string; children: React.ReactNode }) {
  return (
    <section id={id} className="relative py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <span className="text-red-600 text-2xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {number}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-red-600 to-transparent" />
          </div>
          <h2 className="text-3xl font-black tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {title}
          </h2>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

// Experience Card Component
function ExperienceCard({ role, company, period, description }: any) {
  return (
    <motion.div
      className="relative border-l-2 border-red-600/30 pl-6 hover:border-red-600 transition-all group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute -left-[5px] top-0 w-2 h-2 bg-red-600 rotate-45 group-hover:scale-125 transition-transform" />

      <div className="mb-1">
        <h3 className="text-lg font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          {role}
        </h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-red-600 text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            {company}
          </span>
          <span className="text-gray-500 text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            {period}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
        {description}
      </p>
    </motion.div>
  );
}

// Education Card Component
function EducationCard({ degree, school, period, details }: any) {
  return (
    <motion.div
      className="border border-red-600/30 p-4 hover:border-red-600 hover:bg-red-600/5 transition-all"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {degree}
          </h3>
          <p className="text-red-600 text-sm mt-1" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            {school}
          </p>
        </div>
        <span className="text-gray-500 text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
          {period}
        </span>
      </div>
      <p className="text-gray-600 text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
        {details}
      </p>
    </motion.div>
  );
}

// Project Card Component
function ProjectCard({ name, tech, description, image }: any) {
  return (
    <motion.div
      className="border border-red-600/30 hover:border-red-600 transition-all group overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-32 bg-gray-100 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2">
          <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          {name}
        </h3>

        <p className="text-gray-600 text-xs mb-3" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
          {description}
        </p>

        <div className="flex flex-wrap gap-1">
          {tech.map((t: string) => (
            <span
              key={t}
              className="text-[10px] px-2 py-1 border border-red-600/50 text-red-600"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
