export interface Question {
  id: string;
  type: 'text' | 'email' | 'select' | 'multiline' | 'number' | 'url' | 'tel';
  question: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  description?: string;
}

export interface FormState {
  [key: string]: string;
}

export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  theme: FormTheme;
  createdAt: string;
  updatedAt: string;
}

export interface FormTheme {
  id: string;
  name: string;
  background: string;
  textColor: string;
  accentColor: string;
  cardBackground: string;
  borderColor: string;
  buttonStyle: string;
}

export const defaultThemes: FormTheme[] = [
  {
    id: 'purple-gradient',
    name: 'Purple Gradient',
    background: 'bg-gradient-to-br from-purple-900 to-indigo-900',
    textColor: 'text-white',
    accentColor: 'text-purple-300',
    cardBackground: 'bg-white/10',
    borderColor: 'border-white/20',
    buttonStyle: 'bg-white/10 hover:bg-white/20'
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    background: 'bg-gradient-to-br from-blue-900 to-cyan-900',
    textColor: 'text-white',
    accentColor: 'text-blue-300',
    cardBackground: 'bg-white/10',
    borderColor: 'border-white/20',
    buttonStyle: 'bg-white/10 hover:bg-white/20'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    background: 'bg-gradient-to-br from-orange-900 to-red-900',
    textColor: 'text-white',
    accentColor: 'text-orange-300',
    cardBackground: 'bg-white/10',
    borderColor: 'border-white/20',
    buttonStyle: 'bg-white/10 hover:bg-white/20'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    background: 'bg-gradient-to-br from-green-900 to-emerald-900',
    textColor: 'text-white',
    accentColor: 'text-green-300',
    cardBackground: 'bg-white/10',
    borderColor: 'border-white/20',
    buttonStyle: 'bg-white/10 hover:bg-white/20'
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    background: 'bg-gray-50',
    textColor: 'text-gray-900',
    accentColor: 'text-gray-600',
    cardBackground: 'bg-white',
    borderColor: 'border-gray-200',
    buttonStyle: 'bg-gray-100 hover:bg-gray-200'
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    background: 'bg-gray-900',
    textColor: 'text-white',
    accentColor: 'text-gray-300',
    cardBackground: 'bg-gray-800',
    borderColor: 'border-gray-700',
    buttonStyle: 'bg-gray-700 hover:bg-gray-600'
  }
];