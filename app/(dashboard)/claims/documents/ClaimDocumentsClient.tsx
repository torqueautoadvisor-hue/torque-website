'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadClaimDocumentAction, deleteClaimDocumentAction } from '../../../actions/claim';

export default function ClaimDocumentsClient({
  claimRecord,
  documents,
  clmId,
  flag = '',
  isAdmin,
}: {
  claimRecord: any;
  documents: any[];
  clmId: number;
  flag?: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fileInput = document.getElementById('document_image') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setError('Document file is required.');
      return;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['jpg', 'png', 'jpeg', 'pdf'];

    if (!validExtensions.includes(fileExt)) {
      setError('Invalid file extension. Please select JPG, PNG, or PDF.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('clm_id', clmId.toString());
    formData.append('document_title', documentTitle);
    formData.append('document_image', file);

    try {
      const res = await uploadClaimDocumentAction(formData);
      if (res.success) {
        setDocumentTitle('');
        if (fileInput) fileInput.value = '';
        router.refresh();
        if (res.redirect) router.push(res.redirect);
      } else {
        setError(res.error || 'Failed to upload document.');
      }
    } catch (err: any) {
      setError('An error occurred during file upload.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    if (!confirm('Are you sure want to delete?')) return;
    const res = await deleteClaimDocumentAction(docId, clmId);
    if (res.success) {
      router.refresh();
      if (res.redirect) router.push(res.redirect);
    } else {
      alert(res.error || 'Failed to delete document.');
    }
  };

  return (
    <div>
      <div className="pageheader">
        <h2>
          <i className="fa fa-plus"></i> Documents - {claimRecord.clm_no}({claimRecord.clm_regno})
        </h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li><a href="/claims">Claim List</a></li>
            <li className="active">Documents</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit} className="form-horizontal" encType="multipart/form-data">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Documents - {claimRecord.clm_no}({claimRecord.clm_regno})</h4>
                  <p>Please set documents details here.</p>
                  {error && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                </div>
                <div className="panel-body">
                  {flag === '1' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Documents added successfully.</p>}
                  {flag === '2' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Documents updated successfully.</p>}
                  {flag === '3' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Documents deleted successfully.</p>}
                  {flag === '4' && <p className="mb20" style={{ color: 'red', fontWeight: 'bold' }}>Documents type is wrong.</p>}
                  {flag === '5' && <p className="mb20" style={{ color: 'red', fontWeight: 'bold' }}>Documents size is big.</p>}

                  <div className="form-group">
                    <label className="col-sm-3 control-label">Title</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Title ..."
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-sm-3 control-label">
                      Documents (JPG, PNG, PDF) <span className="asterisk">*</span>
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="file"
                        id="document_image"
                        accept=".jpg,.png,.jpeg,.pdf"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="panel-footer">
                  <div className="row">
                    <div className="col-sm-9 col-sm-offset-3">
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Uploading...' : 'Submit'}
                      </button>
                      <button type="reset" className="btn btn-default" style={{ marginLeft: '10px' }} onClick={() => router.push('/claims')}>
                        Cancel
                      </button>
                    </div>
                  </div>
                  
                  <br /><br />
                  <div style={{ marginLeft: '15px' }}>
                    <h3>Documents - {claimRecord.clm_no}({claimRecord.clm_regno})</h3>
                  </div>
                  <br />

                  <div className="row" style={{ padding: '0 15px' }}>
                    {documents.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: 'gray', paddingLeft: '15px' }}>No documents uploaded yet.</p>
                    ) : (
                      documents.map((doc) => {
                        const fileUrl = doc.document_image;
                        const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');
                        return (
                          <div
                            key={doc.document_id}
                            className="col-sm-3"
                            style={{
                              border: '1px solid #ddd',
                              padding: '10px',
                              textAlign: 'center',
                              borderRadius: '4px',
                              marginRight: '15px',
                              marginBottom: '15px',
                              background: '#fff',
                            }}
                          >
                            {isPdf ? (
                              <iframe
                                src={fileUrl}
                                width="100%"
                                height="200px"
                                style={{ border: '1px solid #ddd', marginBottom: '8px' }}
                              ></iframe>
                            ) : (
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={fileUrl}
                                  className="img-responsive"
                                  style={{
                                    maxHeight: '200px',
                                    margin: '0 auto 8px auto',
                                    borderRadius: '4px',
                                  }}
                                  alt={doc.document_title}
                                />
                              </a>
                            )}
                            <strong style={{ display: 'block', fontSize: '13px', margin: '5px 0' }}>
                              {doc.document_title || 'Untitled'}
                            </strong>
                            <button
                              type="button"
                              onClick={() => handleDeleteDoc(doc.document_id)}
                              style={{
                                border: 'none',
                                background: 'none',
                                color: 'red',
                                cursor: 'pointer',
                                fontSize: '16px',
                              }}
                              title="Delete Document"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
