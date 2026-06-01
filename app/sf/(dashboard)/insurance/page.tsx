import { cookies } from 'next/headers';
import { db } from '../../../../lib/db';

export default async function InsuranceDashboard() {
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

  // Helper variables for queries
  let renewalFollowups: any[] = [];
  let takenFollowups: any[] = [];
  let globalFollowups: any[] = [];
  let pendingClaims: any[] = [];
  let todaysUghrani: any[] = [];

  try {
    // 1. Fetch upcoming 3 Days Follow-up - Renewal
    const renQuery = isAdmin
      ? `SELECT td.*, al.adm_username, fd.ren_code_no, fd.ren_name, fd.ren_contact 
         FROM ren_flp_detail td
         JOIN renewal_detail fd ON td.ren_id = fd.ren_id
         JOIN admin_login al ON al.adm_id = fd.ren_adm_id
         WHERE td.branch_id = $1 AND DATE(td.renflp_reminder_date) >= $2 AND DATE(td.renflp_reminder_date) <= $3
         ORDER BY td.renflp_id DESC`
      : `SELECT td.*, al.adm_username, fd.ren_code_no, fd.ren_name, fd.ren_contact 
         FROM ren_flp_detail td
         JOIN renewal_detail fd ON td.ren_id = fd.ren_id
         JOIN admin_login al ON al.adm_id = fd.ren_adm_id
         WHERE td.branch_id = $1 AND fd.ren_adm_id = $4 AND DATE(td.renflp_reminder_date) >= $2 AND DATE(td.renflp_reminder_date) <= $3
         ORDER BY td.renflp_id DESC`;
    
    const renParams = isAdmin ? [branchId, todayStr, threeDaysLaterStr] : [branchId, todayStr, threeDaysLaterStr, adminId];
    const renRes = await db.query(renQuery, renParams);
    renewalFollowups = renRes.rows;

    // 2. Fetch upcoming 3 Days Follow-up - Taken
    const tknQuery = isAdmin
      ? `SELECT td.*, al.adm_username, fd.tkn_code_no, fd.tkn_name, fd.tkn_contact 
         FROM tkn_flp_detail td
         JOIN taken_detail fd ON td.tkn_id = fd.tkn_id
         JOIN admin_login al ON al.adm_id = fd.tkn_adm_id
         WHERE td.branch_id = $1 AND DATE(td.tknflp_reminder_date) >= $2 AND DATE(td.tknflp_reminder_date) <= $3
         ORDER BY td.tknflp_id DESC`
      : `SELECT td.*, al.adm_username, fd.tkn_code_no, fd.tkn_name, fd.tkn_contact 
         FROM tkn_flp_detail td
         JOIN taken_detail fd ON td.tkn_id = fd.tkn_id
         JOIN admin_login al ON al.adm_id = fd.tkn_adm_id
         WHERE td.branch_id = $1 AND fd.tkn_adm_id = $4 AND DATE(td.tknflp_reminder_date) >= $2 AND DATE(td.tknflp_reminder_date) <= $3
         ORDER BY td.tknflp_id DESC`;
    
    const tknParams = isAdmin ? [branchId, todayStr, threeDaysLaterStr] : [branchId, todayStr, threeDaysLaterStr, adminId];
    const tknRes = await db.query(tknQuery, tknParams);
    takenFollowups = tknRes.rows;

    // 3. Fetch upcoming 3 Days Follow-up - Global
    const glbQuery = isAdmin
      ? `SELECT td.*, al.adm_username, fd.glb_code_no, fd.glb_name, fd.glb_contact 
         FROM glb_flp_detail td
         JOIN global_detail fd ON td.glb_id = fd.glb_id
         JOIN admin_login al ON al.adm_id = fd.glb_adm_id
         WHERE td.branch_id = $1 AND DATE(td.glbflp_reminder_date) >= $2 AND DATE(td.glbflp_reminder_date) <= $3
         ORDER BY td.glbflp_id DESC`
      : `SELECT td.*, al.adm_username, fd.glb_code_no, fd.glb_name, fd.glb_contact 
         FROM glb_flp_detail td
         JOIN global_detail fd ON td.glb_id = fd.glb_id
         JOIN admin_login al ON al.adm_id = fd.glb_adm_id
         WHERE td.branch_id = $1 AND fd.glb_adm_id = $4 AND DATE(td.glbflp_reminder_date) >= $2 AND DATE(td.glbflp_reminder_date) <= $3
         ORDER BY td.glbflp_id DESC`;
    
    const glbParams = isAdmin ? [branchId, todayStr, threeDaysLaterStr] : [branchId, todayStr, threeDaysLaterStr, adminId];
    const glbRes = await db.query(glbQuery, glbParams);
    globalFollowups = glbRes.rows;

    // 4. Fetch Pending Claim
    const clmQuery = isAdmin
      ? `SELECT td.*, st.status_name, al.adm_username
         FROM claim_detail td
         JOIN status_detail st ON st.status_id = td.clm_status
         LEFT JOIN admin_login al ON al.adm_id = td.clm_adm_id
         WHERE td.clm_status != 3 AND td.clm_action = '1' AND td.branch_id = $1
         ORDER BY td.clm_id`
      : `SELECT td.*, st.status_name, al.adm_username
         FROM claim_detail td
         JOIN status_detail st ON st.status_id = td.clm_status
         LEFT JOIN admin_login al ON al.adm_id = td.clm_adm_id
         WHERE td.clm_status != 3 AND td.clm_action = '1' AND td.branch_id = $1 AND td.clm_adm_id = $2
         ORDER BY td.clm_id`;
    
    const clmParams = isAdmin ? [branchId] : [branchId, adminId];
    const clmRes = await db.query(clmQuery, clmParams);
    pendingClaims = clmRes.rows;

    // 5. Fetch Today's - Ughrani (Collections)
    const ughQuery = `SELECT * FROM ughrani_detail 
                      WHERE ugh_status = 1 AND branch_id = $1 AND ugh_action = 1 AND DATE(ugh_due_date) = $2 
                      ORDER BY ugh_id`;
    const ughRes = await db.query(ughQuery, [branchId, todayStr]);
    todaysUghrani = ughRes.rows;

  } catch (err: any) {
    console.error('Failed to execute dashboard queries:', err.message);
  }

  const formatDate = (dateVal: string) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-home"></i> Torque Auto Advisor Dashboard</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="#">Home</a></li>
            <li className="active">Torque Auto Advisor Dashboard</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        {/* Upcoming 3 Days Follow-up - Renewal */}
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="table-responsive col-md-12 col-lg-12 col-sm-12 col-xs-12">
              <h3 className="text-center" style={{ fontWeight: 'bold', color: '#DA261C', margin: '20px 0' }}>
                Upcoming 3 Days Follow-up - Renewal
              </h3>
              <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                  <tr>
                    <th style={{ width: '25%' }}>Renewal</th>
                    <th style={{ width: '50%' }}>Notes</th>
                    <th style={{ width: '10%' }}>Contact</th>
                    <th style={{ width: '15%' }}>Assign</th>
                  </tr>
                </thead>
                <tbody>
                  {renewalFollowups.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">No upcoming renewal followups found.</td>
                    </tr>
                  ) : (
                    renewalFollowups.map((row) => (
                      <tr key={row.renflp_id} className="odd gradeX">
                        <td>{row.ren_code_no} - {row.ren_name}</td>
                        <td>{row.renflp_notes}</td>
                        <td>{row.ren_contact}</td>
                        <td>{row.adm_username}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Taken & Global Row */}
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-md-6 col-lg-6 col-sm-12">
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="table-responsive">
                  <h3 className="text-center" style={{ fontWeight: 'bold', color: '#DA261C', marginBottom: '15px' }}>
                    Upcoming 3 Days Follow-up - Taken
                  </h3>
                  <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                    <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                      <tr>
                        <th style={{ width: '25%' }}>Taken</th>
                        <th style={{ width: '55%' }}>Notes</th>
                        <th style={{ width: '20%' }}>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {takenFollowups.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center">No followups.</td>
                        </tr>
                      ) : (
                        takenFollowups.map((row) => (
                          <tr key={row.tknflp_id}>
                            <td>{row.tkn_code_no} - {row.tkn_name}</td>
                            <td>{row.tknflp_notes}</td>
                            <td>{row.tkn_contact}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-6 col-sm-12">
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="table-responsive">
                  <h3 className="text-center" style={{ fontWeight: 'bold', color: '#DA261C', marginBottom: '15px' }}>
                    Upcoming 3 Days Follow-up - Global
                  </h3>
                  <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                    <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                      <tr>
                        <th style={{ width: '25%' }}>Global</th>
                        <th style={{ width: '55%' }}>Notes</th>
                        <th style={{ width: '20%' }}>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalFollowups.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center">No followups.</td>
                        </tr>
                      ) : (
                        globalFollowups.map((row) => (
                          <tr key={row.glbflp_id}>
                            <td>{row.glb_code_no} - {row.glb_name}</td>
                            <td>{row.glbflp_notes}</td>
                            <td>{row.glb_contact}</td>
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

        {/* Pending Claims */}
        <div className="panel panel-default" style={{ marginTop: '20px' }}>
          <div className="panel-body">
            <div className="table-responsive col-md-12">
              <h3 className="text-center" style={{ fontWeight: 'bold', color: '#DA261C', margin: '20px 0' }}>
                Pending Claim
              </h3>
              <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Accident Date</th>
                    <th>Claim No</th>
                    <th>Amount</th>
                    <th>Reg No.</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Assign</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClaims.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center">No pending claims.</td>
                    </tr>
                  ) : (
                    pendingClaims.map((row) => (
                      <tr key={row.clm_id}>
                        <td>{row.clm_id}</td>
                        <td>{formatDate(row.clm_date)}</td>
                        <td>{formatDate(row.clm_accident)}</td>
                        <td>{row.clm_no}</td>
                        <td>₹{parseFloat(row.clm_amount || 0).toLocaleString()}</td>
                        <td>{row.clm_regno}</td>
                        <td>{row.clm_name}</td>
                        <td>{row.clm_contact}</td>
                        <td>{row.adm_username}</td>
                        <td style={{ color: 'red', fontWeight: 'bold' }}>Pending</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Today's Ughrani */}
        <div className="panel panel-default" style={{ marginTop: '20px' }}>
          <div className="panel-body">
            <div className="table-responsive col-md-12">
              <h3 className="text-center" style={{ fontWeight: 'bold', color: '#DA261C', margin: '20px 0' }}>
                Today's - Ughrani
              </h3>
              <table className="table table-success mb30 table-hover table-bordered display" style={{ color: '#000' }}>
                <thead style={{ backgroundColor: '#82c21f', color: '#fff' }}>
                  <tr>
                    <th>ID</th>
                    <th>No.</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysUghrani.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center">No collections due today.</td>
                    </tr>
                  ) : (
                    todaysUghrani.map((row) => (
                      <tr key={row.ugh_id}>
                        <td>{row.ugh_id}</td>
                        <td>{row.ugh_code_no}</td>
                        <td>{row.ugh_name}</td>
                        <td>{row.ugh_contact}</td>
                        <td>{formatDate(row.ugh_date)}</td>
                        <td>{formatDate(row.ugh_due_date)}</td>
                        <td>₹{parseFloat(row.ugh_amount || 0).toLocaleString()}</td>
                        <td style={{ color: 'red' }}>Pending</td>
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
