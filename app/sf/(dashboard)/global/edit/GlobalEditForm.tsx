'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateGlobalRecord } from '../../../../actions/global';

const formatDate = (dateVal: any) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export default function GlobalEditForm({
  record,
  staffList,
  reasonsList,
  statusList,
}: {
  record: any;
  staffList: any[];
  reasonsList: any[];
  statusList: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states initialized with record values
  const [series, setSeries] = useState(record.glb_series || '');
  const [date, setDate] = useState(formatDate(record.glb_date) || new Date().toISOString().split('T')[0]);
  const [regNo, setRegNo] = useState(record.glb_reg_no || '');
  const [name, setName] = useState(record.glb_name || '');
  const [contact, setContact] = useState(record.glb_contact || '');
  const [altcontact, setAltcontact] = useState(record.glb_altcontact || '');
  const [vmodel, setVmodel] = useState(record.glb_vmodel || '');
  const [category, setCategory] = useState(record.glb_category || '');
  const [fname, setFname] = useState(record.glb_fname || '');
  const [address, setAddress] = useState(record.glb_address || '');
  const [chassis, setChassis] = useState(record.glb_chassis || ''); // GVW
  const [engine, setEngine] = useState(record.glb_engine || '');   // Insurance Company
  
  // Date states
  const [insuranceDate, setInsuranceDate] = useState(formatDate(record.glb_insurance_date));
  const [cfDate, setCfDate] = useState(formatDate(record.glb_cf_date));
  const [regDate, setRegDate] = useState(formatDate(record.glb_reg_date));
  const [permitDate, setPermitDate] = useState(formatDate(record.glb_permit_date));
  const [natPermitDate, setNatPermitDate] = useState(formatDate(record.glb_nat_permit_date));
  const [taxDate, setTaxDate] = useState(formatDate(record.glb_tax_date));
  const [qutDate, setQutDate] = useState(formatDate(record.glb_qut_date));
  
  const [remarks, setRemarks] = useState(record.glb_remarks || '');
  const [admId, setAdmId] = useState(record.glb_adm_id ? String(record.glb_adm_id) : '');
  const [action, setAction] = useState(record.glb_action ? String(record.glb_action) : '1');
  const [rejResId, setRejResId] = useState(record.rej_res_id ? String(record.rej_res_id) : '0');
  const [status, setStatus] = useState(record.glb_status ? String(record.glb_status) : '1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      glb_series: series,
      glb_date: date,
      glb_reg_no: regNo.toUpperCase().trim(),
      glb_name: name,
      glb_contact: contact,
      glb_altcontact: altcontact,
      glb_vmodel: vmodel,
      glb_category: category,
      glb_fname: fname,
      glb_address: address,
      glb_chassis: chassis,
      glb_engine: engine,
      glb_insurance_date: insuranceDate,
      glb_cf_date: cfDate,
      glb_reg_date: regDate,
      glb_permit_date: permitDate,
      glb_nat_permit_date: natPermitDate,
      glb_tax_date: taxDate,
      glb_qut_date: qutDate,
      glb_remarks: remarks,
      glb_adm_id: admId,
      glb_action: action,
      rej_res_id: action === '2' ? rejResId : '0',
      glb_status: status,
    };

    try {
      const res = await updateGlobalRecord(record.glb_id, payload);
      if (res.success) {
        router.refresh();
        if (res.redirect) router.push(res.redirect);
      } else {
        setError(res.error || 'Failed to update record.');
      }
    } catch (err: any) {
      setError('Database transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-edit"></i> Edit Global</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li><a style={{ color: '#1C1B17' }} href="/sf/global">Global List</a></li>
            <li className="active">Edit Global</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit}>
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Global Details ({record.glb_code_no})</h4>
                  {error && <p style={{ color: 'red', fontWeight: 'semibold', fontSize: '14px' }}>{error}</p>}
                  <p>Please update client details and choose appropriate action parameters below.</p>
                </div>
                
                <div className="panel-body">
                  {/* Global Code */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Global Code</label>
                    <div className="col-sm-9">
                      <input type="text" disabled className="form-control" value={record.glb_code_no || ''} />
                    </div>
                  </div>

                  {/* Series */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Series <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="glb_series"
                        className="form-control"
                        required
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        placeholder="ex: A"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Date <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="glb_date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Register No. */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Register No. <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="glb_reg_no"
                        className="form-control"
                        required
                        value={regNo}
                        onChange={(e) => setRegNo(e.target.value)}
                        placeholder="GJ01CV0267"
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
                        name="glb_name"
                        className="form-control"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jakirhusen Parasara"
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
                        name="glb_contact"
                        className="form-control"
                        pattern="\d*"
                        minLength={10}
                        maxLength={10}
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="9898569898"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Alt Mobile No. */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Alt Mobile No.</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="glb_altcontact"
                        className="form-control"
                        pattern="\d*"
                        minLength={10}
                        maxLength={10}
                        value={altcontact}
                        onChange={(e) => setAltcontact(e.target.value)}
                        placeholder="9898569898"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Model */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Model <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="glb_vmodel"
                        className="form-control"
                        required
                        value={vmodel}
                        onChange={(e) => setVmodel(e.target.value)}
                        placeholder="Super Carry Std Cng"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Category <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        name="glb_category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={loading}
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
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Father Name</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="glb_fname"
                        className="form-control"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                        placeholder="Alibhai Parasara"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Address</label>
                    <div className="col-sm-9">
                      <textarea
                        name="glb_address"
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

                  {/* GVW (glb_chassis) */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">GVW</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        name="glb_chassis"
                        className="form-control"
                        value={chassis}
                        onChange={(e) => setChassis(e.target.value)}
                        placeholder="11990"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Insurance Company (glb_engine) */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Insurance Company <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        name="glb_engine"
                        value={engine}
                        onChange={(e) => setEngine(e.target.value)}
                        disabled={loading}
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
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Insurance Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="glb_insurance_date"
                        className="form-control"
                        value={insuranceDate}
                        onChange={(e) => setInsuranceDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">CF Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="glb_cf_date"
                        className="form-control"
                        value={cfDate}
                        onChange={(e) => setCfDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Registration Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="glb_reg_date"
                        className="form-control"
                        value={regDate}
                        onChange={(e) => setRegDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Permit Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="glb_permit_date"
                        className="form-control"
                        value={permitDate}
                        onChange={(e) => setPermitDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">National Permit Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="glb_nat_permit_date"
                        className="form-control"
                        value={natPermitDate}
                        onChange={(e) => setNatPermitDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">TAX Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="glb_tax_date"
                        className="form-control"
                        value={taxDate}
                        onChange={(e) => setTaxDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Quote Date</label>
                    <div className="col-sm-9">
                      <input
                        type="date"
                        name="glb_qut_date"
                        className="form-control"
                        value={qutDate}
                        onChange={(e) => setQutDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Remarks</label>
                    <div className="col-sm-9">
                      <textarea
                        name="glb_remarks"
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

                  {/* Assign to Staff */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Staff <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        name="glb_adm_id"
                        value={admId}
                        onChange={(e) => setAdmId(e.target.value)}
                        disabled={loading}
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

                  {/* Action Selector */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Action <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        name="glb_action"
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
                          name="rej_res_id"
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

                  {/* Status Detail */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        name="glb_status"
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
                      <button type="button" className="btn btn-default" onClick={() => router.push('/sf/global')} disabled={loading}>
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
