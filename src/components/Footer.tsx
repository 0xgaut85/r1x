'use client';

import { Twitter, Github, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import TelegramIcon from './icons/TelegramIcon';

export default function Footer() {
  const socialLinks = [
    { icon: <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />, href: '#' },
    { icon: <Github className="w-4 h-4 sm:w-5 sm:h-5" />, href: '#' },
    { icon: <TelegramIcon className="w-4 h-4 sm:w-5 sm:h-5" />, href: 'https://t.me/r1xbuilders' },
    { icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5" />, href: '#' },
  ];

  return (
    <footer className="border-t border-gray-200 py-8 sm:py-12 md:py-16" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="sm:col-span-2">
            <p className="text-xs sm:text-sm font-medium text-black mb-3 sm:mb-4">STAY UP TO DATE WITH R1X</p>
            <div className="flex flex-col gap-2 mb-4 sm:mb-6">
              <input type="email" placeholder="Enter your email" className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-sm transition-all duration-200 focus:outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-[#FF4D00] text-white px-4 sm:px-6 py-2 rounded text-sm transition-all duration-200 hover:opacity-90 whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </div>
            <div className="flex gap-3 sm:gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, color: '#FF4D00' }}
                  whileTap={{ scale: 0.95 }}
                  className="text-black hover:text-[#FF4D00] transition-all duration-200"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-black mb-3 sm:mb-4" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>NAVIGATION</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li><a href="/" className="text-gray-600 hover:text-[#FF4D00] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>HOME</a></li>
              <li><a href="/docs" className="text-gray-600 hover:text-[#FF4D00] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>DOCS</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-black mb-3 sm:mb-4" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>R1X UTILITIES</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li><a href="/r1x-agent" className="text-gray-600 hover:text-[#FF4D00] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>R1X AGENT</a></li>
              <li><a href="/marketplace" className="text-gray-600 hover:text-[#FF4D00] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>R1X MARKETPLACE</a></li>
              <li><a href="/r1x-plug" className="text-gray-600 hover:text-[#FF4D00] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>R1X AGENT BUILDER</a></li>
              <li><a href="/r1x-sdk" className="text-gray-600 hover:text-[#FF4D00] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>R1X SDK</a></li>
              <li><a href="/r1x-facilitator" className="text-gray-600 hover:text-[#FF4D00] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>R1X FACILITATOR</a></li>
              <li className="pt-2 mt-2 border-t border-gray-300"><a href="/user-panel" className="text-gray-600 hover:text-[#FF4D00] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>USER PANEL</a></li>
              <li><a href="/platform-panel" className="text-gray-600 hover:text-[#FF4D00] transition-colors duration-200 text-xs sm:text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>PLATFORM PANEL</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <ul className="flex flex-wrap gap-4 sm:gap-6">
                <li><a href="/privacy-policy" className="text-gray-600 hover:text-[#FF4D00] text-xs sm:text-sm transition-colors duration-200" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>PRIVACY POLICY</a></li>
                <li><a href="/terms-of-service" className="text-gray-600 hover:text-[#FF4D00] text-xs sm:text-sm transition-colors duration-200" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>TERMS OF SERVICE</a></li>
                <li><a href="/legal" className="text-gray-600 hover:text-[#FF4D00] text-xs sm:text-sm transition-colors duration-200" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>LEGAL</a></li>
              </ul>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>©2025 R1X. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

