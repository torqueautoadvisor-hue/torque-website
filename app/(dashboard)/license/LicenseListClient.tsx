'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteRtoRecord, bulkActionRtoRecords } from '../../actions/rto';

export default function LicenseListClient({
  records,
  staffList,
  isAdmin,
  branchId,
  initialStrdate = '',
  initialEnddate = '',
  totalAmount = 0,
  totalCredit = 0,
  totalDebit = 0,
  flag = '',
}: {
  records: any[];
  staffList: any[];
  isAdmin: boolean;
  branchId: number;
  initialStrdate?: string;
  initialEnddate?: string;
  totalAmount?: number;
  totalCredit?: number;
  totalDebit?: number;
  flag?: string;
}) {
  const router = useRouter();

  // Search parameters state
  const [strdate, setStrdate] = useState(initialStrdate);
  const [enddate, setEnddate] = useState(initialEnddate);

  // Checked rows for bulk action
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionType, setActionType] = useState('');
  const [executing, setExecuting] = useState(false);

  // DataTable pagination & search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handles Search Action
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strdate || !enddate) {
      alert('Please select both From and To dates.');
      return;
    }
    router.push(`/license?strdate=${strdate}&enddate=${enddate}`);
  };

  // Checkbox management
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredRecords.map((r) => r.rto_id);
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

  // Single Delete action
  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Are you sure want to delete?')) return;
    setExecuting(true);
    const res = await deleteRtoRecord(id, 1); // serviceId = 1 (License)
    setExecuting(false);
    if (res.success) {
      router.refresh();
      if (res.redirect) router.push(res.redirect);
    } else {
      alert(res.error || 'Failed to delete record.');
    }
  };

  // Bulk Actions
  const handleBulkActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionType) {
      alert('Please select a Staff member or Delete action.');
      return;
    }
    if (selectedIds.length === 0) {
      alert('Please check at least one record.');
      return;
    }

    const actionText = actionType === 'DELETE' ? 'delete' : 're-assign';
    if (!confirm(`Are you sure you want to bulk ${actionText} ${selectedIds.length} selected records?`)) {
      return;
    }

    setExecuting(true);
    const res = await bulkActionRtoRecords(1, actionType, selectedIds);
    setExecuting(false);

    if (res.success) {
      setSelectedIds([]);
      router.refresh();
      if (res.redirect) router.push(res.redirect);
    } else {
      alert(res.error || 'Bulk action failed.');
    }
  };

  const getRecordDateValue = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  // Search & Filter Records
  const filteredRecords = records.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      (row.rto_regno || '').toLowerCase().includes(term) ||
      (row.rto_name || '').toLowerCase().includes(term) ||
      (row.rto_contact || '').toLowerCase().includes(term) ||
      (row.adm_username || '').toLowerCase().includes(term)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const getActionDisplay = (row: any) => {
    if (row.rto_action === '1') {
      return { text: 'Pending', style: { color: 'red', fontWeight: 'bold' } };
    } else if (row.rto_action === '2') {
      return { text: 'Completed', style: { color: 'green', fontWeight: 'bold' } };
    }
    return { text: 'Unknown', style: { color: 'gray' } };
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-table"></i> License List</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/rto">RTO Dashboard</a></li>
            <li className="active">License List</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        {/* Aggregates Metrics Row */}
        <div className="row mb20" style={{ display: 'flex', gap: '15px' }}>
          <div className="col-md-4">
            <div className="panel panel-primary noborder" style={{ background: '#82c21f', color: '#fff', padding: '15px', borderRadius: '4px' }}>
              <h5 style={{ margin: 0, textTransform: 'uppercase' }}>Total Debit (Pending)</h5>
              <h2 style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>Rs. {totalDebit}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="panel panel-success noborder" style={{ background: '#4cae4c', color: '#fff', padding: '15px', borderRadius: '4px' }}>
              <h5 style={{ margin: 0, textTransform: 'uppercase' }}>Total Credit (Received)</h5>
              <h2 style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>Rs. {totalCredit}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="panel panel-info noborder" style={{ background: '#31b0d5', color: '#fff', padding: '15px', borderRadius: '4px' }}>
              <h5 style={{ margin: 0, textTransform: 'uppercase' }}>Grand Total Amount</h5>
              <h2 style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>Rs. {totalAmount}</h2>
            </div>
          </div>
        </div>

        <div className="panel panel-default">
          <div className="panel-body">
            {/* Action Alert Banner */}
            {flag === '1' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>License details added successfully.</p>}
            {flag === '2' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>License details updated successfully.</p>}
            {flag === '3' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>License details deleted successfully.</p>}
            {flag === '4' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>License details assign action applied successfully.</p>}
            {flag === '6' && <p className="mb20" style={{ color: 'red', fontWeight: 'bold' }}>License details deleted successfully.</p>}
            {flag === '5' && <p className="mb20" style={{ color: 'red', fontWeight: 'bold' }}>Something went wrong.</p>}

            {/* Filter Section */}
            <div className="row" style={{ margin: '0px 0px 20px 0px' }}>
              <div className="col-md-8">
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div>
                    <span>From Date:</span>
                    <input
                      style={{ lineHeight: '20px' }}
                      className="form-control"
                      type="date"
                      value={strdate}
                      onChange={(e) => setStrdate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <span>To Date:</span>
                    <input
                      style={{ lineHeight: '20px' }}
                      className="form-control"
                      type="date"
                      value={enddate}
                      onChange={(e) => setEnddate(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ alignSelf: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" style={{ height: '40px' }}>
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Bulk Action Controls */}
            <form onSubmit={handleBulkActionSubmit}>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', marginTop: '25px' }}>
                  <select
                    className="form-control"
                    style={{ width: '250px', height: '40px' }}
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    required
                  >
                    <option value="">Select Staff / Delete</option>
                    {staffList.map((staff) => (
                      <option key={staff.adm_id} value={staff.adm_id.toString()}>
                        {staff.adm_username}
                      </option>
                    ))}
                    <option value="DELETE" style={{ color: 'red' }}>
                      Delete Selected
                    </option>
                  </select>
                  <button type="submit" className="btn btn-default" style={{ height: '40px' }} disabled={executing}>
                    Submit Bulk Action
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

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                  <a href="/license/add" className="btn btn-success" style={{ padding: '6px 12px' }}>
                    <i className="fa fa-plus"></i> Add License
                  </a>
                </div>
              </div>

              {/* Data Table */}
              <div className="table-responsive">
                <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                  <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                    <tr>
                      {isAdmin && <th style={{ width: '5%', textAlign: 'center' }}>Select</th>}
                      <th style={{ width: '5%' }}>ID</th>
                      <th style={{ width: '10%' }}>Date</th>
                      <th style={{ width: '10%' }}>Due Date</th>
                      <th style={{ width: '15%' }}>Name</th>
                      <th style={{ width: '10%' }}>Contact</th>
                      <th style={{ width: '12%' }}>License No</th>
                      <th style={{ width: '10%' }}>Assign</th>
                      <th style={{ width: '8%' }}>Total</th>
                      <th style={{ width: '8%' }}>Received</th>
                      <th style={{ width: '8%' }}>Pending</th>
                      <th style={{ width: '10%' }}>Status</th>
                      <th style={{ width: '12%', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 13 : 12} className="text-center">
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((row) => {
                        const status = getActionDisplay(row);
                        return (
                          <tr key={row.rto_id} className="odd gradeX">
                            {isAdmin && (
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(row.rto_id)}
                                  onChange={(e) => handleSelectRow(row.rto_id, e.target.checked)}
                                />
                              </td>
                            )}
                            <td>{row.rto_id}</td>
                            <td>{getRecordDateValue(row.rto_date)}</td>
                            <td>{getRecordDateValue(row.rto_duedate)}</td>
                            <td>
                              <a href={`/license/edit?rto_id=${row.rto_id}`} style={{ color: 'green', textDecoration: 'underline' }}>
                                {row.rto_name}
                              </a>
                            </td>
                            <td>{row.rto_contact}</td>
                            <td>{row.rto_regno}</td>
                            <td>{row.adm_username || ''}</td>
                            <td>{row.rto_amount}</td>
                            <td style={{ color: 'green' }}>{row.rto_credit}</td>
                            <td style={{ color: 'red' }}>{row.rto_debit}</td>
                            <td style={status.style}>{status.text} {row.pen_res_name ? `- ${row.pen_res_name}` : ''}</td>
                            <td style={{ textAlign: 'center' }}>
                              <a href={`/license/documents?rto_id=${row.rto_id}`} title="Documents" style={{ color: '#333', marginRight: '8px' }}>
                                <i className="fa fa-image"></i>
                              </a>
                              <span style={{ color: '#ccc', marginRight: '8px' }}>|</span>
                              <a href={`/license/edit?rto_id=${row.rto_id}`} title="Edit" style={{ color: 'green', marginRight: '8px' }}>
                                <i className="fa fa-pen"></i>
                              </a>
                              {isAdmin && (
                                <>
                                  <span style={{ color: '#ccc', marginRight: '8px' }}>|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRecord(row.rto_id)}
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
