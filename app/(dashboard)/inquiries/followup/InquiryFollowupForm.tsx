'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInquiryFollowupAction } from '../../../actions/inquiry';

export default function InquiryFollowupForm({
  inquiry,
  followups,
  flag,
}: {
  inquiry: any;
  followups: any[];
  flag: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await createInquiryFollowupAction({
        inq_id: inquiry.inq_id,
        inqflp_date: date,
        inqflp_reminder_date: reminderDate,
        inqflp_notes: notes,
      });

      if (res.success) {
        setNotes('');
        setReminderDate('');
        router.refresh();
      } else {
        setError(res.error || 'Failed to add followup note.');
      }
    } catch {
      setError('Database transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateString = (dateVal: any) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const isReminderToday = (remDateStr: any) => {
    if (!remDateStr) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    const dStr = new Date(remDateStr).toISOString().split('T')[0];
    return todayStr === dStr;
  };

  return (
    <div>
      <style>{`
        .blink_me {
          animation: blinker 1s linear infinite;
        }
        @keyframes blinker {
          50% {
            opacity: 0;
          }
        }
      `}</style>

      <div className="pageheader">
        <h2><i className="fa fa-comment"></i> Follow Up - {inquiry.inq_name} ({inquiry.inq_code_no})</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li><a style={{ color: '#1C1B17' }} href="/inquiries">Inquiries</a></li>
            <li className="active">Follow Up</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit}>
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Add Follow Up Note</h4>
                  {error && <p style={{ color: 'red', fontWeight: 'semibold', fontSize: '14px' }}>{error}</p>}
                  {flag === '1' && <p style={{ color: 'green', fontWeight: 'semibold', fontSize: '14px' }}>Follow up details added successfully.</p>}
                  <p>Please enter the follow up notes and next reminder parameters below.</p>
                </div>

                <div className="panel-body">
                  {/* Follow Up Date */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Reminder Date */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Reminder Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Notes <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <textarea
                        required
                        className="form-control"
                        cols={30}
                        rows={3}
                        placeholder="ex: Customer wants to proceed next Monday..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                </div>

                <div className="panel-footer">
                  <div className="row">
                    <div className="col-sm-12 col-lg-12 col-md-12 col-xs-12 ml_15">
                      <button type="submit" className="btn btn-primary" style={{ marginRight: '5px' }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                      </button>
                      <button type="button" className="btn btn-default" onClick={() => router.push('/inquiries')} disabled={loading}>
                        Back to List
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </form>

            <div className="table-responsive" style={{ marginTop: '30px' }}>
              <h4 style={{ marginBottom: '15px', fontWeight: 'bold' }}>Past Follow-Up History</h4>
              <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                  <tr>
                    <th style={{ width: '15%' }}>Date</th>
                    <th style={{ width: '15%' }}>Reminder Date</th>
                    <th style={{ width: '55%' }}>Notes</th>
                    <th style={{ width: '15%' }}>Admin / User</th>
                  </tr>
                </thead>
                <tbody>
                  {followups.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">No past follow-ups recorded.</td>
                    </tr>
                  ) : (
                    followups.map((row) => (
                      <tr key={row.inqflp_id} className="odd gradeX">
                        <td>{formatDateString(row.inqflp_date)}</td>
                        <td 
                          className={isReminderToday(row.inqflp_reminder_date) ? 'blink_me' : ''}
                          style={isReminderToday(row.inqflp_reminder_date) ? { color: 'red', fontWeight: 'bold' } : {}}
                        >
                          {formatDateString(row.inqflp_reminder_date) || 'No reminder set'}
                        </td>
                        <td>{row.inqflp_notes}</td>
                        <td>{row.adm_username}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
