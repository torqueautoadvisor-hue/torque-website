'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAgent } from '../../../../actions/catalog';

export default function AgentListClient({
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
      const res = await deleteAgent(id);
      if (res.success) {
        router.refresh();
        if (res.redirect) router.push(res.redirect);
      } else {
        alert(res.error || 'Failed to delete agent.');
      }
    } catch {
      alert('Database transaction failed.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredRecords = records.filter((row) =>
    (row.agt_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-table"></i> View Agents</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li className="active">Agents</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="panel panel-default">
          <div className="panel-body">
            {flag === '1' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Agent details added successfully.</p>}
            {flag === '2' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Agent details updated successfully.</p>}
            {flag === '3' && <p style={{ color: 'green', fontWeight: 'semibold', marginBottom: '15px' }}>Agent details deleted successfully.</p>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <button className="btn btn-primary" onClick={() => router.push('/sf/setup/agents/add')}>
                  <i className="fa fa-plus"></i> Add Agent
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>Search:</span>
                <input
                  type="text"
                  placeholder="Search agent name/number..."
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
                    <th style={{ width: '70%' }}>Agent Code/Name</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '10%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">No records found.</td>
                    </tr>
                  ) : (
                    paginatedRecords.map((row) => (
                      <tr key={row.agt_id} className="odd gradeX">
                        <td>{row.agt_id}</td>
                        <td>
                          <a style={{ color: 'green', fontWeight: 'semibold' }} href={`/setup/agents/edit?agt_id=${row.agt_id}`}>
                            {row.agt_number}
                          </a>
                        </td>
                        <td>{row.status_name}</td>
                        <td>
                          <code>
                            <a style={{ color: 'green', marginRight: '5px' }} title="Edit" href={`/setup/agents/edit?agt_id=${row.agt_id}`}>
                              <i className="fa fa-pencil"></i>
                            </a>
                            {' | '}
                            <button
                              type="button"
                              onClick={() => handleDelete(row.agt_id)}
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
