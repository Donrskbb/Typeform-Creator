import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { FormTheme } from '../types';

interface QuestionCardProps {
  question: string;
  description?: string;
  children: React.ReactNode;
  currentIndex: number;
  totalQuestions: number;
  theme: FormTheme;
  required?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  description,
  children,
  currentIndex,
  totalQuestions,
  theme,
  required,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto w-full"
    >
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className={`text-4xl font-bold ${theme.textColor} flex items-center gap-2`}>
              {question}
              {required && <AlertCircle className="w-6 h-6 text-red-400" />}
            </h2>
            {description && (
              <p className={`text-lg ${theme.accentColor}`}>{description}</p>
            )}
          </div>
          <div className="relative">
            {children}
          </div>
        </div>
        <div className={`flex items-center justify-between ${theme.accentColor}`}>
          <p>Press Enter ↵</p>
          <div className="flex items-center gap-2">
            <span>{currentIndex + 1}/{totalQuestions}</span>
            <ChevronDown className="animate-bounce" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};