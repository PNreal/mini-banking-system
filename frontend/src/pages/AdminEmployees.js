import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const formatDate = (date) =>
  new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const AdminEmployees = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    phone: '',
    position: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Demo data - sẽ thay bằng API call thực tế
      setTimeout(() => {
        setEmployees([
          {
            employeeId: 'emp-1',
            employeeCode: 'NV001',
            fullName: 'Nguyễn Văn A',
            email: 'nva@minibank.com',
            phone: '0901234567',
            position: 'Nhân viên giao dịch',
            status: 'ACTIVE',
            createdAt: '2025-01-01T10:00:00Z',
            counterName: 'Quầy 1',
          },
          {
            employeeId: 'emp-2',
            employeeCode: 'NV002',
            fullName: 'Trần Thị B',
            email: 'ttb@minibank.com',
            phone: '0902345678',
            position: 'Nhân viên giao dịch',
            status: 'ACTIVE',
            createdAt: '2025-01-02T11:00:00Z',
            counterName: 'Quầy 2',
          },
          {
            employeeId: 'emp-3',
            employeeCode: 'NV003',
            fullName: 'Lê Văn C',
            email: 'lvc@minibank.com',
            phone: '0903456789',
            position: 'Trưởng quầy',
            status: 'INACTIVE',
            createdAt: '2025-01-03T12:00:00Z',
            counterName: 'Quầy 1',
          },
          {
            employeeId: 'emp-4',
            employeeCode: 'NV004',
            fullName: 'Phạm Thị D',
            email: 'ptd@minibank.com',
            phone: '0904567890',
            position: 'Nhân viên giao dịch',
            status: 'ACTIVE',
            createdAt: '2025-01-04T13:00:00Z',
            counterName: 'Quầy 3',
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load employees:', error);
      alert('Lỗi khi tải danh sách nhân viên: ' + error.message);
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setFormData({
      employeeCode: '',
      fullName: '',
      email: '',
      phone: '',
      position: '',
      status: 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeCode: employee.employeeCode || '',
      fullName: employee.fullName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position || '',
      status: employee.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      return;
    }

    setActionLoading(`delete-${employeeId}`);
    try {
      // Demo - sẽ thay bằng API call thực tế
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setEmployees((prev) => prev.filter((e) => e.employeeId !== employeeId));
      alert('Xóa nhân viên thành công');
    } catch (error) {
      alert('Lỗi khi xóa nhân viên: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('save');
    try {
      // Demo - sẽ thay bằng API call thực tế
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (editingEmployee) {
        setEmployees((prev) =>
          prev.map((e) =>
            e.employeeId === editingEmployee.employeeId
              ? { ...e, ...formData }
              : e
          )
        );
        alert('Cập nhật nhân viên thành công');
      } else {
        const newEmployee = {
          employeeId: `emp-${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString(),
          counterName: 'Chưa phân bổ',
        };
        setEmployees((prev) => [...prev, newEmployee]);
        alert('Thêm nhân viên thành công');
      }
      setShowModal(false);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (employee) => {
    const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';
    
    if (!window.confirm(`Xác nhận ${action} nhân viên này?`)) {
      return;
    }

    setActionLoading(`toggle-${employee.employeeId}`);
    try {
      // Demo - sẽ thay bằng API call thực tế
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setEmployees((prev) =>
        prev.map((e) =>
          e.employeeId === employee.employeeId
            ? { ...e, status: newStatus }
            : e
        )
      );
      alert(`Đã ${action} nhân viên thành công`);
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-success',
      INACTIVE: 'bg-secondary',
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ACTIVE: 'Hoạt động',
      INACTIVE: 'Ngừng hoạt động',
    };
    return labels[status] || status;
  };

  const filteredEmployees = employees.filter((e) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      e.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phone?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-employees-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="btn btn-outline-secondary btn-sm mb-2"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Link>
          <h1 className="h3 mb-0">Quản lý nhân viên</h1>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="fas fa-plus me-2"></i>
          Thêm nhân viên mới
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Tổng nhân viên</h6>
                  <h3 className="mb-0">{employees.length}</h3>
                </div>
                <i className="fas fa-users fa-2x text-primary opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Đang hoạt động</h6>
                  <h3 className="mb-0 text-success">
                    {employees.filter((e) => e.status === 'ACTIVE').length}
                  </h3>
                </div>
                <i className="fas fa-user-check fa-2x text-success opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Ngừng hoạt động</h6>
                  <h3 className="mb-0 text-secondary">
                    {employees.filter((e) => e.status === 'INACTIVE').length}
                  </h3>
                </div>
                <i className="fas fa-user-times fa-2x text-secondary opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Chưa phân bổ</h6>
                  <h3 className="mb-0 text-warning">
                    {employees.filter((e) => !e.counterName || e.counterName === 'Chưa phân bổ').length}
                  </h3>
                </div>
                <i className="fas fa-user-slash fa-2x text-warning opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Lọc theo trạng thái</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label">Tìm kiếm</label>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo mã, tên, email hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="mb-0 fw-bold text-secondary">Danh sách nhân viên</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Mã nhân viên</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Chức vụ</th>
                  <th>Quầy</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      Không tìm thấy nhân viên nào
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((e) => (
                    <tr key={e.employeeId}>
                      <td>
                        <strong className="text-primary">{e.employeeCode}</strong>
                      </td>
                      <td>{e.fullName}</td>
                      <td>{e.email}</td>
                      <td>{e.phone}</td>
                      <td>{e.position}</td>
                      <td>
                        {e.counterName && e.counterName !== 'Chưa phân bổ' ? (
                          <span className="badge bg-info">{e.counterName}</span>
                        ) : (
                          <span className="text-muted">Chưa phân bổ</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(e.status)}`}>
                          {getStatusLabel(e.status)}
                        </span>
                      </td>
                      <td>{formatDate(e.createdAt)}</td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(e)}
                            disabled={actionLoading}
                            title="Sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className={`btn btn-outline-${e.status === 'ACTIVE' ? 'warning' : 'success'}`}
                            onClick={() => handleToggleStatus(e)}
                            disabled={actionLoading === `toggle-${e.employeeId}`}
                            title={e.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            {actionLoading === `toggle-${e.employeeId}` ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <i className={`fas fa-${e.status === 'ACTIVE' ? 'ban' : 'check'}`}></i>
                            )}
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(e.employeeId)}
                            disabled={actionLoading === `delete-${e.employeeId}`}
                            title="Xóa"
                          >
                            {actionLoading === `delete-${e.employeeId}` ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <i className="fas fa-trash"></i>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal thêm/sửa nhân viên */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingEmployee ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="employeeCode" className="form-label">
                        Mã nhân viên <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="employeeCode"
                        required
                        value={formData.employeeCode}
                        onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                        placeholder="VD: NV001"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="fullName" className="form-label">
                        Họ và tên <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="VD: 0901234567"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="position" className="form-label">
                        Chức vụ
                      </label>
                      <select
                        className="form-select"
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      >
                        <option value="">Chọn chức vụ</option>
                        <option value="Nhân viên giao dịch">Nhân viên giao dịch</option>
                        <option value="Trưởng quầy">Trưởng quầy</option>
                        <option value="Giám sát">Giám sát</option>
                        <option value="Quản lý">Quản lý</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="status" className="form-label">
                        Trạng thái <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="status"
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={actionLoading === 'save'}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading === 'save'}
                  >
                    {actionLoading === 'save' ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;

