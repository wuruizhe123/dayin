import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import { useNavigate } from 'react-router-dom';
import {
  calculatePasswordStrength,
  getStrengthLabel,
  getStrengthColor,
  getStrengthTextColor,
} from '../../utils/passwordStrength';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { changePassword, verifyPassword } = useAdminStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(calculatePasswordStrength(''));

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword));
  }, [newPassword]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = '请输入当前密码';
    } else if (!verifyPassword(currentPassword)) {
      newErrors.currentPassword = '当前密码不正确';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = '请输入新密码';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = '密码长度至少为6位';
    } else if (newPassword.length > 50) {
      newErrors.newPassword = '密码长度不能超过50位';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = changePassword(currentPassword, newPassword);
    
    if (result.success) {
      setSuccess(true);
    } else {
      if (result.error === '当前密码不正确') {
        setErrors({ currentPassword: result.error });
      } else {
        setErrors({ newPassword: result.error });
      }
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  const getRequirementIcon = (met: boolean) => {
    if (met) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-slate-500" />;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-700 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">密码修改成功</h2>
          <p className="text-slate-400 mb-6">您的密码已成功更新，请使用新密码重新登录</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            返回登录页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="bg-slate-750/50 px-6 py-4 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">修改密码</h1>
                <p className="text-sm text-slate-400">请输入当前密码并设置新密码</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                当前密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.currentPassword) {
                      setErrors((prev) => ({ ...prev, currentPassword: undefined }));
                    }
                  }}
                  placeholder="请输入当前密码"
                  className={`w-full pl-10 pr-12 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    errors.currentPassword ? 'border-red-500' : 'border-slate-600'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                新密码
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      setErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  placeholder="请输入新密码"
                  className={`w-full pl-10 pr-12 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    errors.newPassword ? 'border-red-500' : 'border-slate-600'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">密码强度</span>
                    <span className={`text-sm font-medium ${getStrengthTextColor(passwordStrength.strength)}`}>
                      {getStrengthLabel(passwordStrength.strength)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor(passwordStrength.strength)} transition-all duration-300`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {passwordStrength.feedback.map((msg, index) => (
                      <p key={index} className="text-xs text-slate-500">
                        {msg}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                确认新密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  placeholder="请再次输入新密码"
                  className={`w-full pl-10 pr-12 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-3">密码要求</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {getRequirementIcon(passwordStrength.requirements.minLength)}
                  <span className="text-sm text-slate-400">至少6个字符</span>
                </div>
                <div className="flex items-center gap-3">
                  {getRequirementIcon(passwordStrength.requirements.hasUpperCase)}
                  <span className="text-sm text-slate-400">包含大写字母(A-Z)</span>
                </div>
                <div className="flex items-center gap-3">
                  {getRequirementIcon(passwordStrength.requirements.hasLowerCase)}
                  <span className="text-sm text-slate-400">包含小写字母(a-z)</span>
                </div>
                <div className="flex items-center gap-3">
                  {getRequirementIcon(passwordStrength.requirements.hasNumber)}
                  <span className="text-sm text-slate-400">包含数字(0-9)</span>
                </div>
                <div className="flex items-center gap-3">
                  {getRequirementIcon(passwordStrength.requirements.hasSpecialChar)}
                  <span className="text-sm text-slate-400">包含特殊字符(!@#$%^&*等)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    处理中...
                  </>
                ) : (
                  '确认修改'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <h4 className="text-sm font-medium text-slate-300 mb-2">安全提示</h4>
          <ul className="text-sm text-slate-500 space-y-1">
            <li>• 请选择一个不易被猜测的密码</li>
            <li>• 不要使用与其他网站相同的密码</li>
            <li>• 建议定期更换密码以提高安全性</li>
            <li>• 密码修改后请使用新密码重新登录</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { ChangePassword };
