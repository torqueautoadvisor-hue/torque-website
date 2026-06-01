'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateFitperRecord } from '../../../../actions/fitper';

export default function FitperEditForm({
  record,
  branchId,
  isAdmin,
}: {
  record: any;
  branchId: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form field states
  const [fpDate, setFpDate] = useState(record.fp_date ? new Date(record.fp_date).toISOString().split('T')[0] : '');
  const [fpRegno, setFpRegno] = useState(record.fp_regno || '');
  const [fpName, setFpName] = useState(record.fp_name || '');
  const [fpStatus, setFpStatus] = useState(record.fp_status || '1');

  // PDF State
  const [existingPdfUrl, setExistingPdfUrl] = useState(record.fp_pdf || '');
  const [removePdf, setRemovePdf] = useState(false);

  const handleRemovePdf = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure want to delete pdf?')) {
      setRemovePdf(true);
      setExistingPdfUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fpRegno || !fpName) {
      setError('All fields marked with an asterisk are required.');
      return;
    }

    const fileInput = document.getElementById('fp_pdf') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (removePdf && !file) {
      setError('A Fitness & Permit PDF file is required.');
      return;
    }

    if (file && file.name.split('.').pop()?.toLowerCase() !== 'pdf') {
      setError('Invalid file type. Only PDF is allowed.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('fp_date', fpDate);
    formData.append('fp_regno', fpRegno);
    formData.append('fp_name', fpName);
    formData.append('fp_status', fpStatus.toString());
    formData.append('hdp_image', record.fp_pdf || '');
    formData.append('remove_pdf', removePdf ? 'true' : 'false');
    if (file) {
      formData.append('fp_pdf', file);
    }

    try {
      const res = await updateFitperRecord(record.fp_id, formData);
      if (res.success) {
        router.push(res.redirect || '/sf/fitness');
        router.refresh();
      } else {
        setError(res.error || 'Failed to update record.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError('A database transaction error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-pen"></i> Fitness & Permit Edit</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/rto">RTO Dashboard</a></li>
            <li><a href="/sf/fitness">Fitness & Permit List</a></li>
            <li className="active">Fitness & Permit Edit</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit} className="form-horizontal">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Fitness & Permit Details</h4>
                  <p>Please edit details and manage PDF below.</p>
                  {error && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                </div>
                <div className="panel-body">
                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Code <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input type="text" disabled className="form-control" value={record.fp_code_no} />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={fpDate}
                        onChange={(e) => setFpDate(e.target.value)}
                        readOnly={!isAdmin}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Registration No <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={fpRegno}
                        onChange={(e) => setFpRegno(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="GJ01AJ5896"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Name <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={fpName}
                        onChange={(e) => setFpName(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="Client Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Upload PDF <span className="asterisk">*</span></label>
                    <div className="col-sm-4">
                      <input
                        type="file"
                        id="fp_pdf"
                        accept=".pdf"
                        className="form-control"
                        disabled={!isAdmin && existingPdfUrl !== ''}
                      />
                    </div>
                    <div className="col-sm-5">
                      {existingPdfUrl ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <iframe
                            src={existingPdfUrl}
                            width="100%"
                            height="200px"
                            style={{ border: '1px solid #ddd' }}
                          ></iframe>
                          {isAdmin && (
                            <a
                              href="#"
                              onClick={handleRemovePdf}
                              style={{ color: 'red', textDecoration: 'underline', fontSize: '12px' }}
                            >
                              Remove PDF
                            </a>
                          )}
                        </div>
                      ) : (
                        <p style={{ color: 'gray', fontStyle: 'italic', marginTop: '10px' }}>PDF not available</p>
                      )}
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={fpStatus}
                        onChange={(e) => setFpStatus(e.target.value)}
                        disabled={!isAdmin}
                        required
                      >
                        <option value="1">Active</option>
                        <option value="2">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="panel-footer">
                  <div className="row">
                    <div className="col-sm-12 ml_15">
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Updating...' : 'Edit'}
                      </button>
                      <button type="button" className="btn btn-default" style={{ marginLeft: '10px' }} onClick={() => router.push('/sf/fitness')}>
                        Cancel
                      </button>
                    </div>
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
