'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRenewalFollowupAction } from '../../../actions/renewal';

const formatDate = (dateVal: string) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

export default function RenewalFollowupForm({
  record,
  followups,
  flag = '',
}: {
  record: any;
  followups: any[];
  flag?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    ren_id: record.ren_id.toString(),
    renflp_date: new Date().toISOString().split('T')[0],
    renflp_reminder_date: '',
    renflp_notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.renflp_date || !formData.renflp_notes) {
      setError('Date and Notes are required.');
      return;
    }

    setLoading(true);
    const res = await createRenewalFollowupAction(formData);
    setLoading(false);

    if (res.success) {
      setFormData((prev) => ({
        ...prev,
        renflp_notes: '',
        renflp_reminder_date: '',
      }));
      router.refresh();
    } else {
      setError(res.error || 'Failed to submit followup.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-plus"></i> Follow Up - {record.ren_name} ({record.ren_code_no})</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li><a style={{ color: '#1C1B17' }} href="/renewal">Renewal List</a></li>
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
                  <h4 className="panel-title">Follow Up Details</h4>
                  {flag === '1' && <p style={{ color: 'green', fontWeight: 'bold' }}>Followup added successfully.</p>}
                  {error && <p style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>{error}</p>}
                  <p>Log a new followup note below.</p>
                </div>
                <div className="panel-body">
                  {/* Date */}
                  <div className="form-group">
                    <label className="control-label">Date <span className="asterisk">*</span></label>
                    <input
                      type="date"
                      name="renflp_date"
                      className="form-control"
                      required
                      value={formData.renflp_date}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Reminder Date */}
                  <div className="form-group">
                    <label className="control-label">Reminder Date</label>
                    <input
                      type="date"
                      name="renflp_reminder_date"
                      className="form-control"
                      value={formData.renflp_reminder_date}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Notes */}
                  <div className="form-group">
                    <label className="control-label">Notes <span className="asterisk">*</span></label>
                    <textarea
                      name="renflp_notes"
                      className="form-control"
                      required
                      rows={3}
                      value={formData.renflp_notes}
                      onChange={handleChange}
                      placeholder="Type message..."
                    />
                  </div>
                </div>

                <div className="panel-footer">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="reset"
                    onClick={() => {
                      setFormData({
                        ren_id: record.ren_id.toString(),
                        renflp_date: new Date().toISOString().split('T')[0],
                        renflp_reminder_date: '',
                        renflp_notes: '',
                      });
                      setError('');
                    }}
                    className="btn btn-default"
                    style={{ marginLeft: '10px', backgroundColor: '#fff' }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>

            <br />
            <h2>Follow Up Logs</h2>
            <br />

            <div className="table-responsive">
              <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                  <tr>
                    <th style={{ width: '15%' }}>Date</th>
                    <th style={{ width: '15%' }}>Reminder Date</th>
                    <th style={{ width: '55%' }}>Notes</th>
                    <th style={{ width: '15%' }}>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {followups.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">No past followup logs found.</td>
                    </tr>
                  ) : (
                    followups.map((flp) => {
                      const reminderDateStr = flp.renflp_reminder_date ? new Date(flp.renflp_reminder_date).toISOString().split('T')[0] : '';
                      const isDueToday = reminderDateStr === todayStr;

                      return (
                        <tr key={flp.renflp_id}>
                          <td>{formatDate(flp.renflp_date)}</td>
                          <td
                            className={isDueToday ? 'blink_me' : ''}
                            style={isDueToday ? { color: 'red', fontWeight: 'bold' } : {}}
                          >
                            {flp.renflp_reminder_date ? formatDate(flp.renflp_reminder_date) : ''}
                          </td>
                          <td>{flp.renflp_notes}</td>
                          <td>{flp.adm_username}</td>
                        </tr>
                      );
                    })
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
