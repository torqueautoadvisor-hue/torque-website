'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateTakenRecord } from '../../../../actions/taken';

const formatDateForInput = (dateVal: any) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export default function TakenEditForm({
  record,
  staffList,
  statusList,
  rejectionReasons,
  branchId,
  isAdmin,
}: {
  record: any;
  staffList: any[];
  statusList: any[];
  rejectionReasons: any[];
  branchId: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    tkn_series: record.tkn_series || '',
    tkn_date: formatDateForInput(record.tkn_date),
    tkn_reg_no: record.tkn_reg_no || '',
    tkn_name: record.tkn_name || '',
    tkn_contact: record.tkn_contact || '',
    tkn_altcontact: record.tkn_altcontact || '',
    tkn_vmodel: record.tkn_vmodel || '',
    tkn_category: record.tkn_category || '',
    tkn_fname: record.tkn_fname || '',
    tkn_address: record.tkn_address || '',
    tkn_chassis: record.tkn_chassis || '', // GVW
    tkn_engine: record.tkn_engine || '',  // Insurance Company
    tkn_insurance_date: formatDateForInput(record.tkn_insurance_date),
    tkn_cf_date: formatDateForInput(record.tkn_cf_date),
    tkn_reg_date: formatDateForInput(record.tkn_reg_date),
    tkn_permit_date: formatDateForInput(record.tkn_permit_date),
    tkn_nat_permit_date: formatDateForInput(record.tkn_nat_permit_date),
    tkn_tax_date: formatDateForInput(record.tkn_tax_date),
    tkn_qut_date: formatDateForInput(record.tkn_qut_date),
    tkn_remarks: record.tkn_remarks || '',
    tkn_adm_id: (record.tkn_adm_id || '').toString(),
    tkn_action: record.tkn_action || '1',
    tkn_status: (record.tkn_status || '1').toString(),
    rej_res_id: (record.rej_res_id || '').toString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Form Field Validations
    if (!formData.tkn_series || !formData.tkn_reg_no || !formData.tkn_name || !formData.tkn_contact || !formData.tkn_vmodel || !formData.tkn_category || !formData.tkn_engine || !formData.tkn_adm_id) {
      setError('All fields marked with an asterisk (*) are required.');
      return;
    }

    if (formData.tkn_contact.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (formData.tkn_action === '2' && !formData.rej_res_id) {
      setError('Please select a Rejection Reason.');
      return;
    }

    setLoading(true);
    const res = await updateTakenRecord(record.tkn_id, formData);
    setLoading(false);

    if (res.success) {
      router.push(res.redirect || '/sf/taken');
      router.refresh();
    } else {
      setError(res.error || 'Failed to update Taken record.');
    }
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-pen"></i> Taken Edit</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li><a style={{ color: '#1C1B17' }} href="/sf/taken">Taken List</a></li>
            <li className="active">Taken Edit</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit}>
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Taken Details</h4>
                  {error && <p style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>{error}</p>}
                  <p>Please edit Taken work details below.</p>
                </div>
                <div className="panel-body">
                  {/* Code */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Taken Code <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input type="text" disabled className="form-control" value={record.tkn_code_no} />
                    </div>
                  </div>

                  {/* Series */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Series <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="tkn_series"
                        className="form-control"
                        required
                        value={formData.tkn_series}
                        onChange={handleChange}
                        placeholder="ex: A"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="tkn_date"
                        className="form-control"
                        required
                        value={formData.tkn_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Registration No */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Register No. <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="tkn_reg_no"
                        className="form-control"
                        required
                        value={formData.tkn_reg_no}
                        onChange={handleChange}
                        placeholder="GJ01CV0267"
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Name <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="tkn_name"
                        className="form-control"
                        required
                        value={formData.tkn_name}
                        onChange={handleChange}
                        placeholder="Jakirhusen Parasara"
                      />
                    </div>
                  </div>

                  {/* Mobile No */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Mobile No. <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="tkn_contact"
                        className="form-control"
                        required
                        maxLength={10}
                        value={formData.tkn_contact}
                        onChange={handleChange}
                        placeholder="9898569898"
                      />
                    </div>
                  </div>

                  {/* Alt Contact */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Alt Mobile No.</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="tkn_altcontact"
                        className="form-control"
                        maxLength={10}
                        value={formData.tkn_altcontact}
                        onChange={handleChange}
                        placeholder="9898569898"
                      />
                    </div>
                  </div>

                  {/* Model */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Model <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="tkn_vmodel"
                        className="form-control"
                        required
                        value={formData.tkn_vmodel}
                        onChange={handleChange}
                        placeholder="Super Carry Std Cng"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Category <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        name="tkn_category"
                        className="form-control"
                        required
                        value={formData.tkn_category}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        <option value="LCV">LCV</option>
                        <option value="HGV">HGV</option>
                        <option value="LMV">LMV</option>
                        <option value="3W PCV">3W PCV</option>
                        <option value="3W GCV">3W GCV</option>
                        <option value="2W">2W</option>
                        <option value="TAXI">TAXI</option>
                        <option value="BUS">BUS</option>
                        <option value="STAFF BUS">STAFF BUS</option>
                        <option value="SCHOOL BUS">SCHOOL BUS</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                  </div>

                  {/* Father Name */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Father Name</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="tkn_fname"
                        className="form-control"
                        value={formData.tkn_fname}
                        onChange={handleChange}
                        placeholder="Alibhai Parasara"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Address</label>
                    <div className="col-sm-9">
                      <textarea
                        name="tkn_address"
                        className="form-control"
                        rows={2}
                        value={formData.tkn_address}
                        onChange={handleChange}
                        placeholder="Type address..."
                      />
                    </div>
                  </div>

                  {/* GVW */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">GVW</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="tkn_chassis"
                        className="form-control"
                        value={formData.tkn_chassis}
                        onChange={handleChange}
                        placeholder="11990"
                      />
                    </div>
                  </div>

                  {/* Insurance Company */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Insurance Company <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        name="tkn_engine"
                        className="form-control"
                        required
                        value={formData.tkn_engine}
                        onChange={handleChange}
                      >
                        <option value="">Select Insurance Company</option>
                        <option value="HDFC">HDFC</option>
                        <option value="ICICI">ICICI</option>
                        <option value="RELIANCE">RELIANCE</option>
                        <option value="TATA AIG">TATA AIG</option>
                        <option value="GO DIGIT">GO DIGIT</option>
                        <option value="CHOLA MS">CHOLA MS</option>
                        <option value="BAJAJ">BAJAJ</option>
                        <option value="MAGMA">MAGMA</option>
                        <option value="UNITED">UNITED</option>
                        <option value="NEW INDIA">NEW INDIA</option>
                        <option value="ORIENTAL">ORIENTAL</option>
                        <option value="SBI">SBI</option>
                        <option value="FUTURE">FUTURE</option>
                        <option value="UNIVERSAL SOMPO">UNIVERSAL SOMPO</option>
                        <option value="SHRIRAM">SHRIRAM</option>
                        <option value="NATIONAL">NATIONAL</option>
                        <option value="IFFCO">IFFCO</option>
                        <option value="LIBERTY">LIBERTY</option>
                        <option value="ROYAL SUNDARAM">ROYAL SUNDARAM</option>
                        <option value="ZUNO">ZUNO</option>
                        <option value="KOTAK">KOTAK</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Insurance Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="tkn_insurance_date"
                        className="form-control"
                        value={formData.tkn_insurance_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">CF Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="tkn_cf_date"
                        className="form-control"
                        value={formData.tkn_cf_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Registration Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="tkn_reg_date"
                        className="form-control"
                        value={formData.tkn_reg_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Permit Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="tkn_permit_date"
                        className="form-control"
                        value={formData.tkn_permit_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">National Permit Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="tkn_nat_permit_date"
                        className="form-control"
                        value={formData.tkn_nat_permit_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">TAX Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="tkn_tax_date"
                        className="form-control"
                        value={formData.tkn_tax_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Quote Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="tkn_qut_date"
                        className="form-control"
                        value={formData.tkn_qut_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Remarks</label>
                    <div className="col-sm-9">
                      <textarea
                        name="tkn_remarks"
                        className="form-control"
                        rows={2}
                        value={formData.tkn_remarks}
                        onChange={handleChange}
                        placeholder="Type remarks..."
                      />
                    </div>
                  </div>

                  {/* Staff Assign */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Staff <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        name="tkn_adm_id"
                        className="form-control"
                        required
                        value={formData.tkn_adm_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Staff</option>
                        {staffList.map((staff) => (
                          <option key={staff.adm_id} value={staff.adm_id.toString()}>
                            {staff.adm_username}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Action <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        name="tkn_action"
                        className="form-control"
                        required
                        value={formData.tkn_action}
                        onChange={handleChange}
                      >
                        <option value="1">Pending</option>
                        <option value="2">Rejected</option>
                        <option value="3">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Rejection Reasons */}
                  {formData.tkn_action === '2' && (
                    <div className="form-group col-md-12 col-lg-12 col-sm-12">
                      <label className="col-sm-3 control-label">Reason <span className="asterisk">*</span></label>
                      <div className="col-sm-9">
                        <select
                          name="rej_res_id"
                          className="form-control"
                          required
                          value={formData.rej_res_id}
                          onChange={handleChange}
                        >
                          <option value="">Select Reason</option>
                          {rejectionReasons.map((rej) => (
                            <option key={rej.rej_res_id} value={rej.rej_res_id.toString()}>
                              {rej.rej_res_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        name="tkn_status"
                        className="form-control"
                        required
                        value={formData.tkn_status}
                        onChange={handleChange}
                      >
                        {statusList.map((st) => (
                          <option key={st.status_id} value={st.status_id.toString()}>
                            {st.status_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="panel-footer">
                  <div className="row">
                    <div className="col-sm-12 ml_15" style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/sf/taken')}
                        className="btn btn-default"
                        style={{ backgroundColor: '#fff' }}
                      >
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
