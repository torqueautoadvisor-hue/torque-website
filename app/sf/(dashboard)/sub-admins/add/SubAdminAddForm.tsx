'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSubAdmin } from '../../../../actions/admin';

export default function SubAdminAddForm({
  categories,
  modules,
  statuses,
}: {
  categories: any[];
  modules: any[];
  statuses: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [statusId, setStatusId] = useState('1'); // Default to Active (1)
  const [selectedModules, setSelectedModules] = useState<number[]>([]);

  const handleCheckboxChange = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedModules((prev) => [...prev, id]);
    } else {
      setSelectedModules((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      adm_username: username,
      adm_contact: contact,
      adm_password: password,
      adm_cat_id: categoryId,
      adm_status: statusId,
      md_ids: selectedModules,
    };

    try {
      const res = await createSubAdmin(payload);
      if (res.success) {
        router.refresh();
        if (res.redirect) router.push(res.redirect);
      } else {
        setError(res.error || 'Failed to create sub-admin.');
      }
    } catch {
      setError('Database transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="pageheader">
        <h2><i className="fa fa-plus"></i> Sub Admin</h2>
        <div className="breadcrumb-wrapper">
          <span className="label">You are here:</span>
          <ol className="breadcrumb">
            <li><a style={{ color: '#1C1B17' }} href="/sf/insurance">Dashboard</a></li>
            <li><a style={{ color: '#1C1B17' }} href="/sf/sub-admins">Sub Admins</a></li>
            <li className="active">Add Sub Admin</li>
          </ol>
        </div>
      </div>

      <div className="contentpanel">
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={handleSubmit}>
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 className="panel-title">Add Sub Admin Details</h4>
                  {error && <p style={{ color: 'red', fontWeight: 'semibold', fontSize: '14px' }}>{error}</p>}
                  <p>Please enter admin details and select modular permissions below.</p>
                </div>

                <div className="panel-body">
                  {/* Category Dropdown */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Category <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.adm_cat_id} value={cat.adm_cat_id}>
                            {cat.adm_cat_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Name <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ex: Rakesh Kumar"
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
                        pattern="\d*"
                        minLength={10}
                        maxLength={10}
                        className="form-control"
                        required
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="ex: 9898569898"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Password <span className="asterisk">*</span></label>
                    <div className="col-sm-4">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        minLength={6}
                        className="form-control"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="ex: test@123"
                        disabled={loading}
                      />
                    </div>
                    <div className="col-sm-5" style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', margin: '0' }}>
                        <input
                          type="checkbox"
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                          disabled={loading}
                        />
                        Show Password
                      </label>
                    </div>
                  </div>

                  {/* Module Rights Checkboxes */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Module Rights</label>
                    <div className="col-sm-9">
                      <div className="row">
                        {modules.map((ri) => (
                          <div key={ri.md_id} className="col-sm-3" style={{ margin: '8px 0px' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal' }}>
                              <input
                                type="checkbox"
                                value={ri.md_id}
                                checked={selectedModules.includes(ri.md_id)}
                                onChange={(e) => handleCheckboxChange(ri.md_id, e.target.checked)}
                                disabled={loading}
                              />
                              {ri.md_name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="form-group col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ marginBottom: '15px' }}>
                    <label className="col-sm-3 control-label">Status <span className="asterisk">*</span></label>
                    <div className="col-sm-9">
                      <select
                        required
                        className="form-control"
                        value={statusId}
                        onChange={(e) => setStatusId(e.target.value)}
                        disabled={loading}
                      >
                        {statuses.map((stat) => (
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
                      <button type="button" className="btn btn-default" onClick={() => router.push('/sf/sub-admins')} disabled={loading}>
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
