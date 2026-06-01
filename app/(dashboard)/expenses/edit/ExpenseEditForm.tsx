'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateExpenseRecord } from '../../../actions/finance';

const formatDate = (dateVal: any) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export default function ExpenseEditForm({
  record,
  paymentMethods,
  statusList,
}: {
  record: any;
  paymentMethods: any[];
  statusList: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states pre-populated from record
  const [date, setDate] = useState(formatDate(record.oexp_date) || new Date().toISOString().split('T')[0]);
  const [pmId, setPmId] = useState(record.pm_id ? String(record.pm_id) : '');
  const [amount, setAmount] = useState(record.oexp_amount ? String(record.oexp_amount) : '');
  const [paidto, setPaidto] = useState(record.oexp_paidto || '');
  const [description, setDescription] = useState(record.oexp_description || '');
  const [status, setStatus] = useState(record.oexp_status ? String(record.oexp_status) : '1');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('oexp_date', date);
    formData.append('pm_id', pmId);
    formData.append('oexp_amount', amount);
    formData.append('oexp_paidto', paidto);
    formData.append('oexp_description', description);
    formData.append('oexp_status', status);
    if (file) {
      formData.append('oexp_image', file);
    }

    try {
      const res = await updateExpenseRecord(record.oexp_id, formData);
      if (res.success) {
        router.refresh();
        if (res.redirect) router.push(res.redirect);
      } else {
        setError(res.error || 'Failed to update office expense record.');
      }
    } catch (err: any) {
      setError(err.message || 'Database transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-edit"></i> Edit Office Expense</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li><a style={{ color: '#1C1B17' }} href="/expenses">Office Expenses</a></li>
            <li className="active">Edit Office Expense</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit}>
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Edit Expense Details ({record.oexp_code_no})</h4>
                  {error && <p style={{ color: 'red', fontWeight: 'semibold', fontSize: '14px' }}>{error}</p>}
                  <p>Please enter details and select supporting documents below.</p>
                </div>

                <div className="panel-body">
                  {/* Voucher No */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Voucher No.</label>
                    <div className="col-sm-9">
                      <input type="text" disabled className="form-control" value={record.oexp_code_no || ''} />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Payment Method Dropdown */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Pay Method <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        value={pmId}
                        onChange={(e) => setPmId(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Pay Method</option>
                        {paymentMethods.map((pm) => (
                          <option key={pm.pm_id} value={pm.pm_id}>
                            {pm.pm_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Amount <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        min={0}
                        required
                        className="form-control"
                        placeholder="ex: 1500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Paid To */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Paid To <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="ex: Bajrang Stationers"
                        value={paidto}
                        onChange={(e) => setPaidto(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Description <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="ex: Office file folders..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Documents File Upload */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Documents</label>
                    <div className="col-sm-9">
                      {record.oexp_image && (
                        <div style={{ marginBottom: '10px' }}>
                          <a href={record.oexp_image} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'green', fontSize: '13px' }}>
                            View current uploaded file
                          </a>
                        </div>
                      )}
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*,application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={loading}
                      >
                        {statusList.map((stat) => (
                          <option key={stat.status_id} value={stat.status_id}>
                            {stat.status_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>

                <div className="panel-footer">
                  <div className="row">
                    <div className="col-sm-12 col-lg-12 col-md-12 col-xs-12 ml_15">
                      <button type="submit" className="btn btn-primary" style={{ marginRight: '5px' }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                      </button>
                      <button type="button" className="btn btn-default" onClick={() => router.push('/expenses')} disabled={loading}>
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
