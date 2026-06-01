'use client';

import { useState, useEffect } from 'react';
import { verifyOtpAction } from '../../actions/auth';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const res = await verifyOtpAction(otp);
      if (res.success) {
        window.location.href = res.redirect || '/';
      } else {
        setError(res.error || 'Verification Code Incorrect.');
      }
    } catch (err) {
      setError('Database verification failed. Please try again.');
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
                <h4 style={{ color: '#1C1B17', fontWeight: 'bold' }}>Torque Auto Advisor</h4>
                <br />
              </center>
            </div>
            
            <form onSubmit={handleSubmit}>
              <h4 className="nomargin" style={{ color: '#1C1B17' }}>Verification</h4>
              
              {error ? (
                <p className="mt5 mb20" style={{ color: 'red' }}> {error} </p>
              ) : (
                <p className="mt5 mb20"> Please verify your account. </p>
              )}
              
              <label className="form-lable">OTP</label>
              <input
                style={{ marginTop: '0px' }}
                type="text"
                name="adm_verification"
                placeholder="ex: 105555"
                pattern="\d*"
                minLength={6}
                maxLength={6}
                required
                className="form-control"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              
              <button 
                type="submit" 
                className="btn btn-success btn-block"
                style={{ marginTop: '15px' }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
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
