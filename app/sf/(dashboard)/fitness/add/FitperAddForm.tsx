'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFitperRecord } from '../../../../actions/fitper';

export default function FitperAddForm({
  branchId,
  isAdmin,
}: {
  branchId: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form field states
  const [fpDate, setFpDate] = useState(new Date().toISOString().split('T')[0]);
  const [fpRegno, setFpRegno] = useState('');
  const [fpName, setFpName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fpRegno || !fpName) {
      setError('All fields marked with an asterisk are required.');
      return;
    }

    const fileInput = document.getElementById('fp_pdf') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError('PDF file upload is required.');
      return;
    }

    if (file.name.split('.').pop()?.toLowerCase() !== 'pdf') {
      setError('Invalid file extension. Please select only a PDF file.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('fp_date', fpDate);
    formData.append('fp_regno', fpRegno);
    formData.append('fp_name', fpName);
    formData.append('fp_pdf', file);

    try {
      const res = await createFitperRecord(formData);
      if (res.success) {
        router.push(res.redirect || '/sf/fitness');
        router.refresh();
      } else {
        setError(res.error || 'Failed to create record.');
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
        <h2><i className="fa fa-plus"></i> Add Fitness & Permit</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/rto">RTO Dashboard</a></li>
            <li><a href="/sf/fitness">Fitness & Permit List</a></li>
            <li className="active">Add Fitness & Permit</li>
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
                  <p>Please fill details and upload PDF below.</p>
                  {error && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                </div>
                <div className="panel-body">
                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={fpDate}
                        onChange={(e) => setFpDate(e.target.value)}
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
                        placeholder="Client Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Upload PDF <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="file"
                        id="fp_pdf"
                        accept=".pdf"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="panel-footer">
                  <div className="row">
                    <div className="col-sm-12 ml_15">
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit'}
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
