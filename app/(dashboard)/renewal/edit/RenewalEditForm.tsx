'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateRenewalRecord } from '../../../actions/renewal';

const formatDateForInput = (dateVal: any) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export default function RenewalEditForm({
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
    ren_series: record.ren_series || '',
    ren_date: formatDateForInput(record.ren_date),
    ren_reg_no: record.ren_reg_no || '',
    ren_name: record.ren_name || '',
    ren_contact: record.ren_contact || '',
    ren_altcontact: record.ren_altcontact || '',
    ren_vmodel: record.ren_vmodel || '',
    ren_netprem: record.ren_netprem || '',
    ren_totprem: record.ren_totprem || '',
    ren_category: record.ren_category || '',
    ren_fname: record.ren_fname || '',
    ren_address: record.ren_address || '',
    ren_chassis: record.ren_chassis || '', // GVW
    ren_engine: record.ren_engine || '',  // Insurance Company
    ren_insurance_date: formatDateForInput(record.ren_insurance_date),
    ren_cf_date: formatDateForInput(record.ren_cf_date),
    ren_reg_date: formatDateForInput(record.ren_reg_date),
    ren_permit_date: formatDateForInput(record.ren_permit_date),
    ren_nat_permit_date: formatDateForInput(record.ren_nat_permit_date),
    ren_tax_date: formatDateForInput(record.ren_tax_date),
    ren_qut_date: formatDateForInput(record.ren_qut_date),
    ren_remarks: record.ren_remarks || '',
    ren_adm_id: (record.ren_adm_id || '').toString(),
    ren_action: record.ren_action || '1',
    ren_status: (record.ren_status || '1').toString(),
    rej_res_id: (record.rej_res_id || '').toString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input Validations
    if (!formData.ren_series || !formData.ren_reg_no || !formData.ren_name || !formData.ren_contact || !formData.ren_vmodel || !formData.ren_netprem || !formData.ren_totprem || !formData.ren_category || !formData.ren_engine || !formData.ren_adm_id) {
      setError('All fields marked with an asterisk (*) are required.');
      return;
    }

    if (formData.ren_contact.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (formData.ren_action === '2' && !formData.rej_res_id) {
      setError('Please select a Rejection Reason.');
      return;
    }

    setLoading(true);
    const res = await updateRenewalRecord(record.ren_id, formData);
    setLoading(false);

    if (res.success) {
      router.push(res.redirect || '/renewal');
      router.refresh();
    } else {
      setError(res.error || 'Failed to update Renewal record.');
    }
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-pen"></i> Renewal Edit</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/insurance">Dashboard</a></li>
            <li><a style={{ color: '#1C1B17' }} href="/renewal">Renewal List</a></li>
            <li className="active">Renewal Edit</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit}>
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Renewal Details</h4>
                  {error && <p style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>{error}</p>}
                  <p>Please edit Renewal work details below.</p>
                </div>
                <div className="panel-body">
                  {/* Code */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Renewal Code <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input type="text" disabled className="form-control" value={record.ren_code_no} />
                    </div>
                  </div>

                  {/* Series */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Series <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="ren_series"
                        className="form-control"
                        required
                        value={formData.ren_series}
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
                        name="ren_date"
                        className="form-control"
                        required
                        value={formData.ren_date}
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
                        name="ren_reg_no"
                        className="form-control"
                        required
                        value={formData.ren_reg_no}
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
                        name="ren_name"
                        className="form-control"
                        required
                        value={formData.ren_name}
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
                        name="ren_contact"
                        className="form-control"
                        required
                        maxLength={10}
                        value={formData.ren_contact}
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
                        name="ren_altcontact"
                        className="form-control"
                        maxLength={10}
                        value={formData.ren_altcontact}
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
                        name="ren_vmodel"
                        className="form-control"
                        required
                        value={formData.ren_vmodel}
                        onChange={handleChange}
                        placeholder="Super Carry Std Cng"
                      />
                    </div>
                  </div>

                  {/* Net Premium */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Net Premium <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="ren_netprem"
                        className="form-control"
                        required
                        value={formData.ren_netprem}
                        onChange={handleChange}
                        placeholder="6000"
                      />
                    </div>
                  </div>

                  {/* Total Premium */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Total Premium <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="ren_totprem"
                        className="form-control"
                        required
                        value={formData.ren_totprem}
                        onChange={handleChange}
                        placeholder="8000"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Category <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        name="ren_category"
                        className="form-control"
                        required
                        value={formData.ren_category}
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
                        name="ren_fname"
                        className="form-control"
                        value={formData.ren_fname}
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
                        name="ren_address"
                        className="form-control"
                        rows={2}
                        value={formData.ren_address}
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
                        name="ren_chassis"
                        className="form-control"
                        value={formData.ren_chassis}
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
                        name="ren_engine"
                        className="form-control"
                        required
                        value={formData.ren_engine}
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
                        name="ren_insurance_date"
                        className="form-control"
                        value={formData.ren_insurance_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">CF Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="ren_cf_date"
                        className="form-control"
                        value={formData.ren_cf_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Registration Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="ren_reg_date"
                        className="form-control"
                        value={formData.ren_reg_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Permit Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="ren_permit_date"
                        className="form-control"
                        value={formData.ren_permit_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">National Permit Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="ren_nat_permit_date"
                        className="form-control"
                        value={formData.ren_nat_permit_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">TAX Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="ren_tax_date"
                        className="form-control"
                        value={formData.ren_tax_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Quote Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="ren_qut_date"
                        className="form-control"
                        value={formData.ren_qut_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12">
                    <label className="col-sm-3 control-label">Remarks</label>
                    <div className="col-sm-9">
                      <textarea
                        name="ren_remarks"
                        className="form-control"
                        rows={2}
                        value={formData.ren_remarks}
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
                        name="ren_adm_id"
                        className="form-control"
                        required
                        value={formData.ren_adm_id}
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
                        name="ren_action"
                        className="form-control"
                        required
                        value={formData.ren_action}
                        onChange={handleChange}
                      >
                        <option value="1">Confirmed</option>
                        <option value="2">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Rejection Reasons */}
                  {formData.ren_action === '2' && (
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
                        name="ren_status"
                        className="form-control"
                        required
                        value={formData.ren_status}
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
                        onClick={() => router.push('/renewal')}
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
