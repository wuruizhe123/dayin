import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import {
  LayoutDashboard,
  FileText,
  Printer,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/admin/history', icon: FileText, label: '打印历史' },
  { path: '/admin/printers', icon: Printer, label: '打印机管理' },
  { path: '/admin/settings', icon: Settings, label: '系统设置' },
  { path: '/admin/change-password', icon: Shield, label: '修改密码' },
];

export function AdminLayout(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAdminStore((state) => state.logout);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <aside
        className={`fixed left-0 top-0 h-full bg-slate-800 border-r border-slate-700 transition-all duration-300 z-50 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-white">管理后台</h1>
                  <p className="text-xs text-slate-400">打印中心</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-all ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">退出登录</span>}
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-all justify-center"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {navItems.find((item) => location.pathname === item.path)?.label || '管理后台'}
              </h2>
              <p className="text-sm text-slate-400">
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">管理员</p>
                <p className="text-xs text-slate-400">admin</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
