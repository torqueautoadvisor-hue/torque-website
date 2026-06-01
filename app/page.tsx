'use client';

import { useState, useEffect } from 'react';
import { loginAction } from './actions/auth';

export default function LoginPage() {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Bracket template relies on the body class 'signin' to apply custom backgrounds and overrides
  useEffect(() => {
    document.body.className = 'signin';
    return () => {
      document.body.className = '';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAction(contact, password);
      if (res.success) {
        if (res.demoOtp) {
          alert(`[OTP DEVELOPMENT ALERT]\nSub-Admin login initialized.\nYour verification OTP code is: ${res.demoOtp}`);
        }
        window.location.href = res.redirect || '/';
      } else {
        setError(res.error || 'This phone number or password does not exist in our records.');
      }
    } catch (err) {
      setError('Connection to database failed. Please verify network status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="signinpanel">
        <div className="row">
          <div className="col-md-3"> &nbsp; </div>
          
          <div className="col-md-6">
            <div>
              <center>
                <img src="/images/logo.png" width="200px" alt="Logo" />
                <br /><br />
              </center>
            </div>
            
            <form onSubmit={handleSubmit}>
              <h4 className="nomargin" style={{ color: '#1C1B17' }}>Sign In</h4>
              
              {error ? (
                <p className="mt5 mb20" style={{ color: 'red' }}> {error} </p>
              ) : (
                <p className="mt5 mb20"> Sign in to access your account. </p>
              )}
              
              <label className="form-lable">Mobile No.</label>
              <input
                style={{ marginTop: '0px' }}
                type="text"
                name="adm_contact"
                placeholder="ex: 9898656532"
                pattern="\d*"
                minLength={10}
                maxLength={10}
                required
                className="form-control"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={loading}
              />
              <br />
              
              <label className="form-lable">Password</label>
              <input
                style={{ marginTop: '0px' }}
                type="password"
                name="adm_password"
                className="form-control pword"
                required
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              
              <button 
                type="submit" 
                className="btn btn-success btn-block"
                style={{ marginTop: '15px' }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
          </div>
          
          <div className="col-md-3"> &nbsp; </div>
        </div>
        
        <div className="signup-footer">
          <center>
            &copy; {new Date().getFullYear()} <a href="http://kasanamedia.com/" target="_blank" rel="noreferrer">Developed By Kasana Media</a>
          </center>
        </div>
      </div>
    </section>
  );
}
