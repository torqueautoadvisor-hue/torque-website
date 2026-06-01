'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadTakenDocumentAction, deleteTakenDocumentAction } from '../../../actions/taken';

export default function TakenDocumentsClient({
  record,
  documents,
  flag = '',
}: {
  record: any;
  documents: any[];
  flag?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a document file.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('tkn_id', record.tkn_id.toString());
    formData.append('document_title', title);
    formData.append('document_image', file);

    const res = await uploadTakenDocumentAction(formData);
    setUploading(false);

    if (res.success) {
      setTitle('');
      setFile(null);
      const fileInput = document.getElementById('document_image_input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      router.refresh();
      if (res.redirect) router.push(res.redirect);
    } else {
      alert(res.error || 'Failed to upload document.');
    }
  };

  // Delete document handler
  const handleDelete = async (docId: number) => {
    if (!confirm('Are you sure want to delete?')) return;
    setDeletingId(docId);
    
    const res = await deleteTakenDocumentAction(docId, record.tkn_id);
    setDeletingId(null);

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
          <i className="fa fa-plus"></i> Documents - {record.tkn_name} ({record.tkn_code_no})
        </h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li><a style={{ color: '#1C1B17' }} href="/taken">Taken List</a></li>
            <li className="active">Documents - {record.tkn_name}</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit} className="form-horizontal">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">
                    Upload Document - {record.tkn_name} ({record.tkn_code_no})
                  </h4>
                  <p>Please upload documents associated with this client record.</p>
                </div>
                
                <div className="panel-body">
                  {/* Status Banner Messages */}
                  {flag === '1' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Documents added successfully.</p>}
                  {flag === '2' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Documents updated successfully.</p>}
                  {flag === '3' && <p className="mb20" style={{ color: 'green', fontWeight: 'bold' }}>Documents deleted successfully.</p>}
                  {flag === '4' && <p className="mb20" style={{ color: 'red', fontWeight: 'bold' }}>Documents type is wrong.</p>}
                  {flag === '5' && <p className="mb20" style={{ color: 'red', fontWeight: 'bold' }}>Documents size is too large.</p>}

                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Title</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="document_title"
                        className="form-control"
                        placeholder="Document Title (e.g. Aadhar Card, RC Book)..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={uploading}
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
                        id="document_image_input"
                        name="document_image"
                        className="form-control"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>

                <div className="panel-footer">
                  <div className="row">
                    <div className="col-sm-9 col-sm-offset-3" style={{ marginBottom: '30px' }}>
                      <button type="submit" className="btn btn-primary" style={{ marginRight: '5px' }} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Submit'}
                      </button>
                      <button type="reset" className="btn btn-default" onClick={() => { setTitle(''); setFile(null); }} disabled={uploading}>
                        Reset
                      </button>
                    </div>
                  </div>

                  <hr style={{ borderColor: 'rgba(0,0,0,0.1)', margin: '20px 0' }} />

                  {/* Previews header */}
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: '0', fontWeight: 'bold' }}>
                      Uploaded Documents - {record.tkn_name}
                    </h3>
                  </div>

                  {/* Documents Grid Display */}
                  <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {documents.length === 0 ? (
                      <div className="col-xs-12">
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No documents uploaded yet.</p>
                      </div>
                    ) : (
                      documents.map((doc) => {
                        const fileUrl = doc.document_image;
                        const isPdf = fileUrl && fileUrl.toLowerCase().includes('.pdf');

                        return (
                          <div 
                            key={doc.document_id} 
                            style={{ 
                              width: '220px', 
                              border: '1px solid #ddd', 
                              borderRadius: '4px',
                              padding: '10px',
                              backgroundColor: '#fff',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              {isPdf ? (
                                <iframe 
                                  src={fileUrl} 
                                  width="100%" 
                                  height="180px" 
                                  style={{ border: 'none', marginBottom: '8px' }} 
                                />
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noreferrer">
                                  <img 
                                    src={fileUrl} 
                                    alt={doc.document_title} 
                                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '2px', marginBottom: '8px' }} 
                                  />
                                </a>
                              )}
                              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', wordBreak: 'break-all', marginBottom: '8px' }}>
                                {doc.document_title}
                              </div>
                            </div>

                            <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#999' }}>
                                ID: {doc.document_id}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDelete(doc.document_id)}
                                style={{ background: 'transparent', border: 'none', color: 'red', padding: '0', cursor: 'pointer' }}
                                disabled={deletingId === doc.document_id}
                                title="Delete"
                              >
                                {deletingId === doc.document_id ? (
                                  <i className="fa fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fa fa-trash"></i>
                                )}
                              </button>
                            </div>
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
