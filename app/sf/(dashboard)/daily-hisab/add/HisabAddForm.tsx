'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHisabRecord } from '../../../../actions/finance';

export default function HisabAddForm({
  nextHisabCode,
  paymentMethods,
  statusList,
}: {
  nextHisabCode: string;
  paymentMethods: any[];
  statusList: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [incexp, setIncexp] = useState('');
  const [pmId, setPmId] = useState('');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [regno, setRegno] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('1'); // Default to Active (1)
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('dl_hsb_date', date);
    formData.append('dl_hsb_incexp', incexp);
    formData.append('pm_id', pmId);
    formData.append('dl_hsb_amount', amount);
    formData.append('dl_hsb_name', name);
    formData.append('dl_hsb_regno', regno);
    formData.append('dl_hsb_description', description);
    formData.append('dl_hsb_status', status);
    if (file) {
      formData.append('dl_hsb_image', file);
    }

    try {
      const res = await createHisabRecord(formData);
      if (res.success) {
        router.refresh();
        if (res.redirect) router.push(res.redirect);
      } else {
        setError(res.error || 'Failed to add daily hisab record.');
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
        <h2><i className="fa fa-plus"></i> Add Daily Hisab</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li><a style={{ color: '#1C1B17' }} href="/sf/daily-hisab">Daily Hisab</a></li>
            <li className="active">Add Daily Hisab</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit}>
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Daily Hisab Details</h4>
                  {error && <p style={{ color: 'red', fontWeight: 'semibold', fontSize: '14px' }}>{error}</p>}
                  <p>Please enter details and select supporting documents below.</p>
                </div>

                <div className="panel-body">
                  {/* Receipt No */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Receipt No.</label>
                    <div className="col-sm-9">
                      <input type="text" disabled className="form-control" value={nextHisabCode} />
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

                  {/* Income/Expense Dropdown */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Income/Expense <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        value={incexp}
                        onChange={(e) => setIncexp(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Income/Expense</option>
                        <option value="1">Income</option>
                        <option value="2">Expense</option>
                      </select>
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
                        placeholder="ex: 500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
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
                        required
                        className="form-control"
                        placeholder="ex: Jakirhusen Parasara"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Reg No */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Reg No.</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ex: GJ01CV0267"
                        value={regno}
                        onChange={(e) => setRegno(e.target.value)}
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
                        placeholder="ex: Type description here..."
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
                      <button type="button" className="btn btn-default" onClick={() => router.push('/sf/daily-hisab')} disabled={loading}>
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
