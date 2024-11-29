import { motion } from 'framer-motion';
import React from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function AnimatedContentWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  // Function to recursively wrap text nodes with motion.div
  const wrapTextContent = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string' || typeof node === 'number') {
      return (
        <motion.span variants={item} className="inline-block">
          {node}
        </motion.span>
      );
    }

    if (React.isValidElement(node)) {
      // Don't animate if it's a Card component or has animate-none class
      if (
        node.type?.displayName?.includes('Card') ||
        (typeof node.props.className === 'string' &&
          node.props.className.includes('animate-none'))
      ) {
        return node;
      }

      // Recursively wrap children
      const children = React.Children.map(node.props.children, wrapTextContent);
      return React.cloneElement(node, {}, children);
    }

    return node;
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="content-wrapper"
    >
      {React.Children.map(children, wrapTextContent)}
    </motion.div>
  );
}
