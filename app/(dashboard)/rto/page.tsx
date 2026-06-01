import { cookies } from 'next/headers';
import { db } from '../../../lib/db';

export default async function RtoDashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;

  const user = JSON.parse(session);
  const branchId = user.branch_id || 1;
  const adminId = user.adm_id;
  const isAdmin = user.adm_type === 0;

  // Set up date window (today and next 3 days)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0];

  let licenseWork: any[] = [];
  let vahanWork: any[] = [];

  try {
    // 1. Fetch Upcoming 3 Days - License Work (service_id = 1)
    const licQuery = isAdmin
      ? `SELECT td.*, st.status_name, al.adm_username, pr.pen_res_name
         FROM rto_detail td
         JOIN status_detail st ON st.status_id = td.rto_status
         LEFT JOIN admin_login al ON al.adm_id = td.rto_adm_id
         LEFT JOIN pen_res_detail pr ON pr.pen_res_id = td.pen_res_id
         WHERE td.rto_status != 3 AND td.rto_action IN ('1', '2') AND td.service_id = 1 AND td.branch_id = $1
           AND DATE(td.rto_duedate) >= $2 AND DATE(td.rto_duedate) <= $3
         ORDER BY td.rto_id`
      : `SELECT td.*, st.status_name, al.adm_username, pr.pen_res_name
         FROM rto_detail td
         JOIN status_detail st ON st.status_id = td.rto_status
         LEFT JOIN admin_login al ON al.adm_id = td.rto_adm_id
         LEFT JOIN pen_res_detail pr ON pr.pen_res_id = td.pen_res_id
         WHERE td.rto_status != 3 AND td.rto_action IN ('1', '2') AND td.service_id = 1 AND td.branch_id = $1
           AND DATE(td.rto_duedate) >= $2 AND DATE(td.rto_duedate) <= $3 AND td.rto_adm_id = $4
         ORDER BY td.rto_id`;

    const licParams = isAdmin ? [branchId, todayStr, threeDaysLaterStr] : [branchId, todayStr, threeDaysLaterStr, adminId];
    const licRes = await db.query(licQuery, licParams);
    licenseWork = licRes.rows;

    // 2. Fetch Upcoming 3 Days - Vahan Work (service_id = 2)
    const vhnQuery = isAdmin
      ? `SELECT td.*, st.status_name, al.adm_username, pr.pen_res_name
         FROM rto_detail td
         JOIN status_detail st ON st.status_id = td.rto_status
         LEFT JOIN admin_login al ON al.adm_id = td.rto_adm_id
         LEFT JOIN pen_res_detail pr ON pr.pen_res_id = td.pen_res_id
         WHERE td.rto_status != 3 AND td.rto_action IN ('1', '2') AND td.service_id = 2 AND td.branch_id = $1
           AND DATE(td.rto_duedate) >= $2 AND DATE(td.rto_duedate) <= $3
         ORDER BY td.rto_id`
      : `SELECT td.*, st.status_name, al.adm_username, pr.pen_res_name
         FROM rto_detail td
         JOIN status_detail st ON st.status_id = td.rto_status
         LEFT JOIN admin_login al ON al.adm_id = td.rto_adm_id
         LEFT JOIN pen_res_detail pr ON pr.pen_res_id = td.pen_res_id
         WHERE td.rto_status != 3 AND td.rto_action IN ('1', '2') AND td.service_id = 2 AND td.branch_id = $1
           AND DATE(td.rto_duedate) >= $2 AND DATE(td.rto_duedate) <= $3 AND td.rto_adm_id = $4
         ORDER BY td.rto_id`;

    const vhnParams = isAdmin ? [branchId, todayStr, threeDaysLaterStr] : [branchId, todayStr, threeDaysLaterStr, adminId];
    const vhnRes = await db.query(vhnQuery, vhnParams);
    vahanWork = vhnRes.rows;

  } catch (err: any) {
    console.error('Failed to execute RTO dashboard queries:', err.message);
  }

  const formatDate = (dateVal: string) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const getStatusTextAndStyle = (action: string, penResName?: string) => {
    if (action === '2') {
      return { text: 'Completed', style: { color: 'green', fontWeight: 'bold' } };
    } else if (action === '3') {
      return { text: 'Document Delivered', style: { color: 'green', fontWeight: 'bold' } };
    } else {
      return { text: `Pending - ${penResName || ''}`, style: { color: 'red', fontWeight: 'bold' } };
    }
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-home"></i> RTO Dashboard</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="#">Home</a></li>
            <li className="active">RTO Dashboard</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="panel panel-default">
          <div className="panel-body">
            {/* Upcoming 3 Days - License Work */}
            <div className="table-responsive col-md-12 col-lg-12 col-sm-12 col-xs-12">
              <h3 className="text-center" style={{ fontWeight: 'bold', color: '#DA261C', margin: '20px 0' }}>
                Upcoming 3 Days - License Work
              </h3>
              <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                  <tr>
                    <th style={{ width: '5%' }}>ID</th>
                    <th style={{ width: '10%' }}>Date</th>
                    <th style={{ width: '10%' }}>Due Date</th>
                    <th style={{ width: '15%' }}>Name</th>
                    <th style={{ width: '10%' }}>Contact</th>
                    <th style={{ width: '15%' }}>Amount</th>
                    <th style={{ width: '10%' }}>Assign</th>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '10%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {licenseWork.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center">No upcoming license work found.</td>
                    </tr>
                  ) : (
                    licenseWork.map((row) => {
                      const status = getStatusTextAndStyle(row.rto_action, row.pen_res_name);
                      return (
                        <tr key={row.rto_id} className="odd gradeX">
                          <td>{row.rto_id}</td>
                          <td>{formatDate(row.rto_date)}</td>
                          <td>{formatDate(row.rto_duedate)}</td>
                          <td>
                            <a title="Edit" style={{ color: 'green', fontWeight: 'semibold' }} href={`#edit-license?id=${row.rto_id}`}>
                              {row.rto_name}
                            </a>
                          </td>
                          <td>{row.rto_contact}</td>
                          <td>{row.rto_amount} - {row.rto_credit} = {row.rto_debit}</td>
                          <td>{row.adm_username || ''}</td>
                          <td style={status.style}>{status.text}</td>
                          <td>
                            <code>
                              <a style={{ color: '#333' }} title="Documents" href={`#license-documents?id=${row.rto_id}`}>
                                <i className="fa fa-image"></i>
                              </a>
                              {' | '}
                              <a style={{ color: 'green' }} title="Edit" href={`#edit-license?id=${row.rto_id}`}>
                                <i className="fa fa-pencil"></i>
                              </a>
                            </code>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Upcoming 3 Days - Vahan Work */}
            <div className="table-responsive col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginTop: '30px' }}>
              <h3 className="text-center" style={{ fontWeight: 'bold', color: '#DA261C', margin: '20px 0' }}>
                Upcoming 3 Days - Vahan Work
              </h3>
              <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                  <tr>
                    <th style={{ width: '5%' }}>ID</th>
                    <th style={{ width: '10%' }}>Date</th>
                    <th style={{ width: '10%' }}>Due Date</th>
                    <th style={{ width: '10%' }}>Register No.</th>
                    <th style={{ width: '15%' }}>Name</th>
                    <th style={{ width: '10%' }}>Contact</th>
                    <th style={{ width: '15%' }}>Amount</th>
                    <th style={{ width: '10%' }}>Assign</th>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '10%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vahanWork.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center">No upcoming vahan work found.</td>
                    </tr>
                  ) : (
                    vahanWork.map((row) => {
                      const status = getStatusTextAndStyle(row.rto_action, row.pen_res_name);
                      return (
                        <tr key={row.rto_id} className="odd gradeX">
                          <td>{row.rto_id}</td>
                          <td>{formatDate(row.rto_date)}</td>
                          <td>{formatDate(row.rto_duedate)}</td>
                          <td>{row.rto_regno}</td>
                          <td>
                            <a title="Edit" style={{ color: 'green', fontWeight: 'semibold' }} href={`#edit-vahan?id=${row.rto_id}`}>
                              {row.rto_name}
                            </a>
                          </td>
                          <td>{row.rto_contact}</td>
                          <td>{row.rto_amount} - {row.rto_credit} = {row.rto_debit}</td>
                          <td>{row.adm_username || ''}</td>
                          <td style={status.style}>{status.text}</td>
                          <td>
                            <code>
                              <a style={{ color: '#333' }} title="Documents" href={`#vahan-documents?id=${row.rto_id}`}>
                                <i className="fa fa-image"></i>
                              </a>
                              {' | '}
                              <a style={{ color: 'green' }} title="Edit" href={`#edit-vahan?id=${row.rto_id}`}>
                                <i className="fa fa-pencil"></i>
                              </a>
                            </code>
                          </td>
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
