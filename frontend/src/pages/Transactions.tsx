import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  X,
  AlertCircle,
  Download
} from 'lucide-react';
import * as Icons from 'lucide-react';

import { TransactionService } from '../services/transaction/transaction.service';
import { CategoryService } from '../services/category/category.service';
import type { Transaction, TransactionCreate } from '../services/transaction/types';
import type { Category } from '../services/category/types';
import { TRANSACTION_ERRORS } from '../services/transaction/constant';
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
    return <Fallback size={18} style={{ color }} />;
  }
  return <IconComponent size={18} style={{ color }} />;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Bộ lọc
  const [filterType, setFilterType] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Trạng thái Modal (Thêm/Sửa)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  
  // Trường dữ liệu Form
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txType, setTxType] = useState<string>('EXPENSE');
  const [txCategory, setTxCategory] = useState<string>('');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [txDesc, setTxDesc] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterType) filters.type = filterType;
      if (filterCategory) filters.category_id = filterCategory;
      if (startDate) filters.start_date = new Date(startDate).toISOString();
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        filters.end_date = d.toISOString();
      }
      
      const data = await TransactionService.getTransactions(filters);
      setTransactions(data);
    } catch (error) {
      console.error('Lỗi khi tải giao dịch:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await CategoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterCategory, startDate, endDate]);

  // Khi thay đổi loại Thu/Chi trong form, chọn danh mục mặc định đầu tiên của loại đó
  useEffect(() => {
    const filteredCats = categories.filter(c => c.type === txType);
    if (filteredCats.length > 0 && !modalOpen) {
      setTxCategory(filteredCats[0].id);
    }
  }, [txType, categories]);

  const openAddModal = () => {
    setModalType('ADD');
    setTxAmount(0);
    setTxType('EXPENSE');
    const expenseCats = categories.filter(c => c.type === 'EXPENSE');
    setTxCategory(expenseCats.length > 0 ? expenseCats[0].id : '');
    setTxDate(new Date().toISOString().substring(0, 10));
    setTxDesc('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setModalType('EDIT');
    setSelectedTxId(tx.id);
    setTxAmount(tx.amount);
    setTxType(tx.type);
    setTxCategory(tx.category_id);
    setTxDate(new Date(tx.date).toISOString().substring(0, 10));
    setTxDesc(tx.description || '');
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTxId(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0) {
      setFormError(TRANSACTION_ERRORS.AMOUNT_INVALID);
      return;
    }
    if (!txCategory) {
      setFormError(TRANSACTION_ERRORS.CATEGORY_REQUIRED);
      return;
    }

    const payload: TransactionCreate = {
      amount: txAmount,
      type: txType,
      category_id: txCategory,
      date: new Date(txDate).toISOString(),
      description: txDesc
    };

    try {
      setFormSubmitting(true);
      setFormError(null);
      if (modalType === 'ADD') {
        await TransactionService.createTransaction(payload);
      } else {
        await TransactionService.updateTransaction(selectedTxId!, payload);
      }
      closeModal();
      fetchTransactions();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || 'Không thể lưu giao dịch.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (window.confirm(COMMON_CONFIRMATIONS.DELETE_TRANSACTION)) {
      try {
        await TransactionService.deleteTransaction(id);
        fetchTransactions();
      } catch (error) {
        console.error('Không thể xóa giao dịch:', error);
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const filters: any = {};
      if (filterType) filters.type = filterType;
      if (filterCategory) filters.category_id = filterCategory;
      if (startDate) filters.start_date = new Date(startDate).toISOString();
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        filters.end_date = d.toISOString();
      }
      
      const blob = await TransactionService.exportTransactions(filters);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `giao_dich_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Lỗi khi xuất file CSV:', error);
      alert('Không thể xuất báo cáo giao dịch.');
    }
  };

  const filteredCategoriesForForm = categories.filter(c => c.type === txType);

  return (
    <div className="transactions-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Danh sách giao dịch</h1>
          <p className="subtitle">Quản lý các khoản thu và chi tiêu hàng ngày</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={18} />
            <span>Xuất CSV</span>
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>Thêm giao dịch</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card filter-bar fade-in">
        <div className="filter-item">
          <label className="form-label">Loại</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="form-input form-select"
          >
            <option value="">Tất cả</option>
            <option value="INCOME">Thu nhập (+)</option>
            <option value="EXPENSE">Chi tiêu (-)</option>
          </select>
        </div>

        <div className="filter-item">
          <label className="form-label">Danh mục</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-input form-select"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.type === 'INCOME' ? '🔼' : '🔻'} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label className="form-label">Từ ngày</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="filter-item">
          <label className="form-label">Đến ngày</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Transactions Table/Content */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <span>Đang truy xuất dữ liệu giao dịch...</span>
        </div>
      ) : (
        <div className="glass-card table-panel fade-in">
          {transactions.length > 0 ? (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Giao dịch</th>
                    <th>Danh mục</th>
                    <th>Ghi chú</th>
                    <th>Thời gian</th>
                    <th style={{ textAlign: 'right' }}>Số tiền</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>
                        <div className="tx-type-indicator">
                          {tx.type === 'INCOME' ? (
                            <div className="indicator-icon bg-success-light">
                              <ArrowUpRight size={16} className="text-success" />
                            </div>
                          ) : (
                            <div className="indicator-icon bg-danger-light">
                              <ArrowDownLeft size={16} className="text-danger" />
                            </div>
                          )}
                          <span style={{ fontWeight: 600 }}>
                            {tx.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="tx-category-badge" style={{ borderColor: tx.category?.color }}>
                          <span className="dot" style={{ backgroundColor: tx.category?.color }} />
                          {getIconComponent(tx.category?.icon || 'help-circle', tx.category?.color)}
                          <span style={{ marginLeft: '0.4rem' }}>{tx.category?.name || 'Khác'}</span>
                        </span>
                      </td>
                      <td className="tx-description-cell">
                        {tx.description || <span className="text-muted" style={{ fontStyle: 'italic' }}>Không có ghi chú</span>}
                      </td>
                      <td>
                        <span className="tx-date-cell">
                          {new Date(tx.date).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }} className={tx.type === 'INCOME' ? 'text-success' : 'text-danger'}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons">
                          <button className="action-btn edit" onClick={() => openEditModal(tx)}>
                            <Edit2 size={15} />
                          </button>
                          <button className="action-btn delete" onClick={() => handleDeleteTx(tx.id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-panel-content">
              <p>Không tìm thấy giao dịch nào trùng khớp với bộ lọc của bạn</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>{modalType === 'ADD' ? 'Thêm giao dịch mới' : 'Cập nhật giao dịch'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="auth-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={20} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              {/* Loại giao dịch */}
              <div className="form-group">
                <label className="form-label">Loại giao dịch</label>
                <div className="type-toggle-group">
                  <button 
                    type="button"
                    className={`type-toggle-btn income ${txType === 'INCOME' ? 'active' : ''}`}
                    onClick={() => setTxType('INCOME')}
                  >
                    Thu nhập (+)
                  </button>
                  <button 
                    type="button"
                    className={`type-toggle-btn expense ${txType === 'EXPENSE' ? 'active' : ''}`}
                    onClick={() => setTxType('EXPENSE')}
                  >
                    Chi tiêu (-)
                  </button>
                </div>
              </div>

              {/* Số tiền */}
              <div className="form-group">
                <label className="form-label">Số tiền (đ)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="50,000"
                  value={txAmount || ''}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  required
                  min="1"
                  disabled={formSubmitting}
                />
              </div>

              {/* Danh mục */}
              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select 
                  className="form-input form-select"
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  required
                  disabled={formSubmitting}
                >
                  <option value="" disabled>-- Chọn danh mục --</option>
                  {filteredCategoriesForForm.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Ngày */}
              <div className="form-group">
                <label className="form-label">Ngày thực hiện</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  required
                  disabled={formSubmitting}
                />
              </div>

              {/* Ghi chú */}
              <div className="form-group">
                <label className="form-label">Ghi chú / Mô tả</label>
                <textarea 
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Mua cà phê, Ăn trưa..."
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  disabled={formSubmitting}
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={closeModal}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formSubmitting}>
                  {formSubmitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled Components */}
      <style>{`
        .filter-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1.25rem !important;
        }
        
        .tx-type-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .indicator-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bg-success-light { background-color: rgba(16, 185, 129, 0.1); }
        .bg-danger-light { background-color: rgba(239, 68, 68, 0.1); }
        
        .tx-category-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid;
          background-color: rgba(255,255,255,0.02);
        }
        .tx-category-badge .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }
        
        .tx-description-cell {
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        .action-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          background-color: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .action-btn.delete:hover {
          background-color: var(--color-danger-bg);
          color: var(--color-danger);
        }
        .action-btn.edit:hover {
          background-color: var(--color-info-bg);
          color: var(--color-info);
        }
        
        /* Modal Type Toggle Buttons */
        .type-toggle-group {
          display: flex;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .type-toggle-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }
        .type-toggle-btn.income.active {
          background-color: var(--color-success);
          color: white;
        }
        .type-toggle-btn.expense.active {
          background-color: var(--color-danger);
          color: white;
        }
        
        @media (max-width: 768px) {
          .filter-bar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Transactions;
