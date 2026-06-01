'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteHisabRecord } from '../../actions/finance';

export default function HisabListClient({
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
    router.push(`/daily-hisab?strdate=${strdate}&enddate=${enddate}`);
  };

  const handleDownloadReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strdate || !enddate) {
      alert('Please select both From and To dates to download the report.');
      return;
    }
    window.location.href = `/daily_hisab_export.php?strdate=${strdate}&enddate=${enddate}`;
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure want to delete?')) return;
    setExecuting(true);
    const res = await deleteHisabRecord(id);
    setExecuting(false);
    if (res.success) {
      router.refresh();
      if (res.redirect) router.push(res.redirect);
    } else {
      alert(res.error || 'Failed to delete record.');
    }
  };

  const filteredRecords = records.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      (row.dl_hsb_name || '').toLowerCase().includes(term) ||
      (row.dl_hsb_regno || '').toLowerCase().includes(term) ||
      (row.dl_hsb_description || '').toLowerCase().includes(term) ||
      (row.dl_hsb_code_no || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  // Dynamic Calculations (Income vs Expense aggregations)
  const totalIncome = filteredRecords
    .filter((r) => r.dl_hsb_incexp === 1)
    .reduce((sum, r) => sum + parseFloat(r.dl_hsb_amount || 0), 0);

  const totalExpense = filteredRecords
    .filter((r) => r.dl_hsb_incexp === 2)
    .reduce((sum, r) => sum + parseFloat(r.dl_hsb_amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  const formatDateString = (dateVal: any) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-table"></i> Daily Hisab Ledger</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li className="active">Daily Hisab</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        {/* Dynamic Aggregations Cards (Premium dashboard style) */}
        <div className="row" style={{ marginBottom: '20px' }}>
          <div className="col-md-4">
            <div className="panel panel-success panel-stat" style={{ background: '#82c21f', color: '#fff', borderRadius: '5px' }}>
              <div className="panel-heading" style={{ padding: '15px' }}>
                <div className="stat">
                  <div className="row">
                    <div className="col-xs-4">
                      <i className="fa fa-arrow-down" style={{ fontSize: '36px' }}></i>
                    </div>
                    <div className="col-xs-8 font-semibold">
                      <small className="stat-label" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase' }}>Total Income</small>
                      <h3 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>₹{totalIncome.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="panel panel-danger panel-stat" style={{ background: '#d9534f', color: '#fff', borderRadius: '5px' }}>
              <div className="panel-heading" style={{ padding: '15px' }}>
                <div className="stat">
                  <div className="row">
                    <div className="col-xs-4">
                      <i className="fa fa-arrow-up" style={{ fontSize: '36px' }}></i>
                    </div>
                    <div className="col-xs-8 font-semibold">
                      <small className="stat-label" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase' }}>Total Expense</small>
                      <h3 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>₹{totalExpense.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="panel panel-primary panel-stat" style={{ background: netBalance >= 0 ? '#5bc0de' : '#f0ad4e', color: '#fff', borderRadius: '5px' }}>
              <div className="panel-heading" style={{ padding: '15px' }}>
                <div className="stat">
                  <div className="row">
                    <div className="col-xs-4">
                      <i className="fa fa-money" style={{ fontSize: '36px' }}></i>
                    </div>
                    <div className="col-xs-8 font-semibold">
                      <small className="stat-label" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase' }}>Net Balance</small>
                      <h3 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>₹{netBalance.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel panel-default">
          <div className="panel-body">
            {/* Banner Messages */}
            {flag === '1' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Daily Hisab details added successfully.</p>}
            {flag === '2' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Daily Hisab details updated successfully.</p>}
            {flag === '3' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Daily Hisab details deleted successfully.</p>}

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
                  <button className="btn btn-primary" onClick={() => router.push('/daily-hisab/add')} style={{ height: '40px' }}>
                    <i className="fa fa-plus"></i> Add Daily Hisab
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>Search:</span>
                <input
                  type="text"
                  placeholder="Search receipt, name, model..."
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
                    <th style={{ width: '8%' }}>Receipt No.</th>
                    <th style={{ width: '10%' }}>Date</th>
                    <th style={{ width: '10%' }}>Type</th>
                    <th style={{ width: '10%' }}>Pay Method</th>
                    <th style={{ width: '10%' }}>Amount</th>
                    <th style={{ width: '15%' }}>Name</th>
                    <th style={{ width: '12%' }}>Reg No.</th>
                    <th style={{ width: '15%' }}>Description</th>
                    <th style={{ width: '5%' }}>File</th>
                    <th style={{ width: '5%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center">No records found.</td>
                    </tr>
                  ) : (
                    paginatedRecords.map((row) => (
                      <tr key={row.dl_hsb_id} className="odd gradeX">
                        <td>{row.dl_hsb_code_no}</td>
                        <td>{formatDateString(row.dl_hsb_date)}</td>
                        <td style={row.dl_hsb_incexp === 1 ? { color: 'green', fontWeight: 'bold' } : { color: 'red', fontWeight: 'bold' }}>
                          {row.dl_hsb_incexp === 1 ? 'Income' : 'Expense'}
                        </td>
                        <td>{row.pm_name}</td>
                        <td style={{ fontWeight: 'semibold' }}>₹{parseFloat(row.dl_hsb_amount || 0).toLocaleString()}</td>
                        <td>
                          <a style={{ color: 'green', fontWeight: 'semibold' }} href={`/daily-hisab/edit?dl_hsb_id=${row.dl_hsb_id}`}>
                            {row.dl_hsb_name}
                          </a>
                        </td>
                        <td>{row.dl_hsb_regno}</td>
                        <td>{row.dl_hsb_description}</td>
                        <td>
                          {row.dl_hsb_image ? (
                            <a style={{ color: '#333' }} title="View Document" href={row.dl_hsb_image} target="_blank" rel="noopener noreferrer">
                              <i className="fa fa-file-image-o" style={{ fontSize: '18px' }}></i>
                            </a>
                          ) : (
                            <span style={{ color: '#ccc' }}>N/A</span>
                          )}
                        </td>
                        <td>
                          <code>
                            <a style={{ color: 'green', marginRight: '5px' }} title="Edit" href={`/daily-hisab/edit?dl_hsb_id=${row.dl_hsb_id}`}>
                              <i className="fa fa-pencil"></i>
                            </a>
                            {isAdmin && (
                              <>
                                {' | '}
                                <button
                                  type="button"
                                  onClick={() => handleDelete(row.dl_hsb_id)}
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
                    ))
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
