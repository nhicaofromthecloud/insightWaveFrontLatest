import { motion } from 'framer-motion';
import Link from 'next/link';

import { MessageIcon, VercelIcon } from '@/components/icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="mx-auto max-w-3xl md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex max-w-xl flex-col gap-8 rounded-xl p-6 text-center leading-relaxed">
        <p className="flex flex-row items-center justify-center gap-4">
          <VercelIcon size={32} />
          <span>+</span>
          <MessageIcon size={32} />
        </p>
        <p>
          This is an <code className="rounded-md bg-muted px-1 py-0.5">AI</code>
          -powered chat interface for analyzing customer reviews. Get insights
          into sentiment, identify trends, and extract valuable feedback to
          improve your business.
        </p>
        <p>
          Start chatting to explore your review data - the{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">AI</code> will help
          uncover patterns and provide actionable insights.
        </p>
      </div>
    </motion.div>
  );
};
