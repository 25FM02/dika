import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  LogOut, 
  User,
  Menu,
  X,
  PiggyBank
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container fade-in">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="logo-area">
          <Wallet size={24} color="var(--accent-primary)" />
          <span className="logo-text">MoneyManager</span>
        </div>
        <button className="menu-toggle-btn" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar (Desktop & Mobile Panel) */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <Wallet size={28} className="brand-icon" />
          <span className="brand-text">MoneyManager</span>
        </div>

        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.full_name || 'Người dùng'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <LayoutDashboard size={20} />
            <span>Bảng điều khiển</span>
          </NavLink>
          <NavLink 
            to="/transactions" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <Receipt size={20} />
            <span>Giao dịch</span>
          </NavLink>
          <NavLink 
            to="/budgets" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <Wallet size={20} />
            <span>Ngân sách</span>
          </NavLink>
          <NavLink 
            to="/savings" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <PiggyBank size={20} />
            <span>Tiết kiệm</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {mobileMenuOpen && <div className="sidebar-overlay" onClick={closeMobileMenu} />}
        <Outlet />
      </main>

      {/* CSS CSS CSS cho Sidebar và Mobile Layout */}
      <style>{`
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          padding: 0.5rem;
        }
        .brand-icon {
          color: var(--accent-primary);
        }
        .brand-text {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
          border: 1px solid var(--border-color);
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .user-name {
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-email {
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.9rem 1.2rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }
        .nav-item.active {
          color: var(--text-on-accent);
          background: var(--accent-primary);
          box-shadow: var(--shadow-accent);
        }
        .sidebar-footer {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.9rem 1.2rem;
          background: none;
          border: none;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
          text-align: left;
        }
        .logout-btn:hover {
          color: var(--color-danger);
          background: var(--color-danger-bg);
        }
        
        .mobile-header {
          display: none;
        }
        
        @media (max-width: 992px) {
          .mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.5rem;
            background-color: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 200;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .logo-text {
            font-weight: 800;
            font-size: 1.15rem;
            letter-spacing: -0.02em;
          }
          .menu-toggle-btn {
            background: none;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
          }
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 280px;
            box-shadow: var(--shadow-lg);
          }
          .sidebar.mobile-open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 90;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
