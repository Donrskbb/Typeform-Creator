import React, { useState, useEffect } from 'react';
import {
  Settings, Database, Mail, MessageSquare, Users, ArrowLeft, RefreshCw, CheckCircle, XCircle,
  Edit3, Plus, Trash2, Eye, Palette, Save, X
} from 'lucide-react';
import { Question, FormConfig, FormTheme, defaultThemes } from '../types';

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

type Tab = 'overview' | 'submissions' | 'config' | 'form-builder' | 'themes';

export const AdminPanel: React.FC = () => {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchSubmissions();
    loadFormConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/submissions');
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
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

  const refresh = () => {
    setLoading(true);
    fetchConfig();
    fetchSubmissions();
  };

  const addQuestion = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Form
              </a>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={refresh}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-8 border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Settings },
            { id: 'form-builder', label: 'Form Builder', icon: Edit3 },
            { id: 'themes', label: 'Themes', icon: Palette },
            { id: 'submissions', label: 'Submissions', icon: Users },
            { id: 'config', label: 'Configuration', icon: Database },
            { id: 'guide', label: 'Guide', icon: Eye },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'border-purple-600 text-purple-600'
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Edit3 className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Form Questions</p>
                    <p className="text-2xl font-bold text-gray-900">{formConfig?.questions.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Database className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Server Status</p>
                    <p className="text-2xl font-bold text-green-600">Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Destination Status */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Destination Status</h3>
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
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Form Questions</h3>
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
                  <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{question.question}</h4>
                        {question.required && <span className="text-red-500 text-sm">*</span>}
                      </div>
                      <p className="text-sm text-gray-600 capitalize">Type: {question.type}</p>
                      {question.options && (
                        <p className="text-sm text-gray-500">Options: {question.options.join(', ')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveQuestion(question.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveQuestion(question.id, 'down')}
                        disabled={index === formConfig.questions.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↓
                      </button>
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
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Choose Theme</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {defaultThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        formConfig?.theme.id === theme.id ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Submissions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.role || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.company || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {submissions.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No submissions yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Server Configuration</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Port</dt>
                    <dd className="mt-1 text-sm text-gray-900">{config?.server.port}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Environment</dt>
                    <dd className="mt-1 text-sm text-gray-900">{config?.server.environment}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Environment Setup</h3>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    To configure the destinations, create a <code className="bg-gray-200 px-2 py-1 rounded">.env</code> file 
                    in your project root with the following variables:
                  </p>
                  <pre className="text-xs bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
                    {`# Discord Configuration
                    DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url

                    # MongoDB Configuration  
                    MONGODB_URI=mongodb://localhost:27017/typeform-creator

                    # Email Configuration
                    EMAIL_HOST=smtp.gmail.com
                    EMAIL_PORT=587
                    EMAIL_USER=your-email@gmail.com
                    EMAIL_PASS=your-app-password
                    EMAIL_TO=admin@yourcompany.com

                    # Enable destinations (comma-separated)
                    ENABLED_DESTINATIONS=discord,mongodb,email`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Question Modal */}
      {showQuestionModal && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Question</h2>
            <label className="block mb-2 text-sm font-medium text-gray-700">Question</label>
            <input
              type="text"
              value={editingQuestion.question}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">Placeholder</label>
            <input
              type="text"
              value={editingQuestion.placeholder}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, placeholder: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingQuestion.required}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, required: e.target.checked })}
                  className="mr-2"
                />
                Required
              </label>
              <div className="space-x-2">
                <button
                  onClick={saveQuestion}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2"
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