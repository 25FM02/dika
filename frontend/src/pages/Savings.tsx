import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';
import { SavingsService } from '../services/savings/savings.service';
import type { SavingsGoal, SavingsGoalCreate } from '../services/savings/types';
import { SAVINGS_ERRORS } from '../services/savings/constant';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const Savings: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái Modals
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Form Fields - Tạo mục tiêu
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState<number>(0);
  const [goalDate, setGoalDate] = useState('');
  const [goalError, setGoalError] = useState<string | null>(null);
  const [goalSubmitting, setGoalSubmitting] = useState(false);

  // Form Fields - Nạp/Rút
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSubmitting, setTxSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await SavingsService.getSavingsGoals();
      setGoals(data);
    } catch (error) {
      console.error('Lỗi khi tải mục tiêu tiết kiệm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const openCreateGoalModal = () => {
    setGoalName('');
    setGoalTarget(0);
    // Chọn ngày mặc định là 6 tháng sau
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setGoalDate(d.toISOString().substring(0, 10));
    setGoalError(null);
    setGoalModalOpen(true);
  };

  const openTransactionModal = (goal: SavingsGoal, type: 'DEPOSIT' | 'WITHDRAW') => {
    setSelectedGoal(goal);
    setTxType(type);
    setTxAmount(0);
    setTxError(null);
    setTxModalOpen(true);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) {
      setGoalError(SAVINGS_ERRORS.NAME_REQUIRED);
      return;
    }
    if (goalTarget <= 0) {
      setGoalError(SAVINGS_ERRORS.AMOUNT_INVALID);
      return;
    }
    if (!goalDate) {
      setGoalError(SAVINGS_ERRORS.DATE_REQUIRED);
      return;
    }
    const targetDate = new Date(goalDate);
    if (targetDate <= new Date()) {
      setGoalError(SAVINGS_ERRORS.DATE_REQUIRED);
      return;
    }

    const payload: SavingsGoalCreate = {
      name: goalName,
      target_amount: goalTarget,
      target_date: targetDate.toISOString()
    };

    try {
      setGoalSubmitting(true);
      setGoalError(null);
      await SavingsService.createSavingsGoal(payload);
      setGoalModalOpen(false);
      fetchGoals();
    } catch (error: any) {
      setGoalError(error.response?.data?.detail || 'Không thể tạo mục tiêu tiết kiệm.');
    } finally {
      setGoalSubmitting(false);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    if (txAmount <= 0) {
      setTxError(SAVINGS_ERRORS.AMOUNT_TRANSACTION_INVALID);
      return;
    }

    try {
      setTxSubmitting(true);
      setTxError(null);
      if (txType === 'DEPOSIT') {
        await SavingsService.depositToGoal(selectedGoal.id, txAmount);
      } else {
        await SavingsService.withdrawFromGoal(selectedGoal.id, txAmount);
      }
      setTxModalOpen(false);
      fetchGoals();
    } catch (error: any) {
      setTxError(error.response?.data?.detail || 'Giao dịch không thành công.');
    } finally {
      setTxSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục tiêu tiết kiệm này không? Dữ liệu đã tích lũy sẽ bị xóa khỏi hệ thống.')) {
      try {
        await SavingsService.deleteSavingsGoal(id);
        fetchGoals();
      } catch (error) {
        console.error('Lỗi khi xóa mục tiêu tiết kiệm:', error);
      }
    }
  };

  return (
    <div className="savings-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Mục tiêu Tiết kiệm</h1>
          <p className="subtitle">Lập kế hoạch và tích lũy ngân sách cho các dự định tương lai</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateGoalModal}>
          <Plus size={18} />
          <span>Tạo mục tiêu</span>
        </button>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <span>Đang truy xuất thông tin tiết kiệm...</span>
        </div>
      ) : (
        <div className="savings-content fade-in">
          {goals.length === 0 ? (
            <div className="glass-card empty-state" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <div className="empty-icon" style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                <PiggyBank size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3>Chưa có mục tiêu tiết kiệm nào</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Bắt đầu tích lũy cho những kế hoạch dài hạn của bạn ngay hôm nay!
              </p>
              <button className="btn btn-primary" onClick={openCreateGoalModal}>
                <Plus size={16} />
                <span>Tạo mục tiêu đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="savings-grid">
              {goals.map(goal => {
                const percentage = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                const isCompleted = goal.status === 'COMPLETED' || percentage >= 100;
                const formattedDate = new Date(goal.target_date).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });

                return (
                  <div key={goal.id} className={`glass-card savings-card ${isCompleted ? 'completed-border' : ''}`}>
                    {/* Header Card */}
                    <div className="card-header">
                      <div className="card-title-area">
                        <div className="goal-icon-wrapper">
                          <PiggyBank size={20} className="goal-icon" />
                        </div>
                        <div>
                          <h3 className="goal-name">{goal.name}</h3>
                          <span className="goal-date">
                            <Calendar size={12} style={{ marginRight: '4px' }} />
                            Hạn: {formattedDate}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="delete-goal-btn" 
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Xóa mục tiêu"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Progress Area */}
                    <div className="card-progress-section">
                      <div className="progress-numbers">
                        <span className="current-amt">{formatCurrency(goal.current_amount)}</span>
                        <span className="target-amt">mục tiêu: {formatCurrency(goal.target_amount)}</span>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar-fill" 
                          style={{ 
                            width: `${percentage}%`,
                            background: isCompleted 
                              ? 'linear-gradient(90deg, #10b981, #059669)' 
                              : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
                          }} 
                        />
                      </div>
                      <div className="progress-percentage-label">
                        <span>Đã tích lũy {percentage}%</span>
                        {isCompleted && (
                          <span className="badge badge-income" style={{ fontSize: '0.65rem' }}>
                            <Sparkles size={10} style={{ marginRight: '3px' }} /> Hoàn thành
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Area */}
                    <div className="card-actions">
                      <button 
                        className="btn btn-success btn-savings-action" 
                        onClick={() => openTransactionModal(goal, 'DEPOSIT')}
                        disabled={isCompleted}
                      >
                        <ArrowUpRight size={16} />
                        <span>Tích lũy</span>
                      </button>
                      <button 
                        className="btn btn-secondary btn-savings-action" 
                        onClick={() => openTransactionModal(goal, 'WITHDRAW')}
                        disabled={goal.current_amount <= 0}
                      >
                        <ArrowDownLeft size={16} />
                        <span>Rút tiền</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Tạo mục tiêu mới */}
      {goalModalOpen && (
        <div className="modal-backdrop" onClick={openCreateGoalModal}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thiết lập Mục tiêu mới</h2>
              <button className="modal-close-btn" onClick={() => setGoalModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateGoal}>
              {goalError && (
                <div className="error-alert">
                  <AlertCircle size={16} />
                  <span>{goalError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tên mục tiêu</label>
                <input 
                  type="text" 
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Ví dụ: Mua laptop mới, Quỹ du lịch..."
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số tiền cần tích lũy (VND)</label>
                <input 
                  type="number" 
                  value={goalTarget || ''}
                  onChange={(e) => setGoalTarget(parseFloat(e.target.value))}
                  placeholder="Nhập số tiền mục tiêu"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ngày dự kiến hoàn thành</label>
                <input 
                  type="date" 
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setGoalModalOpen(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={goalSubmitting}
                >
                  {goalSubmitting ? 'Đang tạo...' : 'Tạo mục tiêu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Giao dịch tích lũy / rút tiền */}
      {txModalOpen && selectedGoal && (
        <div className="modal-backdrop" onClick={() => setTxModalOpen(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{txType === 'DEPOSIT' ? 'Nạp tiền tích lũy' : 'Rút tiền tiết kiệm'}</h2>
              <button className="modal-close-btn" onClick={() => setTxModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleTransactionSubmit}>
              <div className="goal-summary-modal" style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mục tiêu: <strong>{selectedGoal.name}</strong></p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Số dư hiện tại: <strong>{formatCurrency(selectedGoal.current_amount)}</strong></p>
              </div>

              {txError && (
                <div className="error-alert">
                  <AlertCircle size={16} />
                  <span>{txError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Số tiền giao dịch (VND)</label>
                <input 
                  type="number" 
                  value={txAmount || ''}
                  onChange={(e) => setTxAmount(parseFloat(e.target.value))}
                  placeholder="Nhập số tiền giao dịch"
                  className="form-input"
                  required
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setTxModalOpen(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className={`btn ${txType === 'DEPOSIT' ? 'btn-success' : 'btn-primary'}`}
                  disabled={txSubmitting}
                >
                  {txSubmitting 
                    ? 'Đang xử lý...' 
                    : (txType === 'DEPOSIT' ? 'Tích lũy' : 'Rút tiền')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
