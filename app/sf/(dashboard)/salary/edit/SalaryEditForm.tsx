'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSalaryRecord } from '../../../../actions/salary';

export default function SalaryEditForm({
  record,
  staffList,
  branchId,
  isAdmin,
}: {
  record: any;
  staffList: any[];
  branchId: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Helper to extract YYYY-MM-DD from database date string
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Form field states
  const [slrDate, setSlrDate] = useState(formatDateForInput(record.slr_date));
  const [admId, setAdmId] = useState(record.adm_id?.toString() || '');
  const [slrFix, setSlrFix] = useState(record.slr_fix?.toString() || '0');
  const [slrPaid, setSlrPaid] = useState(record.slr_paid?.toString() || '0');
  const [slrDed, setSlrDed] = useState(record.slr_ded?.toString() || '0');
  const [slrPre, setSlrPre] = useState(record.slr_pre?.toString() || '0');
  const [slrAbs, setSlrAbs] = useState(record.slr_abs?.toString() || '0');
  const [slrStatus, setSlrStatus] = useState(record.slr_status?.toString() || '1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!admId || !slrDate) {
      setError('Staff member selection and Salary Date are required.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('slr_date', slrDate);
    formData.append('adm_id', admId);
    formData.append('slr_fix', slrFix);
    formData.append('slr_paid', slrPaid);
    formData.append('slr_ded', slrDed);
    formData.append('slr_pre', slrPre);
    formData.append('slr_abs', slrAbs);
    formData.append('slr_status', slrStatus);

    try {
      const res = await updateSalaryRecord(record.slr_id, formData);
      if (res.success) {
        router.push(res.redirect || '/sf/salary');
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
        <h2><i className="fa fa-pen"></i> Edit Salary</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li><a href="/sf/salary">Salary List</a></li>
            <li className="active">Edit Salary</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit} className="form-horizontal">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Salary Details ({record.slr_code_no})</h4>
                  <p>Please edit employee salary information here.</p>
                  {error && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                </div>
                <div className="panel-body">
                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Salary Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={slrDate}
                        onChange={(e) => setSlrDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Employee <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={admId}
                        onChange={(e) => setAdmId(e.target.value)}
                        required
                      >
                        <option value="">-- Select Employee --</option>
                        {staffList.map((st) => (
                          <option key={st.adm_id} value={st.adm_id}>
                            {st.adm_username}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Fix Salary</label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        value={slrFix}
                        onChange={(e) => setSlrFix(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Paid Salary</label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        value={slrPaid}
                        onChange={(e) => setSlrPaid(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Deduction</label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        value={slrDed}
                        onChange={(e) => setSlrDed(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Present Days</label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        value={slrPre}
                        onChange={(e) => setSlrPre(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Absent Days</label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        value={slrAbs}
                        onChange={(e) => setSlrAbs(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={slrStatus}
                        onChange={(e) => setSlrStatus(e.target.value)}
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
                        {submitting ? 'Submitting...' : 'Submit'}
                      </button>
                      <button type="button" className="btn btn-default" style={{ marginLeft: '10px' }} onClick={() => router.push('/sf/salary')}>
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
