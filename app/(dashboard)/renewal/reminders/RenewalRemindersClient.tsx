'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteRenewalRecord, bulkActionRenewalRecords } from '../../../actions/renewal';

const formatDate = (dateVal: string) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

export default function RenewalRemindersClient({
  records,
  staffList,
  isAdmin,
  branchId,
}: {
  records: any[];
  staffList: any[];
  isAdmin: boolean;
  branchId: number;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionType, setActionType] = useState('');
  const [executing, setExecuting] = useState(false);

  // DataTable pagination & search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Checkbox management
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredRecords.map((r) => r.ren_id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Single Delete
  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Are you sure want to delete?')) return;
    setExecuting(true);
    const res = await deleteRenewalRecord(id);
    setExecuting(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete record.');
    }
  };

  // Bulk Actions
  const handleBulkActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionType) {
      alert('Please select a Staff member.');
      return;
    }
    if (selectedIds.length === 0) {
      alert('Please check at least one record.');
      return;
    }

    if (!confirm(`Are you sure you want to bulk re-assign ${selectedIds.length} selected records?`)) {
      return;
    }

    setExecuting(true);
    const res = await bulkActionRenewalRecords(actionType, selectedIds);
    setExecuting(false);

    if (res.success) {
      setSelectedIds([]);
      router.refresh();
    } else {
      alert(res.error || 'Bulk action failed.');
    }
  };

  // Search & Filter Records
  const filteredRecords = records.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      (row.ren_series || '').toLowerCase().includes(term) ||
      (row.ren_reg_no || '').toLowerCase().includes(term) ||
      (row.ren_name || '').toLowerCase().includes(term) ||
      (row.ren_contact || '').toLowerCase().includes(term) ||
      (row.ren_vmodel || '').toLowerCase().includes(term) ||
      (row.adm_username || '').toLowerCase().includes(term)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const getStatusDisplay = (row: any) => {
    if (row.ren_action === '1') {
      return { text: 'Confirmed', style: { color: 'green', fontWeight: 'bold' } };
    } else if (row.ren_action === '2') {
      return { text: `Rejected - ${row.rej_res_name || ''}`, style: { color: 'red', fontWeight: 'bold' } };
    } else {
      return { text: 'Completed', style: { color: 'green', fontWeight: 'bold' } };
    }
  };

  const renderReminderDateCell = (dateVal: string) => {
    if (!dateVal) return <td></td>;
    const d = new Date(dateVal);
    d.setHours(0, 0, 0, 0);

    const isFuture = d > today;
    const isToday = d.getTime() === today.getTime();

    const color = isFuture ? 'green' : 'red';
    const cellClass = isToday ? 'blink_me' : '';

    return (
      <td className={cellClass} style={{ color, fontWeight: 'bold' }}>
        {formatDate(dateVal)}
      </td>
    );
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-table"></i> Renewal Reminder</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li className="active">Renewal Reminder</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="panel panel-default">
          <div className="panel-body">
            {/* Bulk Action Controls */}
            <form onSubmit={handleBulkActionSubmit}>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', marginTop: '10px' }}>
                  <select
                    className="form-control"
                    style={{ width: '250px', height: '40px' }}
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    required
                  >
                    <option value="">Select Staff</option>
                    {staffList.map((staff) => (
                      <option key={staff.adm_id} value={staff.adm_id.toString()}>
                        {staff.adm_username}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn btn-default" style={{ height: '40px' }} disabled={executing}>
                    Submit Bulk Reassign
                  </button>
                </div>
              )}

              {/* Select All / Search */}
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={filteredRecords.length > 0 && selectedIds.length === filteredRecords.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  )}
                  <strong>Select All</strong>
                </div>

                <input
                  type="text"
                  placeholder="Search Grid..."
                  className="form-control"
                  style={{ width: '250px', height: '34px' }}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Data Table */}
              <div className="table-responsive">
                <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                  <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                    <tr>
                      {isAdmin && <th style={{ width: '5%', textAlign: 'center' }}>Select</th>}
                      <th style={{ width: '5%' }}>Series</th>
                      <th style={{ width: '10%' }}>Insurance Date</th>
                      <th style={{ width: '10%' }}>Permit Date</th>
                      <th style={{ width: '10%' }}>National Permit Date</th>
                      <th style={{ width: '10%' }}>Register No.</th>
                      <th style={{ width: '15%' }}>Name</th>
                      <th style={{ width: '10%' }}>Contact</th>
                      <th style={{ width: '10%' }}>Model</th>
                      <th style={{ width: '8%' }}>Assign</th>
                      <th style={{ width: '8%' }}>Status</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 12 : 11} className="text-center">
                          No reminders found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((row) => {
                        const status = getStatusDisplay(row);
                        return (
                          <tr key={row.ren_id} className="odd gradeX">
                            {isAdmin && (
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(row.ren_id)}
                                  onChange={(e) => handleSelectRow(row.ren_id, e.target.checked)}
                                />
                              </td>
                            )}
                            <td>{row.ren_series}</td>
                            {renderReminderDateCell(row.ren_insurance_date)}
                            {renderReminderDateCell(row.ren_permit_date)}
                            {renderReminderDateCell(row.ren_nat_permit_date)}
                            <td>{row.ren_reg_no}</td>
                            <td>
                              <a href={`/renewal/edit?ren_id=${row.ren_id}`} style={{ color: 'green', textDecoration: 'underline' }}>
                                {row.ren_name}
                              </a>
                            </td>
                            <td>{row.ren_contact}</td>
                            <td>{row.ren_vmodel}</td>
                            <td>{row.adm_username || ''}</td>
                            <td style={status.style}>{status.text}</td>
                            <td style={{ textAlign: 'center' }}>
                              <a href={`/renewal/followup?ren_id=${row.ren_id}`} title="Follow Up" style={{ color: '#1C1B17', marginRight: '8px' }}>
                                <i className="fa fa-comment"></i>
                              </a>
                              <span style={{ color: '#ccc', marginRight: '8px' }}>|</span>
                              <a href={`/renewal/documents?ren_id=${row.ren_id}`} title="Documents" style={{ color: '#333', marginRight: '8px' }}>
                                <i className="fa fa-image"></i>
                              </a>
                              <span style={{ color: '#ccc', marginRight: '8px' }}>|</span>
                              <a href={`/renewal/edit?ren_id=${row.ren_id}`} title="Edit" style={{ color: 'green', marginRight: '8px' }}>
                                <i className="fa fa-pen"></i>
                              </a>
                              {isAdmin && (
                                <>
                                  <span style={{ color: '#ccc', marginRight: '8px' }}>|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRecord(row.ren_id)}
                                    title="Delete"
                                    style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                  >
                                    <i className="fa fa-trash"></i>
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </form>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <div>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length} entries
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    className="btn btn-default btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-default'}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="btn btn-default btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
