'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateChequeRecord } from '../../../actions/cheque';

export default function ChequeEditForm({
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
  const [chqDate, setChqDate] = useState(record.chq_date ? new Date(record.chq_date).toISOString().split('T')[0] : '');
  const [chqRegno, setChqRegno] = useState(record.chq_regno || '');
  const [chqNo, setChqNo] = useState(record.chq_no || '');
  const [chqAmount, setChqAmount] = useState(record.chq_amount || '');
  const [chqBank, setChqBank] = useState(record.chq_bank || '');
  const [chqDcAction, setChqDcAction] = useState(record.chq_dc_action || '0');
  const [chqDcDate, setChqDcDate] = useState(record.chq_dc_date ? new Date(record.chq_dc_date).toISOString().split('T')[0] : '');
  const [chqCourDet, setChqCourDet] = useState(record.chq_cour_det || '');
  const [chqCshbAmt, setChqCshbAmt] = useState(record.chq_cshb_amt || '0');
  const [chqCshbAction, setChqCshbAction] = useState(record.chq_cshb_action || '0');
  const [chqAction, setChqAction] = useState(record.chq_action || '1');
  const [chqStatus, setChqStatus] = useState(record.chq_status || '1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!chqRegno || !chqNo || !chqAmount || !chqBank) {
      setError('All fields marked with an asterisk are required.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('chq_date', chqDate);
    formData.append('chq_regno', chqRegno);
    formData.append('chq_no', chqNo);
    formData.append('chq_amount', chqAmount.toString());
    formData.append('chq_bank', chqBank);
    formData.append('chq_dc_action', chqDcAction.toString());
    formData.append('chq_cour_det', chqCourDet);
    formData.append('chq_dc_date', chqDcDate);
    formData.append('chq_cshb_amt', chqCshbAmt.toString());
    formData.append('chq_cshb_action', chqCshbAction.toString());
    formData.append('chq_action', chqAction.toString());
    formData.append('chq_status', chqStatus.toString());

    try {
      const res = await updateChequeRecord(record.chq_id, formData);
      if (res.success) {
        router.push(res.redirect || '/cheque');
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
        <h2><i className="fa fa-pen"></i> Cheque Edit</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li><a href="/cheque">Cheque List</a></li>
            <li className="active">Cheque Edit</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit} className="form-horizontal">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Cheque Details</h4>
                  <p>Please edit cheque details below.</p>
                  {error && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                </div>
                <div className="panel-body">
                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Cheque Code <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input type="text" disabled className="form-control" value={record.chq_code_no} />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Cheque Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={chqDate}
                        onChange={(e) => setChqDate(e.target.value)}
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
                        value={chqRegno}
                        onChange={(e) => setChqRegno(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="GJ01AJ5896"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Cheque No <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={chqNo}
                        onChange={(e) => setChqNo(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="100345"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Amount <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        className="form-control"
                        value={chqAmount}
                        onChange={(e) => setChqAmount(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="18500"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Bank <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={chqBank}
                        onChange={(e) => setChqBank(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="State Bank of India"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Clear Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={chqDcAction}
                        onChange={(e) => setChqDcAction(e.target.value)}
                        required
                      >
                        <option value="0">Pending</option>
                        <option value="1">Cleared</option>
                        <option value="2">Bounced</option>
                        <option value="3">In Courier</option>
                      </select>
                    </div>
                  </div>

                  {chqDcAction === '3' && (
                    <div className="form-group col-md-12">
                      <label className="col-sm-3 control-label">Courier Details</label>
                      <div className="col-sm-9">
                        <textarea
                          className="form-control"
                          rows={2}
                          value={chqCourDet}
                          onChange={(e) => setChqCourDet(e.target.value)}
                          placeholder="Type tracking number and courier company details..."
                        ></textarea>
                      </div>
                    </div>
                  )}

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Clear Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={chqDcDate}
                        onChange={(e) => setChqDcDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Cash-back Amount</label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        className="form-control"
                        value={chqCshbAmt}
                        onChange={(e) => setChqCshbAmt(e.target.value)}
                        placeholder="500"
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Cash-back Status</label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={chqCshbAction}
                        onChange={(e) => setChqCshbAction(e.target.value)}
                      >
                        <option value="0">Pending</option>
                        <option value="1">Refunded</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={chqStatus}
                        onChange={(e) => setChqStatus(e.target.value)}
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
                      <button type="button" className="btn btn-default" style={{ marginLeft: '10px' }} onClick={() => router.push('/cheque')}>
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
