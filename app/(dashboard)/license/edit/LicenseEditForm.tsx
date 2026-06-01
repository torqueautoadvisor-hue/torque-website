'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateRtoRecord } from '../../../actions/rto';

export default function LicenseEditForm({
  record,
  staffList,
  penResList,
  branchId,
  isAdmin,
}: {
  record: any;
  staffList: any[];
  penResList: any[];
  branchId: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form field states
  const [rtoDate, setRtoDate] = useState(record.rto_date ? new Date(record.rto_date).toISOString().split('T')[0] : '');
  const [rtoDuedate, setRtoDuedate] = useState(record.rto_duedate ? new Date(record.rto_duedate).toISOString().split('T')[0] : '');
  const [rtoRegno, setRtoRegno] = useState(record.rto_regno || '');
  const [rtoName, setRtoName] = useState(record.rto_name || '');
  const [rtoContact, setRtoContact] = useState(record.rto_contact || '');
  const [rtoDescription, setRtoDescription] = useState(record.rto_description || '');
  const [rtoAmount, setRtoAmount] = useState(record.rto_amount || '');
  const [rtoCredit, setRtoCredit] = useState(record.rto_credit || '0');
  const [rtoAdmId, setRtoAdmId] = useState(record.rto_adm_id || '');
  const [rtoAction, setRtoAction] = useState(record.rto_action || '1');
  const [penResId, setPenResId] = useState(record.pen_res_id || '');
  const [rtoStatus, setRtoStatus] = useState(record.rto_status || '1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!rtoRegno || !rtoName || !rtoContact || !rtoAmount) {
      setError('All fields marked with an asterisk are required.');
      return;
    }

    if (rtoContact.length !== 10 || !/^\d+$/.test(rtoContact)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('rto_date', rtoDate);
    formData.append('rto_duedate', rtoDuedate);
    formData.append('rto_regno', rtoRegno);
    formData.append('rto_name', rtoName);
    formData.append('rto_contact', rtoContact);
    formData.append('rto_description', rtoDescription);
    formData.append('rto_amount', rtoAmount.toString());
    formData.append('rto_credit', rtoCredit.toString());
    formData.append('rto_adm_id', rtoAdmId.toString());
    formData.append('rto_action', rtoAction.toString());
    formData.append('pen_res_id', rtoAction === '1' ? penResId.toString() : '');
    formData.append('rto_status', rtoStatus.toString());

    try {
      const res = await updateRtoRecord(record.rto_id, 1, formData); // serviceId = 1 (License)
      if (res.success) {
        router.push(res.redirect || '/license');
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
        <h2><i className="fa fa-pen"></i> License Edit</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/rto">RTO Dashboard</a></li>
            <li><a href="/license">License List</a></li>
            <li className="active">License Edit</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit} className="form-horizontal">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">License Details</h4>
                  <p>Please set license work details here.</p>
                  {error && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                </div>
                <div className="panel-body">
                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">License Code <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input type="text" disabled className="form-control" value={record.rto_code_no} />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={rtoDate}
                        onChange={(e) => setRtoDate(e.target.value)}
                        readOnly={!isAdmin}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Due Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={rtoDuedate}
                        onChange={(e) => setRtoDuedate(e.target.value)}
                        readOnly={!isAdmin}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">License No <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={rtoRegno}
                        onChange={(e) => setRtoRegno(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="DL-XXXXXXXXXXXXX"
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
                        value={rtoName}
                        onChange={(e) => setRtoName(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="Insured Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Mobile No. <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={rtoContact}
                        onChange={(e) => setRtoContact(e.target.value.replace(/\D/g, ''))}
                        readOnly={!isAdmin}
                        maxLength={10}
                        placeholder="9898569898"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Description</label>
                    <div className="col-sm-9">
                      <textarea
                        className="form-control"
                        rows={2}
                        value={rtoDescription}
                        onChange={(e) => setRtoDescription(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="Type description..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Total Amount <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        className="form-control"
                        value={rtoAmount}
                        onChange={(e) => setRtoAmount(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="3500"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Received Credit</label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        className="form-control"
                        value={rtoCredit}
                        onChange={(e) => setRtoCredit(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="1500"
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Staff</label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={rtoAdmId}
                        onChange={(e) => setRtoAdmId(e.target.value)}
                        disabled={!isAdmin}
                      >
                        <option value="">Select Staff</option>
                        {staffList.map((staff) => (
                          <option key={staff.adm_id} value={staff.adm_id}>
                            {staff.adm_username}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Action <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={rtoAction}
                        onChange={(e) => setRtoAction(e.target.value)}
                        required
                      >
                        <option value="1">Pending</option>
                        <option value="2">Completed</option>
                      </select>
                    </div>
                  </div>

                  {rtoAction === '1' && (
                    <div className="form-group col-md-12">
                      <label className="col-sm-3 control-label">Pending Reason</label>
                      <div className="col-sm-9">
                        <select
                          className="form-control"
                          value={penResId}
                          onChange={(e) => setPenResId(e.target.value)}
                        >
                          <option value="">Select Pending Reason</option>
                          {penResList.map((reason) => (
                            <option key={reason.pen_res_id} value={reason.pen_res_id}>
                              {reason.pen_res_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={rtoStatus}
                        onChange={(e) => setRtoStatus(e.target.value)}
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
                      <button type="button" className="btn btn-default" style={{ marginLeft: '10px' }} onClick={() => router.push('/license')}>
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
