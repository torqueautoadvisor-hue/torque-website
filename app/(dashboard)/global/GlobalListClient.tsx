'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteGlobalRecord, bulkActionGlobalRecords } from '../../actions/global';

export default function GlobalListClient({
  records,
  staffList,
  isAdmin,
  branchId,
  initialStrdate = '',
  initialEnddate = '',
  initialDateType = '1',
  flag = '',
}: {
  records: any[];
  staffList: any[];
  isAdmin: boolean;
  branchId: number;
  initialStrdate?: string;
  initialEnddate?: string;
  initialDateType?: string;
  flag?: string;
}) {
  const router = useRouter();

  // Search parameters state
  const [strdate, setStrdate] = useState(initialStrdate);
  const [enddate, setEnddate] = useState(initialEnddate);
  const [dateType, setDateType] = useState(initialDateType);

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
    router.push(`/global?strdate=${strdate}&enddate=${enddate}&date_type=${dateType}`);
  };

  // Handles Excel Download
  const handleDownloadReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strdate || !enddate) {
      alert('Please select both From and To dates to download the report.');
      return;
    }
    // Direct link to download API or legacy exporter
    window.location.href = `/global_export.php?strdate=${strdate}&enddate=${enddate}&date_type=${dateType}`;
  };

  // Checkbox management
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredRecords.map((r) => r.glb_id);
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
    const res = await deleteGlobalRecord(id);
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
    const res = await bulkActionGlobalRecords(actionType, selectedIds);
    setExecuting(false);

    if (res.success) {
      setSelectedIds([]);
      router.refresh();
      if (res.redirect) router.push(res.redirect);
    } else {
      alert(res.error || 'Bulk action failed.');
    }
  };

  // Dynamic Date Header Title
  const dateTypeLabels: Record<string, string> = {
    '1': 'Insurance',
    '2': 'CF',
    '3': 'Registration',
    '4': 'Permit',
    '5': 'National Permit',
    '6': 'Tax',
  };
  const dateHeaderLabel = dateTypeLabels[dateType] || 'Insurance';

  // Dynamic record date field extractor
  const getRecordDateValue = (row: any) => {
    let dateStr = row.glb_date;
    if (dateType === '1') dateStr = row.glb_insurance_date;
    else if (dateType === '2') dateStr = row.glb_cf_date;
    else if (dateType === '3') dateStr = row.glb_reg_date;
    else if (dateType === '4') dateStr = row.glb_permit_date;
    else if (dateType === '5') dateStr = row.glb_nat_permit_date;
    else if (dateType === '6') dateStr = row.glb_tax_date;

    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  // Search & Filter Records
  const filteredRecords = records.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      (row.glb_series || '').toLowerCase().includes(term) ||
      (row.glb_reg_no || '').toLowerCase().includes(term) ||
      (row.glb_name || '').toLowerCase().includes(term) ||
      (row.glb_contact || '').toLowerCase().includes(term) ||
      (row.glb_vmodel || '').toLowerCase().includes(term) ||
      (row.adm_username || '').toLowerCase().includes(term)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const getStatusDisplay = (row: any) => {
    if (row.glb_action === '1') {
      return { text: 'Pending', style: { color: '#82c21f', fontWeight: 'bold' } };
    } else if (row.glb_action === '2') {
      return { text: `Rejected - ${row.rej_res_name || ''}`, style: { color: 'red', fontWeight: 'bold' } };
    } else {
      return { text: 'Completed', style: { color: 'green', fontWeight: 'bold' } };
    }
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-table"></i> Global List</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li className="active">Global List</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="panel panel-default">
          <div className="panel-body">
            {/* Action Alert Banner */}
            {flag === '1' && <p className="mb20" style={{ color: 'green', fontWeight: 'semibold' }}>Global details added successfully.</p>}
            {flag === '2' && <p className="mb20" style={{ color: 'green', fontWeight: 'semibold' }}>Global details updated successfully.</p>}
            {flag === '3' && <p className="mb20" style={{ color: 'green', fontWeight: 'semibold' }}>Global details deleted successfully.</p>}
            {flag === '4' && <p className="mb20" style={{ color: 'green', fontWeight: 'semibold' }}>Global details assign action applied successfully.</p>}
            {flag === '6' && <p className="mb20" style={{ color: 'red', fontWeight: 'semibold' }}>Global details deleted successfully.</p>}
            {flag === '5' && <p className="mb20" style={{ color: 'red', fontWeight: 'semibold' }}>Something went wrong.</p>}

            {/* Filter Section & Excel Upload */}
            <div className="row" style={{ margin: '0px 0px 20px 0px' }}>
              <div className="col-md-8">
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div>
                    <span>From Date:</span>
                    <input
                      style={{ lineHeight: '20px' }}
                      className="form-control"
                      type="date"
                      value={strdate}
                      onChange={(e) => setStrdate(e.target.value)}
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
                    />
                  </div>
                  <div>
                    <span>Date Type:</span>
                    <select
                      className="form-control"
                      style={{ width: '180px', height: '40px' }}
                      value={dateType}
                      onChange={(e) => setDateType(e.target.value)}
                    >
                      <option value="1">Insurance Date</option>
                      <option value="2">CF Date</option>
                      <option value="3">Registration Date</option>
                      <option value="4">Permit Date</option>
                      <option value="5">National Permit Date</option>
                      <option value="6">TAX Date</option>
                    </select>
                  </div>
                  <div style={{ alignSelf: 'flex-end' }}>
                    <button onClick={handleSearch} className="btn btn-primary" style={{ height: '40px', marginRight: '5px' }}>
                      Search
                    </button>
                    <button onClick={handleDownloadReport} className="btn btn-primary" style={{ height: '40px' }}>
                      Download Report
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                {isAdmin && (
                  <form method="POST" action="/global_excelUpload.php" encType="multipart/form-data">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <h5 style={{ margin: '0', fontWeight: 'bold' }}>
                        Upload Global Data by excel file <span className="asterisk">*</span>
                      </h5>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="file" name="file" required className="form-control" style={{ height: '40px' }} />
                        <button type="submit" name="submit_global_excel" className="btn btn-success" style={{ height: '40px' }}>
                          Upload
                        </button>
                      </div>
                      <a href="/images/Global-Sample.xls" style={{ fontSize: '12px', color: 'green', textDecoration: 'underline' }}>
                        Download sample xls file
                      </a>
                    </div>
                  </form>
                )}
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

              {/* Dynamic client-side search box */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {isAdmin && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        id="selectAllCheckbox"
                        checked={selectedIds.length > 0 && selectedIds.length === filteredRecords.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      Select All
                    </label>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>Search:</span>
                  <input
                    type="text"
                    placeholder="Search model, register no, name..."
                    className="form-control"
                    style={{ width: '250px', height: '35px' }}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="table-responsive">
                <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                  <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                    <tr>
                      {isAdmin && <th style={{ width: '5%' }}>Select</th>}
                      <th style={{ width: '5%' }}>Series</th>
                      <th style={{ width: '12%' }}>{dateHeaderLabel} Date</th>
                      <th style={{ width: '13%' }}>Register No.</th>
                      <th style={{ width: '15%' }}>Name</th>
                      <th style={{ width: '12%' }}>Contact</th>
                      <th style={{ width: '12%' }}>Model</th>
                      <th style={{ width: '10%' }}>Assign</th>
                      <th style={{ width: '13%' }}>Status</th>
                      <th style={{ width: '13%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 10 : 9} className="text-center">
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((row) => {
                        const status = getStatusDisplay(row);
                        return (
                          <tr key={row.glb_id} className="odd gradeX">
                            {isAdmin && (
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(row.glb_id)}
                                  onChange={(e) => handleSelectRow(row.glb_id, e.target.checked)}
                                />
                              </td>
                            )}
                            <td>{row.glb_series}</td>
                            <td>{getRecordDateValue(row)}</td>
                            <td>{row.glb_reg_no}</td>
                            <td>
                              <a title="Edit" style={{ color: 'green', fontWeight: 'semibold' }} href={`/global/edit?glb_id=${row.glb_id}`}>
                                {row.glb_name}
                              </a>
                            </td>
                            <td>{row.glb_contact}</td>
                            <td>{row.glb_vmodel}</td>
                            <td>{row.adm_username || ''}</td>
                            <td style={status.style}>{status.text}</td>
                            <td>
                              <code>
                                <a style={{ color: '#1C1B17', marginRight: '5px' }} title="Follow Up" href={`#follow-up?id=${row.glb_id}`}>
                                  <i className="fa fa-comment"></i>
                                </a>
                                {' | '}
                                <a style={{ color: '#333', marginRight: '5px' }} title="Documents" href={`/global/documents?glb_id=${row.glb_id}`}>
                                  <i className="fa fa-image"></i>
                                </a>
                                {' | '}
                                <a style={{ color: 'green', marginRight: '5px' }} title="Edit" href={`/global/edit?glb_id=${row.glb_id}`}>
                                  <i className="fa fa-pencil"></i>
                                </a>
                                {isAdmin && (
                                  <>
                                    {' | '}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteRecord(row.glb_id)}
                                      style={{ background: 'transparent', border: 'none', color: 'red', padding: '0' }}
                                      title="Delete"
                                      disabled={executing}
                                    >
                                      <i className="fa fa-trash"></i>
                                    </button>
                                  </>
                                )}
                              </code>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Client Pagination Footer */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '13px' }}>
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length} entries
                  </span>
                  <div className="pagination" style={{ display: 'flex', gap: '5px', margin: '0' }}>
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-default'}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
