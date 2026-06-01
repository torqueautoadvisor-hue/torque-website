'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteInquiryRecord } from '../../actions/inquiry';

export default function InquiryListClient({
  records,
  isAdmin,
  initialStrdate = '',
  initialEnddate = '',
  flag = '',
}: {
  records: any[];
  isAdmin: boolean;
  initialStrdate?: string;
  initialEnddate?: string;
  flag?: string;
}) {
  const router = useRouter();
  const [strdate, setStrdate] = useState(initialStrdate);
  const [enddate, setEnddate] = useState(initialEnddate);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [executing, setExecuting] = useState(false);
  const itemsPerPage = 10;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strdate || !enddate) {
      alert('Please select both From and To dates.');
      return;
    }
    router.push(`/inquiries?strdate=${strdate}&enddate=${enddate}`);
  };

  const handleDownloadReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strdate || !enddate) {
      alert('Please select both From and To dates to download the report.');
      return;
    }
    window.location.href = `/inquiry_export.php?strdate=${strdate}&enddate=${enddate}`;
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure want to delete?')) return;
    setExecuting(true);
    const res = await deleteInquiryRecord(id);
    setExecuting(false);
    if (res.success) {
      router.refresh();
      if (res.redirect) router.push(res.redirect);
    } else {
      alert(res.error || 'Failed to delete inquiry.');
    }
  };

  const filteredRecords = records.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      (row.inq_name || '').toLowerCase().includes(term) ||
      (row.inq_contact || '').toLowerCase().includes(term) ||
      (row.inq_remarks || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const getStatusDisplay = (row: any) => {
    if (row.inq_action === '1') {
      return { text: 'Pending', style: { color: '#82c21f', fontWeight: 'bold' } };
    } else if (row.inq_action === '2') {
      return { text: `Rejected - ${row.rej_res_name || ''}`, style: { color: 'red', fontWeight: 'bold' } };
    } else {
      return { text: 'Completed', style: { color: 'green', fontWeight: 'bold' } };
    }
  };

  const formatDateString = (dateVal: any) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-table"></i> Inquiry List</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li className="active">Inquiry List</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="panel panel-default">
          <div className="panel-body">
            {/* Banner Messages */}
            {flag === '1' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Inquiry details added successfully.</p>}
            {flag === '2' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Inquiry details updated successfully.</p>}
            {flag === '3' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Inquiry details deleted successfully.</p>}

            <div className="row" style={{ margin: '0px 0px 20px 0px' }}>
              <div className="col-md-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
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
                    <button onClick={handleSearch} className="btn btn-primary" style={{ height: '40px', marginRight: '5px' }}>
                      Search
                    </button>
                    <button onClick={handleDownloadReport} className="btn btn-primary" style={{ height: '40px' }}>
                      Download Report
                    </button>
                  </div>
                </div>

                <div>
                  <button className="btn btn-primary" onClick={() => router.push('/inquiries/add')} style={{ height: '40px' }}>
                    <i className="fa fa-plus"></i> Add Inquiry
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>Search:</span>
                <input
                  type="text"
                  placeholder="Search name, phone, remarks..."
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

            <div className="table-responsive">
              <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                  <tr>
                    <th style={{ width: '5%' }}>Id</th>
                    <th style={{ width: '12%' }}>Date</th>
                    <th style={{ width: '20%' }}>Name</th>
                    <th style={{ width: '15%' }}>Contact</th>
                    <th style={{ width: '25%' }}>Remarks</th>
                    <th style={{ width: '13%' }}>Status</th>
                    <th style={{ width: '10%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center">No records found.</td>
                    </tr>
                  ) : (
                    paginatedRecords.map((row) => {
                      const status = getStatusDisplay(row);
                      return (
                        <tr key={row.inq_id} className="odd gradeX">
                          <td>{row.inq_id}</td>
                          <td>{formatDateString(row.inq_date)}</td>
                          <td>
                            <a style={{ color: 'green', fontWeight: 'semibold' }} href={`/inquiries/edit?inq_id=${row.inq_id}`}>
                              {row.inq_name}
                            </a>
                          </td>
                          <td>{row.inq_contact}</td>
                          <td>{row.inq_remarks}</td>
                          <td style={status.style}>{status.text}</td>
                          <td>
                            <code>
                              <a style={{ color: '#1C1B17', marginRight: '5px' }} title="Follow Up" href={`/inquiries/followup?inq_id=${row.inq_id}`}>
                                <i className="fa fa-comment"></i>
                              </a>
                              {' | '}
                              <a style={{ color: 'green', marginRight: '5px' }} title="Edit" href={`/inquiries/edit?inq_id=${row.inq_id}`}>
                                <i className="fa fa-pencil"></i>
                              </a>
                              {isAdmin && (
                                <>
                                  {' | '}
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(row.inq_id)}
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

            {/* Pagination */}
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

          </div>
        </div>
      </div>
    </div>
  );
}
