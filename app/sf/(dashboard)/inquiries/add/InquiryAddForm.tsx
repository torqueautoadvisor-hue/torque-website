'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInquiryRecord } from '../../../../actions/inquiry';

export default function InquiryAddForm({
  nextInqCode,
  reasonsList,
  statusList,
}: {
  nextInqCode: string;
  reasonsList: any[];
  statusList: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState('1'); // Default to Pending (1)
  const [rejResId, setRejResId] = useState('0');
  const [status, setStatus] = useState('1'); // Default to Active (1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      inq_date: date,
      inq_name: name,
      inq_contact: contact,
      inq_address: address,
      inq_remarks: remarks,
      inq_action: action,
      rej_res_id: action === '2' ? rejResId : '0',
      inq_status: status,
    };

    try {
      const res = await createInquiryRecord(payload);
      if (res.success) {
        router.refresh();
        if (res.redirect) router.push(res.redirect);
      } else {
        setError(res.error || 'Failed to add inquiry.');
      }
    } catch {
      setError('Database transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-plus"></i> Add Inquiry</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li><a style={{ color: '#1C1B17' }} href="/sf/inquiries">Inquiries</a></li>
            <li className="active">Add Inquiry</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit}>
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Inquiry Details</h4>
                  {error && <p style={{ color: 'red', fontWeight: 'semibold', fontSize: '14px' }}>{error}</p>}
                  <p>Please enter client details and choose appropriate action parameters below.</p>
                </div>

                <div className="panel-body">
                  {/* Inquiry Code */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Inquiry Code</label>
                    <div className="col-sm-9">
                      <input type="text" disabled className="form-control" value={nextInqCode} />
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

                  {/* Name */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Name <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="ex: Jakirhusen Parasara"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Mobile No. */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Mobile No. <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        pattern="\d*"
                        minLength={10}
                        maxLength={10}
                        className="form-control"
                        required
                        placeholder="ex: 9898569898"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Address</label>
                    <div className="col-sm-9">
                      <textarea
                        className="form-control"
                        cols={30}
                        rows={2}
                        placeholder="ex: Type address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Remarks</label>
                    <div className="col-sm-9">
                      <textarea
                        className="form-control"
                        cols={30}
                        rows={2}
                        placeholder="ex: Type remarks..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Action Selector */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Action <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        disabled={loading}
                      >
                        <option value="1">Pending</option>
                        <option value="2">Rejected</option>
                        <option value="3">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Reasons (Only shown if action is Rejected - 2) */}
                  {action === '2' && (
                    <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                      <label className="col-sm-3 control-label">Reason <span className="asterisk">*</span></label>
                      <div className="col-sm-9">
                        <select
                          required
                          className="form-control"
                          value={rejResId}
                          onChange={(e) => setRejResId(e.target.value)}
                          disabled={loading}
                        >
                          <option value="">Select Reason</option>
                          {reasonsList.map((reason) => (
                            <option key={reason.rej_res_id} value={reason.rej_res_id}>
                              {reason.rej_res_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

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
                      <button type="button" className="btn btn-default" onClick={() => router.push('/sf/inquiries')} disabled={loading}>
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
