'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteFitperRecord } from '../../actions/fitper';

export default function FitperListClient({
  records,
  isAdmin,
  branchId,
  flag = '',
}: {
  records: any[];
  isAdmin: boolean;
  branchId: number;
  flag?: string;
}) {
  const router = useRouter();
  const [executing, setExecuting] = useState(false);

  // DataTable pagination & search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Single Delete action
  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Are you sure want to delete?')) return;
    setExecuting(true);
    const res = await deleteFitperRecord(id);
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
      (row.fp_regno || '').toLowerCase().includes(term) ||
      (row.fp_name || '').toLowerCase().includes(term) ||
      (row.fp_code_no || '').toLowerCase().includes(term)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-table"></i> Fitness & Permit List</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/rto">RTO Dashboard</a></li>
            <li className="active">Fitness & Permit List</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="panel panel-default">
          <div className="panel-body">
            {/* Action Alert Banner */}
            {flag === '1' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Fitness & Permit details added successfully.</p>}
            {flag === '2' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Fitness & Permit details updated successfully.</p>}
            {flag === '3' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Fitness & Permit details deleted successfully.</p>}
            {flag === '5' && <p className="mb20" style={{ color: 'red', fontWeight: 'bold' }}>Something went wrong.</p>}

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
                <a href="/fitness/add" className="btn btn-success" style={{ padding: '6px 12px' }}>
                  <i className="fa fa-plus"></i> Add Fitness & Permit PDF
                </a>
              </div>
            </div>

            {/* Data Table */}
            <div className="table-responsive">
              <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                  <tr>
                    <th style={{ width: '5%' }}>ID</th>
                    <th style={{ width: '15%' }}>Date</th>
                    <th style={{ width: '15%' }}>Code</th>
                    <th style={{ width: '20%' }}>Register No</th>
                    <th style={{ width: '25%' }}>Name</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((row) => {
                      return (
                        <tr key={row.fp_id} className="odd gradeX">
                          <td>{row.fp_id}</td>
                          <td>{getRecordDateValue(row.fp_date)}</td>
                          <td>{row.fp_code_no}</td>
                          <td>{row.fp_regno}</td>
                          <td>
                            <a href={`/fitness/edit?fp_id=${row.fp_id}`} style={{ color: 'green', textDecoration: 'underline' }}>
                              {row.fp_name}
                            </a>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {row.fp_pdf ? (
                              <a href={row.fp_pdf} target="_blank" rel="noopener noreferrer" title="View PDF" style={{ color: '#333', marginRight: '8px' }}>
                                <i className="fa fa-file-pdf"></i> View PDF
                              </a>
                            ) : (
                              <span style={{ color: 'gray', marginRight: '8px', fontStyle: 'italic' }}>No PDF</span>
                            )}
                            <span style={{ color: '#ccc', marginRight: '8px' }}>|</span>
                            <a href={`/fitness/edit?fp_id=${row.fp_id}`} title="Edit" style={{ color: 'green', marginRight: '8px' }}>
                              <i className="fa fa-pen"></i>
                            </a>
                            {isAdmin && (
                              <>
                                <span style={{ color: '#ccc', marginRight: '8px' }}>|</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord(row.fp_id)}
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
