import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  AlertCircle, 
  X
} from 'lucide-react';
import * as Icons from 'lucide-react';

import { BudgetService } from '../services/budget/budget.service';
import type { BudgetProgress, BudgetCreate } from '../services/budget/types';
import { BUDGET_ERRORS } from '../services/budget/constant';
import { COMMON_CONFIRMATIONS } from '../constants/messages';

const getIconComponent = (name: string, color?: string) => {
  let formattedName = name;
  if (name.includes('-')) {
    formattedName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  } else {
    formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  const IconComponent = (Icons as any)[formattedName];
  if (!IconComponent) {
    const Fallback = (Icons as any)['HelpCircle'];
    return <Fallback size={20} style={{ color }} />;
  }
  return <IconComponent size={20} style={{ color }} />;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const Budgets: React.FC = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái Form Thiết lập
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetProgress | null>(null);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2024, 2025, 2026, 2027];

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await BudgetService.getBudgetsProgress(selectedMonth, selectedYear);
      setBudgets(data);
    } catch (error) {
      console.error('Lỗi khi tải ngân sách:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const openSetupModal = (item: BudgetProgress) => {
    setSelectedCategory(item);
    setBudgetAmount(item.limit_amount || 0);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    
    if (budgetAmount <= 0) {
      setFormError(BUDGET_ERRORS.AMOUNT_INVALID);
      return;
    }

    const payload: BudgetCreate = {
      amount: budgetAmount,
      month: selectedMonth,
      year: selectedYear,
      category_id: selectedCategory.category_id
    };

    try {
      setSubmitting(true);
      setFormError(null);
      await BudgetService.setBudget(payload);
      closeModal();
      fetchBudgets();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || 'Không thể lưu ngân sách.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (window.confirm(COMMON_CONFIRMATIONS.DELETE_BUDGET)) {
      try {
        await BudgetService.deleteBudget(id);
        fetchBudgets();
      } catch (error) {
        console.error('Không thể xóa ngân sách:', error);
      }
    }
  };

  // Tính các thống kê tổng quan của ngân sách
  const activeBudgets = budgets.filter(b => b.limit_amount > 0);
  const totalBudgetLimit = activeBudgets.reduce((sum, b) => sum + b.limit_amount, 0);
  const totalBudgetSpent = activeBudgets.reduce((sum, b) => sum + b.spent_amount, 0);
  const totalBudgetLeft = totalBudgetLimit - totalBudgetSpent;

  return (
    <div className="budgets-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Ngân sách chi tiêu</h1>
          <p className="subtitle">Hạn chế chi tiêu quá mức bằng cách lập hạn mức cho từng danh mục</p>
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
          <span>Đang thống kê số liệu ngân sách...</span>
        </div>
      ) : (
        <div className="budgets-grid">
          {/* Summary Cards */}
          {activeBudgets.length > 0 && (
            <div className="summary-cards budgets-summary fade-in" style={{ marginBottom: '1.5rem' }}>
              <div className="glass-card summary-card text-center">
                <span className="card-title">Hạn mức đã đặt</span>
                <h3 className="amount text-info" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                  {formatCurrency(totalBudgetLimit)}
                </h3>
              </div>
              <div className="glass-card summary-card text-center">
                <span className="card-title">Đã chi tiêu thực tế</span>
                <h3 className={`amount ${totalBudgetSpent > totalBudgetLimit ? 'text-danger' : 'text-warning'}`} style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                  {formatCurrency(totalBudgetSpent)}
                </h3>
              </div>
              <div className="glass-card summary-card text-center">
                <span className="card-title">Hạn mức còn lại</span>
                <h3 className={`amount ${totalBudgetLeft < 0 ? 'text-danger' : 'text-success'}`} style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                  {formatCurrency(totalBudgetLeft)}
                </h3>
              </div>
            </div>
          )}

          {/* List of categories with budget progress */}
          <div className="budgets-list-panel fade-in">
            <div className="panel-sub-header">
              <h3>Hạn mức theo từng danh mục chi tiêu</h3>
            </div>
            
            <div className="budgets-card-grid">
              {budgets.map(item => {
                const hasBudget = item.limit_amount > 0;
                const percent = hasBudget ? Math.round((item.spent_amount / item.limit_amount) * 100) : 0;
                const percentClamped = Math.min(percent, 100);
                const isOver = percent >= 100;
                const isWarning = percent >= 80 && percent < 100;
                
                let cardStatusClass = '';
                let progressColor = 'var(--accent-primary)';
                
                if (hasBudget) {
                  if (isOver) {
                    cardStatusClass = 'over-budget';
                    progressColor = 'var(--color-danger)';
                  } else if (isWarning) {
                    cardStatusClass = 'warning-budget';
                    progressColor = 'var(--color-warning)';
                  } else {
                    cardStatusClass = 'safe-budget';
                    progressColor = 'var(--color-success)';
                  }
                }

                return (
                  <div key={item.category_id} className={`glass-card budget-card ${cardStatusClass}`}>
                    <div className="budget-card-header">
                      <div className="cat-icon-title">
                        <div className="cat-icon-container" style={{ backgroundColor: `${item.category_color}15` }}>
                          {getIconComponent(item.category_icon, item.category_color)}
                        </div>
                        <div className="cat-text">
                          <span className="cat-name">{item.category_name}</span>
                          <span className="cat-subtitle">
                            {hasBudget ? `Hạn mức: ${formatCurrency(item.limit_amount)}` : 'Chưa đặt hạn mức'}
                          </span>
                        </div>
                      </div>
                      
                      {hasBudget && (
                        <span className={`badge ${isOver ? 'badge-expense' : isWarning ? 'badge-warning' : 'badge-income'}`}>
                          {isOver ? 'Vượt hạn mức' : isWarning ? 'Cảnh báo' : 'An toàn'}
                        </span>
                      )}
                    </div>

                    <div className="budget-card-body">
                      {hasBudget ? (
                        <>
                          <div className="budget-amounts">
                            <span className="spent-val">
                              Đã chi: <strong>{formatCurrency(item.spent_amount)}</strong>
                            </span>
                            <span className="percent-val">{percent}%</span>
                          </div>
                          
                          <div className="progress-container" style={{ height: '10px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ width: `${percentClamped}%`, backgroundColor: progressColor }} 
                            />
                          </div>
                          
                          <div className="budget-footer-info">
                            {isOver ? (
                              <span className="over-amount text-danger">
                                Vượt chi: <strong>{formatCurrency(item.spent_amount - item.limit_amount)}</strong>
                              </span>
                            ) : (
                              <span className="remaining-amount text-success">
                                Còn lại: <strong>{formatCurrency(item.limit_amount - item.spent_amount)}</strong>
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="empty-budget-body">
                          <p>Ghi nhận thực chi: <strong>{formatCurrency(item.spent_amount)}</strong></p>
                        </div>
                      )}
                    </div>

                    <div className="budget-card-actions">
                      <button className="btn btn-secondary btn-sm flex-1" onClick={() => openSetupModal(item)}>
                        {hasBudget ? 'Thay đổi hạn mức' : 'Thiết lập hạn mức'}
                      </button>
                      {hasBudget && (
                        <button 
                          className="btn btn-secondary btn-icon btn-sm text-danger-hover" 
                          onClick={() => handleDeleteBudget(item.id!)}
                          title="Hủy hạn mức"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Setup Budget Modal */}
      {modalOpen && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>Thiết lập ngân sách</h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-category-desc" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: `${selectedCategory.category_color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getIconComponent(selectedCategory.category_icon, selectedCategory.category_color)}
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem' }}>{selectedCategory.category_name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tháng {selectedMonth} năm {selectedYear}</p>
              </div>
            </div>

            {formError && (
              <div className="auth-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={20} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Hạn mức chi tiêu tối đa (đ)</label>
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="3,000,000"
                  value={budgetAmount || ''}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  required
                  min="1"
                  disabled={submitting}
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={closeModal}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled budgets elements */}
      <style>{`
        .panel-sub-header {
          margin-bottom: 1.5rem;
        }
        .budgets-card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .budget-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .budget-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .cat-icon-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .cat-icon-container {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cat-text {
          display: flex;
          flex-direction: column;
        }
        .cat-name {
          font-weight: 700;
          font-size: 0.95rem;
        }
        .cat-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .budget-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.5rem;
        }
        .budget-amounts {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .spent-val {
          color: var(--text-secondary);
        }
        .percent-val {
          font-weight: 700;
          color: var(--text-primary);
        }
        .budget-footer-info {
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }
        .empty-budget-body {
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 0.5rem 0;
        }
        
        .budget-card-actions {
          display: flex;
          gap: 0.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
          margin-top: auto;
        }
        .flex-1 {
          flex: 1;
        }
        .btn-sm {
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
        }
        .text-danger-hover:hover {
          color: var(--color-danger) !important;
          background-color: var(--color-danger-bg) !important;
          border-color: rgba(239, 68, 68, 0.15) !important;
        }
        
        /* Specific card status border glow to look extremely premium */
        .budget-card.over-budget {
          border-color: rgba(239, 68, 68, 0.25);
          background: linear-gradient(180deg, var(--glass-bg) 0%, rgba(239, 68, 68, 0.02) 100%);
        }
        .budget-card.warning-budget {
          border-color: rgba(245, 158, 11, 0.25);
          background: linear-gradient(180deg, var(--glass-bg) 0%, rgba(245, 158, 11, 0.02) 100%);
        }
        .budget-card.safe-budget {
          border-color: rgba(16, 185, 129, 0.15);
        }
        
        @media (max-width: 992px) {
          .budgets-card-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 576px) {
          .budgets-card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Budgets;
