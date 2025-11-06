'use client';

import { motion } from 'framer-motion';
import { ChatMessage } from '@/lib/types/chat';
import ServiceResultCard from './ServiceResultCard';

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
}

export default function MessageBubble({ message, index }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ 
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'assistant' && <AssistantAvatar />}
      <div className={`flex-1 max-w-[78%] ${message.role === 'user' ? 'order-first' : ''}`}>
        <MessageContent message={message} />
      </div>
      {message.role === 'user' && <UserAvatar />}
    </motion.div>
  );
}

function AssistantAvatar() {
  return (
    <motion.div 
      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative overflow-hidden"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: 'linear-gradient(135deg, #FF4D00 0%, #FF6B35 100%)',
        boxShadow: '0 4px 20px rgba(255, 77, 0, 0.4), 0 0 0 1px rgba(255, 77, 0, 0.2)',
      }}
    >
      <img 
        src="/logosvg.svg" 
        alt="r1x logo" 
        className="w-7 h-7 relative z-10"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(255, 77, 0, 0.4)',
            '0 0 0 10px rgba(255, 77, 0, 0)',
            '0 0 0 0 rgba(255, 77, 0, 0)',
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </motion.div>
  );
}

function UserAvatar() {
  return (
    <motion.div 
      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      }}
    >
      <span className="text-white text-sm font-medium relative z-10" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>U</span>
    </motion.div>
  );
}

function MessageContent({ message }: { message: ChatMessage }) {
  return (
    <>
      <motion.div
        className={`rounded-2xl px-6 py-4.5 ${
          message.role === 'user'
            ? 'bg-gradient-to-br from-[#FF4D00] via-[#FF5A1A] to-[#FF6B35] text-white ml-auto'
            : 'bg-[#111111] text-[#E5E5E5] border border-[#1A1A1A] backdrop-blur-sm'
        }`}
        style={{
          fontFamily: message.role === 'assistant' ? 'TWKEverettMono-Regular, monospace' : 'TWKEverett-Regular, sans-serif',
          boxShadow: message.role === 'user' 
            ? '0 12px 40px rgba(255, 77, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03)',
          fontSize: message.role === 'assistant' ? '14px' : '15px',
          lineHeight: '1.6',
          letterSpacing: message.role === 'assistant' ? '-0.2px' : '0',
        }}
      >
        <div className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
        {message.status === 'sending' && <LoadingDots />}
        {message.status === 'error' && <ErrorMessage />}
      </motion.div>
      {message.serviceResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2"
        >
          <ServiceResultCard
            service={message.serviceResult.service}
            result={message.serviceResult.result}
            paymentReceipt={message.serviceResult.paymentReceipt}
            contentType={message.serviceResult.contentType}
          />
        </motion.div>
      )}
    </>
  );
}

function LoadingDots() {
  return (
    <motion.div 
      className="mt-4 flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-white/80 rounded-full"
          animate={{
            y: [0, -10, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}

function ErrorMessage() {
  return (
    <motion.div 
      className="mt-4 text-xs text-red-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
    >
      Error: Failed to send message
    </motion.div>
  );
}

