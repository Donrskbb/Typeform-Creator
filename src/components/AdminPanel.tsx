import React, { useState, useEffect } from 'react';
import {
  Settings, Database, Mail, MessageSquare, Users, ArrowLeft, RefreshCw, CheckCircle, XCircle,
  Edit3, Plus, Trash2, Eye, Palette, Save, X, Github, Moon, Sun, Sparkles
} from 'lucide-react';
import { Question, FormConfig, FormTheme, defaultThemes } from '../types';
import { apiFetch } from '../utils/api';

interface ConfigData {
  destinations: {
    discord: { enabled: boolean; configured: boolean };
    mongodb: { enabled: boolean; configured: boolean };
    email: { enabled: boolean; configured: boolean };
  };
  server: {
    port: number;
    environment: string;
  };
}

interface Submission {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  company?: string;
  experience?: string;
  message?: string;
  submittedAt: string;
}

type Tab = 'overview' | 'submissions' | 'config' | 'form-builder' | 'themes' | 'guide' | 'whatsnew';

export const AdminPanel: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminDarkMode') === 'true';
    }
    return false;
  });

  // Check authentication on mount
  useEffect(() => {
    apiFetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setAuthenticated(!!data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'form-builder') {
      loadFormConfig();
    }
  }, [activeTab]);

  // Load data after authentication
  useEffect(() => {
    if (authenticated) {
      setLoading(true);
      Promise.all([
        fetchConfig().catch((err) => {
          if (err && err.status === 401) setAuthenticated(false);
        }),
        fetchSubmissions().catch((err) => {
          if (err && err.status === 401) setAuthenticated(false);
        })
      ])
        .catch((err) => console.error('Failed to load admin data:', err))
        .finally(() => setLoading(false));
    }
  }, [authenticated]);

  const fetchConfig = async () => {
    try {
      const response = await apiFetch('/api/config', { credentials: 'include' });
      if (response.status === 401) throw { status: 401 };
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof error === 'object' && error !== null && 'status' in error && (error as any).status === 401) setAuthenticated(false);
      console.error('Failed to fetch config:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await apiFetch('/api/submissions', { credentials: 'include' });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Submissions fetch error:', response.status, errorText);
        if (response.status === 401) setAuthenticated(false);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const loadFormConfig = () => {
    const savedConfig = localStorage.getItem('formConfig');
    if (savedConfig) {
      try {
        setFormConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse form config:', error);
      }
    }
  };

  const saveFormConfig = (newConfig: FormConfig) => {
    const updatedConfig = {
      ...newConfig,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('formConfig', JSON.stringify(updatedConfig));
    setFormConfig(updatedConfig);
  };

  const addQuestion = () => {
    // Ensure formConfig is initialized
    if (!formConfig) {
      const defaultConfig: FormConfig = {
        id: 'default',
        title: 'Contact Form',
        description: "We'd love to hear from you!",
        questions: [],
        theme: defaultThemes[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFormConfig(defaultConfig);
      localStorage.setItem('formConfig', JSON.stringify(defaultConfig));
    }
    setEditingQuestion({
      id: `question_${Date.now()}`,
      type: 'text',
      question: '',
      placeholder: '',
      required: false,
    });
    setShowQuestionModal(true);
  };

  const editQuestion = (question: Question) => {
    // Ensure formConfig is initialized
    if (!formConfig) {
      const defaultConfig: FormConfig = {
        id: 'default',
        title: 'Contact Form',
        description: "We'd love to hear from you!",
        questions: [],
        theme: defaultThemes[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFormConfig(defaultConfig);
      localStorage.setItem('formConfig', JSON.stringify(defaultConfig));
    }
    setEditingQuestion({ ...question });
    setShowQuestionModal(true);
  };

  const saveQuestion = () => {
    if (!editingQuestion || !formConfig) return;

    const existingIndex = formConfig.questions.findIndex(q => q.id === editingQuestion.id);
    const updatedQuestions =
      existingIndex >= 0
        ? formConfig.questions.map(q => (q.id === editingQuestion.id ? editingQuestion : q))
        : [...formConfig.questions, editingQuestion];

    saveFormConfig({
      ...formConfig,
      questions: updatedQuestions,
    });

    setShowQuestionModal(false);
    setEditingQuestion(null);
  };

  const deleteQuestion = (questionId: string) => {
    if (!formConfig) return;
    if (confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = formConfig.questions.filter(q => q.id !== questionId);
      saveFormConfig({
        ...formConfig,
        questions: updatedQuestions,
      });
    }
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    if (!formConfig) return;

    const questions = [...formConfig.questions];
    const index = questions.findIndex(q => q.id === questionId);

    if (direction === 'up' && index > 0) {
      [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
    } else if (direction === 'down' && index < questions.length - 1) {
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
    }

    saveFormConfig({
      ...formConfig,
      questions,
    });
  };

  const updateTheme = (theme: FormTheme) => {
    if (!formConfig) return;
    saveFormConfig({
      ...formConfig,
      theme,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(loginForm),
    });
    if (res.ok) {
      setAuthenticated(true);
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = async () => {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setAuthenticated(false);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('adminDarkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('adminDarkMode', 'false');
    }
  }, [darkMode]);

  if (authenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow max-w-xs w-full">
          <h2 className="text-xl font-bold mb-6 text-center">Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={loginForm.username}
            onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
            className="w-full p-2 border rounded mb-4"
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
            className="w-full p-2 border rounded mb-4"
          />
          {loginError && <div className="text-red-500 text-sm mb-2">{loginError}</div>}
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">Login</button>
        </form>
      </div>
    );
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Checking authentication...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-center">
          Failed to load admin config. Please log in again or check your server.
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`shadow-sm border-b transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-b'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className={`flex items-center transition-colors ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Form
              </a>
              <div className={`h-6 border-l ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
              <h1 className={`text-2xl font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4 ml-auto">
              <a
                href="https://github.com/Donrskbb/Typeform-Creator/tree/dev"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                title="View on GitHub"
              >
                <Github className="w-6 h-6"/>
              </a>
              <button
                onClick={() => setDarkMode(d => !d)}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              <button
                onClick={handleLogout}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`flex space-x-8 border-b mb-8 overflow-x-auto transition-colors ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {([
            { id: 'overview', label: 'Overview', icon: Settings },
            { id: 'form-builder', label: 'Form Builder', icon: Edit3 },
            { id: 'themes', label: 'Themes', icon: Palette },
            { id: 'submissions', label: 'Submissions', icon: Users },
            { id: 'config', label: 'Configuration', icon: Database },
            { id: 'guide', label: 'Guide', icon: Eye },
            { id: 'whatsnew', label: "What's New", icon: Sparkles },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as Tab)}
              className={`flex items-center px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? darkMode
                    ? 'border-purple-400 text-purple-300'
                    : 'border-purple-600 text-purple-600'
                  : darkMode
                    ? 'border-transparent text-gray-300 hover:text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className={`space-y-6 ${darkMode ? '' : ''}`}>
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6`}>
              <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow p-6`}>
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Submissions</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{submissions.length}</p>
                  </div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow p-6`}>
                <div className="flex items-center">
                  <Edit3 className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Form Questions</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formConfig?.questions.length || "Go to Form Builder"}</p>
                  </div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow p-6`}>
                <div className="flex items-center">
                  <Database className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Server Status</p>
                    <p className="text-2xl font-bold text-green-600">Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Destination Status */}
            <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Destination Status</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {config && Object.entries(config.destinations).map(([key, dest]) => {
                    const icons = {
                      discord: MessageSquare,
                      mongodb: Database,
                      email: Mail,
                    };
                    const Icon = icons[key as keyof typeof icons];

                    return (
                      <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <Icon className="w-6 h-6 text-gray-600 mr-3" />
                          <div>
                            <p className="font-medium capitalize">{key}</p>
                            <p className="text-sm text-gray-600">
                              {dest.configured ? 'Configured' : 'Not configured'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {dest.enabled ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'form-builder' && (
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow`}>
              <div className={`px-6 py-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}> 
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Form Questions</h3>
                <button
                  onClick={addQuestion}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </button>
              </div>
              <div className="p-6">
                {formConfig?.questions.map((question, index) => (
                  <div key={question.id} className={`flex items-center justify-between p-4 border rounded-lg mb-4 ${darkMode ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}> 
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{question.question}</h4>
                        {question.required && <span className="text-red-500 text-sm">*</span>}
                      </div>
                      <p className={`text-sm capitalize ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type: {question.type}</p>
                      {question.options && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Options: {question.options.join(', ')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveQuestion(question.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >↑</button>
                      <button
                        onClick={() => moveQuestion(question.id, 'down')}
                        disabled={index === formConfig.questions.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >↓</button>
                      <button
                        onClick={() => editQuestion(question)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}> 
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Choose Theme</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {defaultThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        formConfig?.theme.id === theme.id
                          ? 'border-purple-600 ring-2 ring-purple-200'
                          : darkMode
                            ? 'border-gray-700 hover:border-gray-500'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateTheme(theme)}
                    >
                      <div className={`h-32 ${theme.background} flex items-center justify-center`}>
                        <div className={`${theme.cardBackground} p-4 rounded-lg`}>
                          <h4 className={`${theme.textColor} font-medium`}>Sample Question</h4>
                          <div className={`mt-2 h-2 ${theme.buttonStyle} rounded`}></div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium">{theme.name}</h4>
                        {formConfig?.theme.id === theme.id && (
                          <p className="text-sm text-purple-600 mt-1">Currently Active</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}> 
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recent Submissions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}> 
                <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Company</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Submitted</th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {submissions.map((submission) => (
                    <tr key={submission._id} className={darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{submission.name || 'N/A'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{submission.email || 'N/A'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{submission.role || 'N/A'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{submission.company || 'N/A'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{new Date(submission.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {submissions.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className={`text-gray-500 ${darkMode ? 'text-gray-400' : ''}`}>No submissions yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}> 
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Server Configuration</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Port</dt>
                    <dd className={`mt-1 text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{config?.server.port}</dd>
                  </div>
                  <div>
                    <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Environment</dt>
                    <dd className={`mt-1 text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{config?.server.environment}</dd>
                  </div>
                </dl>
              </div>
            </div>
            {/* Editable .env section */}
            <EnvEditor />
            <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}> 
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Environment Setup</h3>
              </div>
              <div className="p-6">
                <div className={`${darkMode ? 'bg-gray-900 text-green-300' : 'bg-gray-50 text-green-400'} rounded-lg p-4`}>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>To configure the destinations, create a <code className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-900'} px-2 py-1 rounded`}>.env</code> file in your project root with the following variables:</p>
                  <pre className={`text-xs p-4 rounded overflow-x-auto ${darkMode ? 'bg-gray-800 text-green-300' : 'bg-gray-800 text-green-400'}`}>
                    {`# Server Configuration
PORT=3001

# Discord Webhook Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/typeform-creator
MONGODB_DATABASE=typeform-creator

# Email Configuration (using Gmail as example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=admin@yourcompany.com

# Submission Destinations (comma-separated: discord,mongodb,email)
ENABLED_DESTINATIONS=discord,mongodb,email

# Admin Credentials
# Create cookie secret using => node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
ADMIN_USERNAME=youradminusername
ADMIN_PASSWORD=youradminpassword
COOKIE_SECRET=yourcookiesecret`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow p-6`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Admin Features Guide</h2>
              <ul className={`list-disc pl-6 space-y-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                <li>
                  <strong>View Overview:</strong>
                  <p className="text-sm mt-1">See a summary of total submissions, number of form questions, and server status at a glance.</p>
                </li>
                <li>
                  <strong>Form Builder:</strong>
                  <ul className="list-disc pl-6 mt-1 text-sm">
                    <li>Add new questions to the form (text, email, select, multiline).</li>
                    <li>Edit existing questions, including type, placeholder, and options.</li>
                    <li>Delete questions you no longer need.</li>
                    <li>Reorder questions using the up/down arrows.</li>
                  </ul>
                </li>
                <li>
                  <strong>Themes:</strong>
                  <ul className="list-disc pl-6 mt-1 text-sm">
                    <li>Preview and select from available form themes to change the look and feel instantly.</li>
                  </ul>
                </li>
                <li>
                  <strong>Submissions:</strong>
                  <ul className="list-disc pl-6 mt-1 text-sm">
                    <li>View all form submissions in a sortable table.</li>
                    <li>See details like name, email, role, company, and submission date.</li>
                  </ul>
                </li>
                <li>
                  <strong>Configuration:</strong>
                  <ul className="list-disc pl-6 mt-1 text-sm">
                    <li>View server settings (port, environment).</li>
                    <li>Edit the <code>.env</code> file directly from the admin panel (change API keys, credentials, etc.).</li>
                    <li>See example environment variable setup for all integrations.</li>
                  </ul>
                </li>
                <li>
                  <strong>Authentication:</strong>
                  <ul className="list-disc pl-6 mt-1 text-sm">
                    <li>Log in securely with your admin credentials.</li>
                    <li>Log out at any time to protect access.</li>
                  </ul>
                </li>
                <li>
                  <strong>Error Handling & Feedback:</strong>
                  <ul className="list-disc pl-6 mt-1 text-sm">
                    <li>See clear error messages if API calls fail or authentication expires.</li>
                    <li>Get confirmation when changes are saved successfully.</li>
                  </ul>
                </li>
              </ul>
              <div className={`mt-8 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Tip:</strong> All changes you make as an admin are instantly reflected for users filling out the form. Use the navigation tabs above to explore each feature!
              </div>
            </div>
          </div>
        )}

        {activeTab === 'whatsnew' && (
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow p-8 max-w-3xl mx-auto`}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Sparkles className="w-6 h-6 text-purple-500" /> What's New</h2>
              <ul className="list-disc pl-6 space-y-3 text-lg">
                <li><strong>Admin Panel:</strong> Secure login/logout, protected endpoints, and robust error handling.</li>
                <li><strong>Dark Mode:</strong> Full dark mode support for all admin and user UI, including EnvEditor and footer.</li>
                <li><strong>Form Builder:</strong> Add, edit, delete, and reorder questions. New question types and options input.</li>
                <li><strong>Themes:</strong> Instantly preview and switch between beautiful form themes.</li>
                <li><strong>EnvEditor:</strong> Edit your <code>.env</code> file directly from the admin panel, with dark mode support.</li>
                <li><strong>Guide Tab:</strong> In-app guide for all admin features and actions.</li>
                <li><strong>Copyright Footer:</strong> Footer adapts to theme and always stays visible.</li>
                <li><strong>API URL Config:</strong> Frontend now uses <code>VITE_SERVER_URL</code> and <code>VITE_SERVER_HTTPS</code> from <code>.env</code> for backend calls.</li>
                <li><strong>Improved Error Feedback:</strong> Clear error messages and feedback for failed API calls and submissions.</li>
              </ul>
              <div className="mt-6 text-sm text-gray-500">Last updated: June 2025</div>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <footer className={`w-full py-4 mt-12 text-center text-xs ${darkMode ? 'bg-gray-900 text-gray-500 border-t border-gray-700' : 'bg-gray-50 text-gray-500 border-t border-gray-200'}`}>
        &copy; {new Date().getFullYear()} Donrskbb. All rights reserved.
      </footer>

      {/* Question Modal */}
      {showQuestionModal && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Question</h2>
            <label className="block mb-2 text-sm font-medium text-gray-700">Type</label>
            <select
              value={editingQuestion.type}
              onChange={e => {
                const type = e.target.value as Question['type'];
                setEditingQuestion({
                  ...editingQuestion,
                  type,
                  options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
                });
              }}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="select">Select</option>
              <option value="multiline">Multiline</option>
            </select>
            <label className="block mb-2 text-sm font-medium text-gray-700">Question</label>
            <input
              type="text"
              value={editingQuestion.question}
              onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">Placeholder</label>
            <input
              type="text"
              value={editingQuestion.placeholder}
              onChange={e => setEditingQuestion({ ...editingQuestion, placeholder: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            {editingQuestion.type === 'select' && (
              <>
                <label className="block mb-2 text-sm font-medium text-gray-700">Options (comma separated)</label>
                <input
                  type="text"
                  value={editingQuestion.options?.join(', ') || ''}
                  onChange={e => setEditingQuestion({
                    ...editingQuestion,
                    options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean),
                  })}
                  className="w-full p-2 border rounded mb-4"
                />
              </>
            )}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingQuestion.required}
                  onChange={e => setEditingQuestion({ ...editingQuestion, required: e.target.checked })}
                  className="mr-2"
                />
                Required
              </label>
              <div className="space-x-2">
                <button
                  onClick={saveQuestion}
                  disabled={!editingQuestion.question || (editingQuestion.type === 'select' && (!editingQuestion.options || editingQuestion.options.length === 0))}
                  className={`bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2 ${(!editingQuestion.question || (editingQuestion.type === 'select' && (!editingQuestion.options || editingQuestion.options.length === 0))) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingQuestion(null);
                    setShowQuestionModal(false);
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EnvEditor: React.FC = () => {
  const [envContent, setEnvContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Detect dark mode on mount and when it changes
  useEffect(() => {
    const checkDark = () => setDarkMode(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!editing) {
      setLoading(true);
      apiFetch('/api/config/env', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setEnvContent(data.content || '');
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load .env file');
          setLoading(false);
        });
    }
  }, [editing]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const res = await apiFetch('/api/config/env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: envContent }),
    });
    if (res.ok) {
      setSuccess(true);
      setEditing(false);
    } else {
      setError('Failed to save .env file');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-500'} rounded-lg shadow p-6 my-4 text-center`}>Loading .env file...</div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow p-6 my-4`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Edit .env File</h3>
        {!editing && (
          <button
            className={`px-4 py-1 rounded transition-colors ${darkMode ? 'bg-purple-700 text-white hover:bg-purple-600' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            onClick={() => setEditing(true)}
          >Edit</button>
        )}
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">.env file saved successfully!</div>}
      <textarea
        className={`w-full h-64 border rounded p-2 font-mono text-xs transition-colors ${darkMode ? 'bg-gray-900 text-gray-100 border-gray-700 placeholder-gray-400' : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-400'}`}
        value={envContent}
        onChange={e => setEnvContent(e.target.value)}
        disabled={!editing}
      />
      {editing && (
        <div className="flex gap-2 mt-2">
          <button
            className={`px-4 py-2 rounded transition-colors ${darkMode ? 'bg-purple-700 text-white hover:bg-purple-600' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            onClick={handleSave}
            disabled={loading}
          >Save</button>
          <button
            className={`px-4 py-2 rounded transition-colors ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
            onClick={() => setEditing(false)}
            disabled={loading}
          >Cancel</button>
        </div>
      )}
    </div>
  );
};