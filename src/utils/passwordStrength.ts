export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

const MIN_LENGTH = 6;
const MAX_LENGTH = 50;

export const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  const feedback: string[] = [];
  const requirements = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  };

  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      feedback: ['请输入密码'],
      requirements,
    };
  }

  if (password.length >= MIN_LENGTH) {
    score += 20;
    requirements.minLength = true;
  } else {
    feedback.push(`密码长度至少${MIN_LENGTH}位`);
  }

  if (password.length <= MAX_LENGTH) {
    score += 5;
  } else {
    feedback.push(`密码长度不能超过${MAX_LENGTH}位`);
  }

  if (/[A-Z]/.test(password)) {
    score += 20;
    requirements.hasUpperCase = true;
  } else {
    feedback.push('请包含至少一个大写字母');
  }

  if (/[a-z]/.test(password)) {
    score += 20;
    requirements.hasLowerCase = true;
  } else {
    feedback.push('请包含至少一个小写字母');
  }

  if (/[0-9]/.test(password)) {
    score += 20;
    requirements.hasNumber = true;
  } else {
    feedback.push('请包含至少一个数字');
  }

  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    score += 15;
    requirements.hasSpecialChar = true;
  } else {
    feedback.push('请包含至少一个特殊字符');
  }

  if (password.length >= 10) {
    score += 5;
  }

  if (password.length >= 12) {
    score += 5;
  }

  let strength: PasswordStrength;
  if (score < 40) {
    strength = 'weak';
  } else if (score < 65) {
    strength = 'fair';
  } else if (score < 85) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  const strengthFeedback = {
    weak: ['密码太弱，请增加密码复杂度'],
    fair: ['密码强度一般，建议增加长度和特殊字符'],
    good: ['密码强度良好'],
    strong: ['密码强度很高，安全性好'],
  };

  return {
    strength,
    score: Math.min(score, 100),
    feedback: feedback.length > 0 ? feedback : strengthFeedback[strength],
    requirements,
  };
};

export const getStrengthLabel = (strength: PasswordStrength): string => {
  const labels = {
    weak: '弱',
    fair: '一般',
    good: '良好',
    strong: '强',
  };
  return labels[strength];
};

export const getStrengthColor = (strength: PasswordStrength): string => {
  const colors = {
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  };
  return colors[strength];
};

export const getStrengthTextColor = (strength: PasswordStrength): string => {
  const colors = {
    weak: 'text-red-400',
    fair: 'text-yellow-400',
    good: 'text-blue-400',
    strong: 'text-green-400',
  };
  return colors[strength];
};
