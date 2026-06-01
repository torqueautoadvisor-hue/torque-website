'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteClaimRecord } from '../../actions/claim';

export default function ClaimListClient({
  records,
  staffList,
  isAdmin,
  branchId,
  initialStrdate = '',
  initialEnddate = '',
  flag = '',
}: {
  records: any[];
  staffList: any[];
  isAdmin: boolean;
  branchId: number;
  initialStrdate?: string;
  initialEnddate?: string;
  flag?: string;
}) {
  const router = useRouter();

  // Search parameters state
  const [strdate, setStrdate] = useState(initialStrdate);
  const [enddate, setEnddate] = useState(initialEnddate);

  // DataTable pagination & search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [executing, setExecuting] = useState(false);

  // Handles Search Action
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strdate || !enddate) {
      alert('Please select both From and To dates.');
      return;
    }
    router.push(`/claims?strdate=${strdate}&enddate=${enddate}`);
  };

  // Single Delete action
  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Are you sure want to delete?')) return;
    setExecuting(true);
    const res = await deleteClaimRecord(id);
    setExecuting(false);
    if (res.success) {
      router.refresh();
      if (res.redirect) router.push(res.redirect);
    } else {
      alert(res.error || 'Failed to delete record.');
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
      (row.clm_no || '').toLowerCase().includes(term) ||
      (row.clm_regno || '').toLowerCase().includes(term) ||
      (row.clm_name || '').toLowerCase().includes(term) ||
      (row.clm_contact || '').toLowerCase().includes(term) ||
      (row.adm_username || '').toLowerCase().includes(term)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const getActionDisplay = (action: string) => {
    if (action === '1') {
      return { text: 'Pending', style: { color: 'red', fontWeight: 'bold' } };
    } else if (action === '2') {
      return { text: 'Settled', style: { color: 'green', fontWeight: 'bold' } };
    } else if (action === '3') {
      return { text: 'Partially Settled', style: { color: 'green', fontWeight: 'bold' } };
    } else if (action === '4') {
      return { text: 'Rejected', style: { color: 'red', fontWeight: 'bold' } };
    }
    return { text: 'Unknown', style: { color: 'gray' } };
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-table"></i> Claim List</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li className="active">Claim List</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="panel panel-default">
          <div className="panel-body">
            {/* Action Alert Banner */}
            {flag === '1' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Claim details added successfully.</p>}
            {flag === '2' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Claim details updated successfully.</p>}
            {flag === '3' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Claim details deleted successfully.</p>}
            {flag === '4' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Claim details assign action applied successfully.</p>}
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

            {/* Search Grid Controls */}
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div></div>
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
                <a href="/claims/add" className="btn btn-success" style={{ padding: '6px 12px' }}>
                  <i className="fa fa-plus"></i> Add Claim
                </a>
              </div>
            </div>

            {/* Data Table */}
            <div className="table-responsive">
              <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                  <tr>
                    <th style={{ width: '5%' }}>ID</th>
                    <th style={{ width: '10%' }}>Date</th>
                    <th style={{ width: '10%' }}>Accident Date</th>
                    <th style={{ width: '12%' }}>Claim No</th>
                    <th style={{ width: '10%' }}>Amount</th>
                    <th style={{ width: '12%' }}>Reg No.</th>
                    <th style={{ width: '15%' }}>Name</th>
                    <th style={{ width: '10%' }}>Contact</th>
                    <th style={{ width: '10%' }}>Assign</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((row) => {
                      const actionStatus = getActionDisplay(row.clm_action);
                      return (
                        <tr key={row.clm_id} className="odd gradeX">
                          <td>{row.clm_id}</td>
                          <td>{getRecordDateValue(row.clm_date)}</td>
                          <td>{getRecordDateValue(row.clm_accident)}</td>
                          <td>{row.clm_no}</td>
                          <td>{row.clm_amount}</td>
                          <td>{row.clm_regno}</td>
                          <td>
                            <a href={`/claims/edit?clm_id=${row.clm_id}`} style={{ color: 'green', textDecoration: 'underline' }}>
                              {row.clm_name}
                            </a>
                          </td>
                          <td>{row.clm_contact}</td>
                          <td>{row.adm_username || ''}</td>
                          <td style={actionStatus.style}>{actionStatus.text}</td>
                          <td style={{ textAlign: 'center' }}>
                            <a href={`/claims/documents?clm_id=${row.clm_id}`} title="Documents" style={{ color: '#333', marginRight: '8px' }}>
                              <i className="fa fa-image"></i>
                            </a>
                            <span style={{ color: '#ccc', marginRight: '8px' }}>|</span>
                            <a href={`/claims/edit?clm_id=${row.clm_id}`} title="Edit" style={{ color: 'green', marginRight: '8px' }}>
                              <i className="fa fa-pen"></i>
                            </a>
                            {isAdmin && (
                              <>
                                <span style={{ color: '#ccc', marginRight: '8px' }}>|</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord(row.clm_id)}
                                  title="Delete"
                                  style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                  disabled={executing}
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
