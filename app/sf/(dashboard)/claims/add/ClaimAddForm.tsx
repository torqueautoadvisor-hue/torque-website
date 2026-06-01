'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClaimRecord } from '../../../../actions/claim';

export default function ClaimAddForm({
  clmCodeNo,
  staffList,
  branchId,
  isAdmin,
}: {
  clmCodeNo: string;
  staffList: any[];
  branchId: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form field states
  const [clmDate, setClmDate] = useState(new Date().toISOString().split('T')[0]);
  const [clmAccident, setClmAccident] = useState(new Date().toISOString().split('T')[0]);
  const [clmNo, setClmNo] = useState('');
  const [clmAmount, setClmAmount] = useState('');
  const [clmRegno, setClmRegno] = useState('');
  const [clmName, setClmName] = useState('');
  const [clmContact, setClmContact] = useState('');
  const [clmDescription, setClmDescription] = useState('');
  const [clmAdmId, setClmAdmId] = useState('');
  const [clmAction, setClmAction] = useState('');
  const [clmStageNo, setClmStageNo] = useState('');
  const [clmStatus, setClmStatus] = useState('1'); // Active by default

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clmNo || !clmRegno || !clmName || !clmContact || !clmAmount || !clmAction || !clmStageNo) {
      setError('All fields marked with an asterisk are required.');
      return;
    }

    if (clmContact.length !== 10 || !/^\d+$/.test(clmContact)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    const fileInput = document.getElementById('clm_pdf') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError('Policy PDF file is required.');
      return;
    }

    if (file.name.split('.').pop()?.toLowerCase() !== 'pdf') {
      setError('Invalid file type. Only PDF is allowed.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('clm_date', clmDate);
    formData.append('clm_accident', clmAccident);
    formData.append('clm_no', clmNo);
    formData.append('clm_amount', clmAmount);
    formData.append('clm_regno', clmRegno);
    formData.append('clm_pdf', file);
    formData.append('clm_name', clmName);
    formData.append('clm_contact', clmContact);
    formData.append('clm_description', clmDescription);
    formData.append('clm_adm_id', clmAdmId);
    formData.append('clm_action', clmAction);
    formData.append('clm_stage_no', clmStageNo);
    formData.append('clm_status', clmStatus);

    try {
      const res = await createClaimRecord(formData);
      if (res.success) {
        router.push(res.redirect || '/sf/claims');
        router.refresh();
      } else {
        setError(res.error || 'Failed to create claim record.');
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
        <h2><i className="fa fa-plus"></i> Add Claim</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li><a href="/sf/claims">Claim List</a></li>
            <li className="active">Add Claim</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit} className="form-horizontal">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Claim Details</h4>
                  <p>Please set claim work details here.</p>
                  {error && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                </div>
                <div className="panel-body">
                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Claim Code <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input type="text" disabled className="form-control" value={clmCodeNo} />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={clmDate}
                        onChange={(e) => setClmDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Accident Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        className="form-control"
                        value={clmAccident}
                        onChange={(e) => setClmAccident(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Claim No <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={clmNo}
                        onChange={(e) => setClmNo(e.target.value)}
                        placeholder="CLAIM0001"
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
                        value={clmAmount}
                        onChange={(e) => setClmAmount(e.target.value)}
                        placeholder="50000"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Reg No. <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        value={clmRegno}
                        onChange={(e) => setClmRegno(e.target.value)}
                        placeholder="GJ01AJ5896"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Policy PDF (Only PDF) <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="file"
                        id="clm_pdf"
                        accept=".pdf"
                        className="form-control"
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
                        value={clmName}
                        onChange={(e) => setClmName(e.target.value)}
                        placeholder="Jakirhusen Parasara"
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
                        value={clmContact}
                        onChange={(e) => setClmContact(e.target.value.replace(/\D/g, ''))}
                        maxLength={10}
                        placeholder="9898569898"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Description <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <textarea
                        className="form-control"
                        rows={2}
                        value={clmDescription}
                        onChange={(e) => setClmDescription(e.target.value)}
                        placeholder="Type description..."
                        required
                      ></textarea>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="form-group col-md-12">
                      <label className="col-sm-3 control-label">Staff</label>
                      <div className="col-sm-9">
                        <select
                          className="form-control"
                          value={clmAdmId}
                          onChange={(e) => setClmAdmId(e.target.value)}
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
                  )}

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Action <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={clmAction}
                        onChange={(e) => setClmAction(e.target.value)}
                        required
                      >
                        <option value="">Select Action</option>
                        <option value="1">Pending</option>
                        <option value="2">Settled</option>
                        <option value="3">Partially Settled</option>
                        <option value="4">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Stage <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={clmStageNo}
                        onChange={(e) => setClmStageNo(e.target.value)}
                        required
                      >
                        <option value="">Select Stage</option>
                        <option value="1">Intimation</option>
                        <option value="2">Survey</option>
                        <option value="3">Estimate</option>
                        <option value="4">Approval</option>
                        <option value="5">Delivery</option>
                        <option value="6">Payment Credited</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={clmStatus}
                        onChange={(e) => setClmStatus(e.target.value)}
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
                      <button type="reset" className="btn btn-default" style={{ marginLeft: '10px' }} onClick={() => router.push('/sf/claims')}>
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
