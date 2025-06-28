import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Question, FormState, FormConfig, defaultThemes } from '../types';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';

const defaultQuestions: Question[] = [
  {
    id: 'name',
    type: 'text',
    question: '👋 What\'s your name?',
    placeholder: 'Type your name...',
    required: true,
  },
  {
    id: 'email',
    type: 'email',
    question: '📧 What\'s your email address?',
    placeholder: 'name@example.com',
    required: true,
  },
  {
    id: 'role',
    type: 'select',
    question: '💼 What describes your role best?',
    options: ['Developer', 'Designer', 'Product Manager', 'Marketing', 'Sales', 'Other'],
    required: true,
  },
  {
    id: 'company',
    type: 'text',
    question: '🏢 What company do you work for?',
    placeholder: 'Your company name...',
  },
  {
    id: 'experience',
    type: 'select',
    question: '⭐ How many years of experience do you have?',
    options: ['0-1 years', '2-5 years', '6-10 years', '10+ years'],
  },
  // {
  //   id: 'message',
  //   type: 'multiline',
  //   question: '💭 What\'s on your mind?',
  //   placeholder: 'Share your thoughts, feedback, or questions...',
  // },
];

export const FormView: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formState, setFormState] = useState<FormState>({});
  const [inputValue, setInputValue] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('formConfig');
    if (savedConfig) {
      try {
        setFormConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse form config:', error);
        setDefaultConfig();
      }
    } else {
      setDefaultConfig();
    }
  }, []);

  const setDefaultConfig = () => {
    const defaultConfig: FormConfig = {
      id: 'default',
      title: 'Contact Form',
      description: "We'd love to hear from you!",
      questions: defaultQuestions,
      theme: defaultThemes[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFormConfig(defaultConfig);
    localStorage.setItem('formConfig', JSON.stringify(defaultConfig)); // Ensure localStorage is set
  };

  const handleNext = useCallback(async (value: string) => {
    if (!formConfig) return;

    const currentQ = formConfig.questions[currentQuestion];
    if (currentQ.required && !value.trim()) {
      alert('This field is required');
      return;
    }

    const newFormState = { ...formState, [currentQ.id]: value };
    setFormState(newFormState);
    setInputValue(''); // reset input field

    if (currentQuestion < formConfig.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        const response = await fetch('http://localhost:3001/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFormState),
        });

        const result = await response.json();
        setSubmissionResult(result);
        setIsCompleted(true);
        // localStorage.removeItem('formConfig'); // Removed to keep admin-edited questions in sync
      } catch (error) {
        console.error('Submission error:', error);
        setSubmissionResult({
          success: false,
          error: 'Failed to submit form. Please try again.',
        });
        setIsCompleted(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [currentQuestion, formState, formConfig]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      e.preventDefault();
      handleNext(inputValue);
    }
  }, [handleNext, inputValue, isSubmitting]);

  const handleRetry = () => {
    setCurrentQuestion(0);
    setFormState({});
    setIsCompleted(false);
    setSubmissionResult(null);
    setInputValue('');
  };

  if (!formConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  const progress = (currentQuestion / formConfig.questions.length) * 100;
  const theme = formConfig.theme;

  if (isSubmitting) {
    return (
      <div className={`min-h-screen ${theme.background} flex items-center justify-center p-6`}>
        <div className={`text-center ${theme.textColor} space-y-6`}>
          <div className={`w-16 h-16 mx-auto border-4 ${theme.borderColor} border-t-white rounded-full animate-spin`}></div>
          <h1 className="text-4xl font-bold">Submitting...</h1>
          <p className={`text-xl ${theme.accentColor}`}>Please wait while we process your response.</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className={`min-h-screen ${theme.background} flex items-center justify-center p-6`}>
        <div className={`text-center ${theme.textColor} space-y-6 max-w-2xl`}>
          {submissionResult?.success ? (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-400" />
              <h1 className="text-4xl font-bold">Thank you!</h1>
              <p className={`text-xl ${theme.accentColor}`}>Your response has been successfully recorded.</p>
              {submissionResult.destinations && (
                <div className={`${theme.cardBackground} rounded-lg p-6 text-left`}>
                  <h3 className="text-lg font-semibold mb-4">Submission Status:</h3>
                  <div className="space-y-2">
                    {Object.entries(submissionResult.destinations as Record<string, { success: boolean }>).map(
                      ([dest, status]) => (
                        <div key={dest} className="flex items-center justify-between">
                          <span className="capitalize">{dest}:</span>
                          <span className={status.success ? 'text-green-400' : 'text-red-400'}>
                            {status.success ? '✓ Success' : '✗ Failed'}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <AlertCircle className="w-16 h-16 mx-auto text-red-400" />
              <h1 className="text-4xl font-bold">Oops!</h1>
              <p className={`text-xl ${theme.accentColor}`}>
                {submissionResult?.error || 'Something went wrong. Please try again.'}
              </p>
              <button
                onClick={handleRetry}
                className={`px-6 py-3 ${theme.buttonStyle} rounded-lg transition-colors`}
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const currentQ = formConfig.questions[currentQuestion];

  return (
    <div className={`min-h-screen ${theme.background} flex items-center justify-center p-6`}>
      <ProgressBar progress={progress} theme={theme} />

      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQ.id}
          question={currentQ.question}
          description={currentQ.description}
          currentIndex={currentQuestion}
          totalQuestions={formConfig.questions.length}
          theme={theme}
          required={currentQ.required}
        >
          {currentQ.type === 'select' ? (
            <div className="grid gap-3">
              {currentQ.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => handleNext(option)}
                  className={`w-full text-left px-6 py-4 rounded-lg ${theme.buttonStyle} 
                             ${theme.textColor} transition-all duration-200 hover:scale-105`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : currentQ.type === 'multiline' ? (
            <textarea
              placeholder={currentQ.placeholder}
              className={`w-full bg-transparent border-2 ${theme.borderColor} rounded-lg px-4 py-4 text-xl 
                         ${theme.textColor} placeholder-opacity-50 focus:border-white focus:outline-none
                         transition-colors duration-200 min-h-[120px] resize-none`}
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleNext(inputValue);
                }
                // Shift+Enter inserts newline by default
              }}
            />
          ) : (
            <input
              type={currentQ.type}
              placeholder={currentQ.placeholder}
              className={`w-full bg-transparent border-b-2 ${theme.borderColor} px-2 py-4 text-2xl 
                         ${theme.textColor} placeholder-opacity-50 focus:border-white focus:outline-none
                         transition-colors duration-200`}
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          )}
        </QuestionCard>
      </AnimatePresence>
    </div>
  );
};
