'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteChequeRecord } from '../../../actions/cheque';

export default function ChequeListClient({
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
    const res = await deleteChequeRecord(id);
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
      (row.chq_regno || '').toLowerCase().includes(term) ||
      (row.chq_no || '').toLowerCase().includes(term) ||
      (row.chq_bank || '').toLowerCase().includes(term) ||
      (row.chq_code_no || '').toLowerCase().includes(term)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const getDcActionDisplay = (action: number) => {
    if (action === 1) return { text: 'Cleared', style: { color: 'green', fontWeight: 'bold' } };
    if (action === 2) return { text: 'Bounced', style: { color: 'red', fontWeight: 'bold' } };
    if (action === 3) return { text: 'In Courier', style: { color: 'orange', fontWeight: 'bold' } };
    return { text: 'Pending', style: { color: 'gray' } };
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-table"></i> Cheque List</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li className="active">Cheque List</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="panel panel-default">
          <div className="panel-body">
            {/* Action Alert Banner */}
            {flag === '1' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Cheque details added successfully.</p>}
            {flag === '2' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Cheque details updated successfully.</p>}
            {flag === '3' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Cheque details deleted successfully.</p>}
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
                <a href="/sf/cheque/add" className="btn btn-success" style={{ padding: '6px 12px' }}>
                  <i className="fa fa-plus"></i> Add Cheque
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
                    <th style={{ width: '10%' }}>Code</th>
                    <th style={{ width: '12%' }}>Register No</th>
                    <th style={{ width: '12%' }}>Cheque No</th>
                    <th style={{ width: '15%' }}>Bank</th>
                    <th style={{ width: '10%' }}>Amount</th>
                    <th style={{ width: '12%' }}>Clear Status</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((row) => {
                      const dcStatus = getDcActionDisplay(parseInt(row.chq_dc_action) || 0);
                      return (
                        <tr key={row.chq_id} className="odd gradeX">
                          <td>{row.chq_id}</td>
                          <td>{getRecordDateValue(row.chq_date)}</td>
                          <td>{row.chq_code_no}</td>
                          <td>{row.chq_regno}</td>
                          <td>{row.chq_no}</td>
                          <td>
                            <a href={`/cheque/edit?chq_id=${row.chq_id}`} style={{ color: 'green', textDecoration: 'underline' }}>
                              {row.chq_bank}
                            </a>
                          </td>
                          <td>{row.chq_amount}</td>
                          <td style={dcStatus.style}>{dcStatus.text}</td>
                          <td style={{ textAlign: 'center' }}>
                            <a href={`/cheque/edit?chq_id=${row.chq_id}`} title="Edit" style={{ color: 'green', marginRight: '8px' }}>
                              <i className="fa fa-pen"></i>
                            </a>
                            {isAdmin && (
                              <>
                                <span style={{ color: '#ccc', marginRight: '8px' }}>|</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord(row.chq_id)}
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
