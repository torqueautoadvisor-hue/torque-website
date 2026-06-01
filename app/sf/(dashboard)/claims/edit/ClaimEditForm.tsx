'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateClaimRecord } from '../../../../actions/claim';

export default function ClaimEditForm({
  record,
  staffList,
  statusList,
  branchId,
  isAdmin,
}: {
  record: any;
  staffList: any[];
  statusList: any[];
  branchId: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form field states
  const [clmDate, setClmDate] = useState(record.clm_date ? new Date(record.clm_date).toISOString().split('T')[0] : '');
  const [clmAccident, setClmAccident] = useState(record.clm_accident ? new Date(record.clm_accident).toISOString().split('T')[0] : '');
  const [clmNo, setClmNo] = useState(record.clm_no || '');
  const [clmAmount, setClmAmount] = useState(record.clm_amount || '');
  const [clmRegno, setClmRegno] = useState(record.clm_regno || '');
  const [clmName, setClmName] = useState(record.clm_name || '');
  const [clmContact, setClmContact] = useState(record.clm_contact || '');
  const [clmDescription, setClmDescription] = useState(record.clm_description || '');
  const [clmAdmId, setClmAdmId] = useState(record.clm_adm_id || '');
  const [clmAction, setClmAction] = useState(record.clm_action || '');
  const [clmStageNo, setClmStageNo] = useState(record.clm_stage_no || '');
  const [clmStatus, setClmStatus] = useState(record.clm_status || '1');

  // Policy PDF state
  const [existingPdfUrl, setExistingPdfUrl] = useState(record.clm_pdf || '');
  const [removePdf, setRemovePdf] = useState(false);

  const handleRemovePdf = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure want to delete pdf?')) {
      setRemovePdf(true);
      setExistingPdfUrl('');
    }
  };

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

    // If PDF is removed and no new file is uploaded, verify it's valid
    if (removePdf && !file) {
      setError('A Policy PDF file is required.');
      return;
    }

    if (file && file.name.split('.').pop()?.toLowerCase() !== 'pdf') {
      setError('Invalid file type. Only PDF is allowed.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('clm_date', clmDate);
    formData.append('clm_accident', clmAccident);
    formData.append('clm_no', clmNo);
    formData.append('clm_amount', clmAmount.toString());
    formData.append('clm_regno', clmRegno);
    formData.append('clm_name', clmName);
    formData.append('clm_contact', clmContact);
    formData.append('clm_description', clmDescription);
    formData.append('clm_adm_id', clmAdmId.toString());
    formData.append('clm_action', clmAction.toString());
    formData.append('clm_stage_no', clmStageNo.toString());
    formData.append('clm_status', clmStatus.toString());
    formData.append('hdp_image', record.clm_pdf || '');
    formData.append('remove_pdf', removePdf ? 'true' : 'false');
    if (file) {
      formData.append('clm_pdf', file);
    }

    try {
      const res = await updateClaimRecord(record.clm_id, formData);
      if (res.success) {
        router.push(res.redirect || '/sf/claims');
        router.refresh();
      } else {
        setError(res.error || 'Failed to update claim record.');
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
        <h2><i className="fa fa-pen"></i> Claim Edit</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li><a href="/sf/claims">Claim List</a></li>
            <li className="active">Claim Edit</li>
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
                      <input type="text" disabled className="form-control" value={record.clm_code_no} />
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
                        readOnly={!isAdmin}
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
                        readOnly={!isAdmin}
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
                        readOnly={!isAdmin}
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
                        readOnly={!isAdmin}
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
                        readOnly={!isAdmin}
                        placeholder="GJ01AJ5896"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Policy PDF (Only PDF) <span className="asterisk">*</span></label>
                    <div className="col-sm-4">
                      <input
                        type="file"
                        id="clm_pdf"
                        accept=".pdf"
                        className="form-control"
                        disabled={!isAdmin && existingPdfUrl !== ''}
                      />
                    </div>
                    <div className="col-sm-5">
                      {existingPdfUrl ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <iframe
                            src={existingPdfUrl}
                            width="100%"
                            height="200px"
                            style={{ border: '1px solid #ddd' }}
                          ></iframe>
                          {isAdmin && (
                            <a
                              href="#"
                              onClick={handleRemovePdf}
                              style={{ color: 'red', textDecoration: 'underline', fontSize: '12px' }}
                            >
                              Remove PDF
                            </a>
                          )}
                        </div>
                      ) : (
                        <p style={{ color: 'gray', fontStyle: 'italic', marginTop: '10px' }}>PDF not available</p>
                      )}
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
                        readOnly={!isAdmin}
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
                        readOnly={!isAdmin}
                        maxLength={10}
                        placeholder="9898569898"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Task Description <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <textarea
                        className="form-control"
                        rows={2}
                        value={clmDescription}
                        onChange={(e) => setClmDescription(e.target.value)}
                        readOnly={!isAdmin}
                        placeholder="Type description..."
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="form-group col-md-12">
                    <label className="col-sm-3 control-label">Staff</label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={clmAdmId}
                        onChange={(e) => setClmAdmId(e.target.value)}
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
                        disabled={!isAdmin}
                        required
                      >
                        {statusList.map((st) => (
                          <option key={st.status_id} value={st.status_id}>
                            {st.status_name}
                          </option>
                        ))}
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
                      <button type="button" className="btn btn-default" style={{ marginLeft: '10px' }} onClick={() => router.push('/sf/claims')}>
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
