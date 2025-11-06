'use client';

import { StaggerChildren, StaggerChild } from './motion';
import { Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TelegramIcon from './icons/TelegramIcon';

const careers = [
  {
    icon: <Briefcase className="w-6 h-6" />,
    number: '[01]',
    title: 'EXPLORE OPEN OPPORTUNITIES',
    description: 'See the roles we\'re looking to fill or send us your resume if you\'d like to be considered for a future position.',
    link: '/careers',
    linkText: 'See Current Positions',
    imageOrder: 'order-1 md:order-2',
    contentOrder: 'order-2 md:order-1',
  },
  {
    icon: <TelegramIcon className="w-6 h-6" />,
    number: '[02]',
    title: 'JOIN THE CONVERSATION',
    description: 'Be the first to know what we\'ve been up to and how we can help unleash the potential in your high-value data.',
    link: 'https://t.me/r1xbuilders',
    linkText: 'Join Telegram',
    imageOrder: 'order-1 md:order-1',
    contentOrder: 'order-2 md:order-2',
  },
];

export default function CareersSection() {
  return (
    <section style={{ backgroundColor: '#F7F7F7', paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <div className="space-y-12 sm:space-y-16">
          {careers.map((career, index) => (
            <StaggerChildren key={index} className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-start">
              <StaggerChild className={`flex-1 ${career.contentOrder}`}>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="text-[#FF4D00]">{career.icon}</div>
                  <h3 className="text-black text-xl sm:text-2xl md:text-[24px]" style={{
                fontWeight: 400,
                fontFamily: 'TWKEverettMono-Regular, monospace',
                lineHeight: '1.4',
                letterSpacing: '-0.96px',
                color: 'rgb(0, 0, 0)'
              }}>
                    {career.title} <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}>{career.number}</span>
              </h3>
          </div>
              <p className="text-gray-700 mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg" style={{
                fontWeight: 400,
                fontFamily: 'BaselGrotesk-Regular, sans-serif',
                lineHeight: '1.4',
                color: 'rgb(0, 0, 0)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
                }}>{career.description}</p>
                <motion.a
                  href={career.link}
                  whileHover={{ x: 5 }}
                  className="text-sm md:text-[14px] font-normal hover:text-[#FF4D00] transition-colors link-hover flex items-center gap-2"
                  style={{
                fontFamily: 'TWKEverettMono-Regular, monospace',
                color: 'rgb(0, 0, 0)',
                textTransform: 'uppercase',
                letterSpacing: '-0.56px',
                textDecoration: 'underline'
                  }}
                >
                  {career.linkText}
                  <ArrowRight className="w-4 h-4" />
                </motion.a>
              </StaggerChild>
              <StaggerChild className={`w-full h-64 sm:h-80 bg-gray-100 ${career.imageOrder}`} style={{ borderRadius: '0px' }} />
            </StaggerChildren>
          ))}
        </div>
      </div>
    </section>
  );
}

