'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteSubAdmin } from '../../../actions/admin';

export default function SubAdminListClient({
  records,
  flag,
}: {
  records: any[];
  flag: string;
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure want to delete?')) return;
    setDeleting(true);
    try {
      const res = await deleteSubAdmin(id);
      if (res.success) {
        router.refresh();
        if (res.redirect) router.push(res.redirect);
      } else {
        alert(res.error || 'Failed to delete sub admin.');
      }
    } catch {
      alert('Database transaction failed.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredRecords = records.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      (row.adm_username || '').toLowerCase().includes(term) ||
      (row.adm_contact || '').toLowerCase().includes(term) ||
      (row.adm_cat_name || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-table"></i> View Sub Admin</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li className="active">View Sub Admin</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="panel panel-default">
          <div className="panel-body">
            {/* Banner Messages */}
            {flag === '1' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Sub Admin details added successfully.</p>}
            {flag === '2' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Sub Admin details updated successfully.</p>}
            {flag === '3' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Sub Admin details deleted successfully.</p>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <button className="btn btn-primary" onClick={() => router.push('/sf/sub-admins/add')}>
                  <i className="fa fa-plus"></i> Add Sub Admin
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>Search:</span>
                <input
                  type="text"
                  placeholder="Search name, phone, category..."
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
                    <th style={{ width: '10%' }}>No.</th>
                    <th style={{ width: '45%' }}>Name</th>
                    <th style={{ width: '15%' }}>Contact</th>
                    <th style={{ width: '15%' }}>Category</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '10%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">No records found.</td>
                    </tr>
                  ) : (
                    paginatedRecords.map((row) => (
                      <tr key={row.adm_id} className="odd gradeX">
                        <td>{row.adm_id}</td>
                        <td>
                          <a style={{ color: 'green', fontWeight: 'semibold' }} href={`/sub-admins/edit?adm_id=${row.adm_id}`}>
                            {row.adm_username}
                          </a>
                        </td>
                        <td>{row.adm_contact}</td>
                        <td>{row.adm_cat_name}</td>
                        <td>{row.status_name}</td>
                        <td>
                          <code>
                            <a style={{ color: 'green', marginRight: '5px' }} title="Edit" href={`/sub-admins/edit?adm_id=${row.adm_id}`}>
                              <i className="fa fa-pencil"></i>
                            </a>
                            {' | '}
                            <button
                              type="button"
                              onClick={() => handleDelete(row.adm_id)}
                              style={{ background: 'transparent', border: 'none', color: 'red', padding: '0' }}
                              title="Delete"
                              disabled={deleting}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </code>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
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
