import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  ChevronRight,
  Plus
} from 'lucide-react';
import * as Icons from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { StatisticsService } from '../services/statistics/statistics.service';
import { BudgetService } from '../services/budget/budget.service';
import { TransactionService } from '../services/transaction/transaction.service';
import { Summary, CategoryDist, MonthlyTrend } from '../services/statistics/types';
import { BudgetProgress } from '../services/budget/types';
import { Transaction } from '../services/transaction/types';

const getIconComponent = (name: string, color?: string) => {
  // Chuẩn hóa tên icon từ database sang PascalCase nếu cần
  let formattedName = name;
  if (name.includes('-')) {
    formattedName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  } else {
    formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  const IconComponent = (Icons as any)[formattedName];
  if (!IconComponent) {
    const Fallback = (Icons as any)['HelpCircle'];
    return <Fallback size={18} style={{ color }} />;
  }
  return <IconComponent size={18} style={{ color }} />;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const Dashboard: React.FC = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const [summary, setSummary] = useState<Summary | null>(null);
  const [distribution, setDistribution] = useState<CategoryDist[]>([]);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Danh sách tháng & năm để lọc
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2024, 2025, 2026, 2027];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [summaryData, distData, trendData, budgetData, txData] = await Promise.all([
        StatisticsService.getSummary(selectedMonth, selectedYear),
        StatisticsService.getCategoryDistribution(selectedMonth, selectedYear, 'EXPENSE'),
        StatisticsService.getMonthlyTrend(),
        BudgetService.getBudgetsProgress(selectedMonth, selectedYear),
        TransactionService.getTransactions({ limit: 5 })
      ]);
      
      setSummary(summaryData);
      setDistribution(distData);
      setTrend(trendData);
      setBudgets(budgetData);
      setRecentTransactions(txData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu Dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  // Lấy các ngân sách có chi tiêu cao hoặc vượt hạn mức để hiển thị cảnh báo
  const warningBudgets = budgets.filter(b => b.limit_amount > 0 && (b.spent_amount / b.limit_amount >= 0.8));

  return (
    <div className="dashboard-page">
      {/* Header & Filter */}
      <div className="page-header">
        <div>
          <h1>Bảng điều khiển</h1>
          <p className="subtitle">Thống kê và phân tích tình hình tài chính của bạn</p>
        </div>
        <div className="filter-group">
          <Calendar size={18} className="filter-icon" />
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="form-input form-select filter-select"
          >
            {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="form-input form-select filter-select"
          >
            {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <span>Đang cập nhật số liệu...</span>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="glass-card summary-card balance">
              <div className="card-header">
                <span className="card-title">Số dư hiện tại</span>
                <div className="icon-wrapper bg-blue">
                  <DollarSign size={20} />
                </div>
              </div>
              <h2 className="amount">{formatCurrency(summary?.balance || 0)}</h2>
              <span className="card-desc">Hiệu số thu nhập & chi tiêu</span>
            </div>

            <div className="glass-card summary-card income">
              <div className="card-header">
                <span className="card-title">Tổng Thu Nhập</span>
                <div className="icon-wrapper bg-success">
                  <TrendingUp size={20} />
                </div>
              </div>
              <h2 className="amount text-success">{formatCurrency(summary?.total_income || 0)}</h2>
              <span className="card-desc">Tháng {selectedMonth}/{selectedYear}</span>
            </div>

            <div className="glass-card summary-card expense">
              <div className="card-header">
                <span className="card-title">Tổng Chi Tiêu</span>
                <div className="icon-wrapper bg-danger">
                  <TrendingDown size={20} />
                </div>
              </div>
              <h2 className="amount text-danger">{formatCurrency(summary?.total_expense || 0)}</h2>
              <span className="card-desc">Tháng {selectedMonth}/{selectedYear}</span>
            </div>
          </div>

          {/* Warnings Panel */}
          {warningBudgets.length > 0 && (
            <div className="warning-panel glass-card fade-in">
              <div className="warning-header">
                <AlertTriangle size={20} className="text-warning" />
                <h3>Cảnh báo ngân sách vượt ngưỡng</h3>
              </div>
              <div className="warning-list">
                {warningBudgets.map(b => {
                  const percent = Math.round((b.spent_amount / b.limit_amount) * 100);
                  const isOver = percent >= 100;
                  return (
                    <div key={b.category_id} className="warning-item">
                      <span>
                        Danh mục <strong>{b.category_name}</strong> đã chi{' '}
                        <strong>{formatCurrency(b.spent_amount)}</strong> trên hạn mức{' '}
                        <strong>{formatCurrency(b.limit_amount)}</strong> ({percent}%).
                      </span>
                      <span className={`badge ${isOver ? 'badge-expense' : 'badge-warning'}`}>
                        {isOver ? 'Vượt hạn mức' : 'Sắp vượt'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="charts-row">
            {/* Trend Chart */}
            <div className="glass-card chart-container trend-chart">
              <h3>Xu hướng thu chi (6 tháng gần nhất)</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trend} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month_label" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      formatter={(value: any) => [formatCurrency(value), '']}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="income" name="Thu nhập" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Chi tiêu" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="glass-card chart-container dist-chart">
              <h3>Phân bổ chi tiêu theo danh mục</h3>
              <div className="chart-wrapper">
                {distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="amount"
                        nameKey="category_name"
                      >
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.category_color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        formatter={(value: any) => [formatCurrency(value), '']}
                      />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        wrapperStyle={{ fontSize: 11, paddingLeft: 10 }}
                        formatter={(value: string) => {
                          const distObj = distribution.find(d => d.category_name === value);
                          return `${value} (${distObj ? distObj.percentage : 0}%)`;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">
                    <p>Không có dữ liệu chi tiêu trong tháng này</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lower Grid: Recent Transactions & Budgets */}
          <div className="dashboard-lower-grid">
            {/* Recent Transactions */}
            <div className="glass-card recent-tx-panel">
              <div className="panel-header">
                <h3>Giao dịch gần đây</h3>
                <Link to="/transactions" className="view-all-link">
                  <span>Tất cả</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              {recentTransactions.length > 0 ? (
                <div className="tx-list">
                  {recentTransactions.map(tx => (
                    <div key={tx.id} className="tx-item">
                      <div className="tx-cat-icon" style={{ backgroundColor: `${tx.category?.color}15` }}>
                        {getIconComponent(tx.category?.icon || 'help-circle', tx.category?.color)}
                      </div>
                      <div className="tx-info">
                        <span className="tx-name">{tx.category?.name}</span>
                        <span className="tx-date">
                          {new Date(tx.date).toLocaleDateString('vi-VN')} {tx.description ? `• ${tx.description}` : ''}
                        </span>
                      </div>
                      <div className={`tx-amount ${tx.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-panel-content">
                  <p>Chưa có giao dịch nào được ghi nhận</p>
                  <Link to="/transactions" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
                    <Plus size={16} />
                    <span>Thêm giao dịch</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Budget Tracker Progress list */}
            <div className="glass-card budget-progress-panel">
              <div className="panel-header">
                <h3>Hạn mức ngân sách tháng</h3>
                <Link to="/budgets" className="view-all-link">
                  <span>Quản lý</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="budget-progress-list">
                {budgets.filter(b => b.limit_amount > 0).length > 0 ? (
                  budgets.filter(b => b.limit_amount > 0).map(b => {
                    const percent = Math.min(Math.round((b.spent_amount / b.limit_amount) * 100), 100);
                    let barColor = 'var(--color-success)';
                    if (percent >= 100) {
                      barColor = 'var(--color-danger)';
                    } else if (percent >= 80) {
                      barColor = 'var(--color-warning)';
                    }

                    return (
                      <div key={b.category_id} className="budget-prog-item">
                        <div className="budget-prog-info">
                          <span className="budget-cat-name">
                            {getIconComponent(b.category_icon, b.category_color)}
                            <span style={{ marginLeft: '0.5rem' }}>{b.category_name}</span>
                          </span>
                          <span className="budget-prog-val">
                            {formatCurrency(b.spent_amount)} / {formatCurrency(b.limit_amount)}
                          </span>
                        </div>
                        <div className="progress-container">
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${percent}%`, 
                              backgroundColor: barColor 
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-panel-content">
                    <p>Chưa thiết lập ngân sách tháng này</p>
                    <Link to="/budgets" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
                      <span>Thiết lập ngay</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styled Dashboard */}
      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--bg-secondary);
          padding: 0.3rem 0.6rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }
        .filter-icon {
          color: var(--text-muted);
        }
        .filter-select {
          padding: 0.4rem 2rem 0.4rem 0.8rem;
          border: none;
          background-color: transparent;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }
        .filter-select:focus {
          box-shadow: none;
        }
        
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem;
          gap: 1rem;
          color: var(--text-secondary);
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top: 3px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .summary-card {
          position: relative;
          overflow: hidden;
        }
        .summary-card::before {
          content: '';
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
          top: -50px;
          right: -50px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .card-title {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }
        .icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bg-blue { background-color: var(--color-info-bg); color: var(--color-info); }
        .bg-success { background-color: var(--color-success-bg); color: var(--color-success); }
        .bg-danger { background-color: var(--color-danger-bg); color: var(--color-danger); }
        
        .amount {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }
        .text-success { color: var(--color-success); }
        .text-danger { color: var(--color-danger); }
        .card-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .warning-panel {
          margin-bottom: 1.5rem;
          border-left: 4px solid var(--color-warning) !important;
          background: rgba(245, 158, 11, 0.03) !important;
        }
        .warning-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .warning-header h3 {
          font-size: 1rem;
          color: var(--color-warning);
        }
        .warning-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .warning-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          padding: 0.4rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .warning-item:last-child {
          border-bottom: none;
        }
        .text-warning { color: var(--color-warning); }
        
        .charts-row {
          display: grid;
          grid-template-columns: 1.7fr 1.3fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .chart-container h3 {
          font-size: 1rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        .chart-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 300px;
        }
        .empty-chart {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        
        .dashboard-lower-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .panel-header h3 {
          font-size: 1rem;
        }
        .view-all-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--accent-primary);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .view-all-link:hover {
          color: var(--accent-primary-hover);
        }
        
        .tx-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .tx-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 0.8rem;
          border-bottom: 1px solid var(--border-color);
        }
        .tx-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .tx-cat-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tx-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .tx-name {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .tx-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .tx-amount {
          font-weight: 700;
          font-size: 0.95rem;
        }
        
        .budget-progress-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .budget-prog-item {
          display: flex;
          flex-direction: column;
        }
        .budget-prog-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;
        }
        .budget-cat-name {
          display: inline-flex;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .budget-prog-val {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
        
        .empty-panel-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          text-align: center;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 992px) {
          .summary-cards {
            grid-template-columns: 1fr;
          }
          .charts-row {
            grid-template-columns: 1fr;
          }
          .dashboard-lower-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
