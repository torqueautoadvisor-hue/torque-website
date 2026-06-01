'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUghraniRecord } from '../../../actions/ughrani';

export default function UghraniAddForm({
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
  const [ughName, setUghName] = useState('');
  const [ughContact, setUghContact] = useState('');
  const [ughDescription, setUghDescription] = useState('');
  const [ughAmount, setUghAmount] = useState('');
  const [ughDate, setUghDate] = useState(new Date().toISOString().split('T')[0]);
  const [ughDueDate, setUghDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [ughAction, setUghAction] = useState('1'); // 1 = Pending, 2 = Received
  const [ughStatus, setUghStatus] = useState('1'); // 1 = Active, 2 = Inactive

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ughName || !ughContact || !ughAmount || !ughDueDate) {
      setError('Client Name, Contact, Amount, and Due Date are required.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('ugh_name', ughName);
    formData.append('ugh_contact', ughContact);
    formData.append('ugh_description', ughDescription);
    formData.append('ugh_amount', ughAmount);
    formData.append('ugh_date', ughDate);
    formData.append('ugh_due_date', ughDueDate);
    formData.append('ugh_action', ughAction);
    formData.append('ugh_status', ughStatus);

    try {
      const res = await createUghraniRecord(formData);
      if (res.success) {
        router.push(res.redirect || '/ughrani');
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
        <h2><i className="fa fa-plus"></i> Add Ughrani Record</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li><a href="/ughrani">Ughrani List</a></li>
            <li className="active">Add Ughrani</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit} className="form-horizontal">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Ughrani Collection Details</h4>
                  <p>Please enter client outstanding collection information here.</p>
                  {error && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                </div>
                <div className="panel-body">
                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Client Name <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={ughName}
                        onChange={(e) => setUghName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Contact <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={ughContact}
                        onChange={(e) => setUghContact(e.target.value)}
                        placeholder="9876543210"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Description</label>
                    <div className="col-sm-9">
                      <textarea
                        className="form-control"
                        rows={3}
                        value={ughDescription}
                        onChange={(e) => setUghDescription(e.target.value)}
                        placeholder="Type collection description or notes..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Amount <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="number"
                        className="form-control"
                        value={ughAmount}
                        onChange={(e) => setUghAmount(e.target.value)}
                        placeholder="5000"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={ughDate}
                        onChange={(e) => setUghDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Due Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={ughDueDate}
                        onChange={(e) => setUghDueDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Action Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={ughAction}
                        onChange={(e) => setUghAction(e.target.value)}
                        required
                      >
                        <option value="1">Pending</option>
                        <option value="2">Received</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Record Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={ughStatus}
                        onChange={(e) => setUghStatus(e.target.value)}
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
                      <button type="button" className="btn btn-default" style={{ marginLeft: '10px' }} onClick={() => router.push('/ughrani')}>
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
