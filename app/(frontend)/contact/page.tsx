'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Insurance Quote',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this can call an API route or trigger an email
    setSubmitted(true);
    setFormData({ name: '', phone: '', email: '', subject: 'Insurance Quote', message: '' });
  };

  return (
    <div>
      {/* Page Header */}
      <section style={{ backgroundColor: '#1d2939', padding: '60px 0', color: '#fff', position: 'relative' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '42px', fontWeight: '800', margin: 0 }}>Contact Us</h1>
          <p style={{ color: '#82c21f', fontSize: '16px', fontWeight: '600', marginTop: '10px' }}>
            Get in Touch or Request a Custom Service Quote
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="row">
            {/* Contact info cards */}
            <div className="col-md-5 col-sm-12" style={{ marginBottom: '50px' }}>
              <div className="section-tag">
                <i className="fa fa-phone"></i> Reach Us
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1d2939', marginBottom: '35px' }}>
                We Are Here to Assist You!
              </h2>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(130, 194, 31, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#82c21f', fontSize: '20px', flexShrink: 0 }}>
                  <i className="fa fa-map-marker"></i>
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', color: '#1d2939', margin: '0 0 5px' }}>Our Office Location</h4>
                  <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>
                    2nd Floor, Zeel Complex Behind Old Bus Stand, Ayodhyapuri, Main Road, Morbi - 363641
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(130, 194, 31, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#82c21f', fontSize: '20px', flexShrink: 0 }}>
                  <i className="fa fa-phone"></i>
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', color: '#1d2939', margin: '0 0 5px' }}>Call Support</h4>
                  <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>
                    +91 80008 11331<br />
                    +91 97272 64373
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(130, 194, 31, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#82c21f', fontSize: '20px', flexShrink: 0 }}>
                  <i className="fa fa-envelope"></i>
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', color: '#1d2939', margin: '0 0 5px' }}>Email Inquiries</h4>
                  <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>
                    info@torqueautoadvisor.com
                  </p>
                </div>
              </div>
            </div>

            {/* Quote / Message Form */}
            <div className="col-md-7 col-sm-12">
              <div style={{ background: '#ffffff', border: '1px solid #eee', padding: '40px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontWeight: '700', color: '#1d2939', margin: '0 0 10px' }}>Request a Consultation</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
                  Provide your contact details below, and one of our advisors will contact you shortly.
                </p>

                {submitted ? (
                  <div className="alert alert-success text-center" style={{ padding: '30px 20px', margin: 0 }}>
                    <i className="fa fa-check-circle" style={{ fontSize: '40px', color: '#3c763d', marginBottom: '15px' }}></i>
                    <h4>Thank You!</h4>
                    <p style={{ margin: 0 }}>Your request has been received. Our team will contact you within 24 hours.</p>
                    <button onClick={() => setSubmitted(false)} className="btn btn-success" style={{ marginTop: '20px' }}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-sm-6" style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: '600', color: '#1d2939', marginBottom: '8px', display: 'block' }}>Your Name</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="form-control" 
                          placeholder="e.g. Rahul Patel" 
                          style={{ height: '45px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div className="col-sm-6" style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: '600', color: '#1d2939', marginBottom: '8px', display: 'block' }}>Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="form-control" 
                          placeholder="e.g. 98765 43210" 
                          style={{ height: '45px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-6" style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: '600', color: '#1d2939', marginBottom: '8px', display: 'block' }}>Email Address (Optional)</label>
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="form-control" 
                          placeholder="e.g. rahul@gmail.com" 
                          style={{ height: '45px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div className="col-sm-6" style={{ marginBottom: '20px' }}>
                        <label style={{ fontWeight: '600', color: '#1d2939', marginBottom: '8px', display: 'block' }}>Select Subject</label>
                        <select 
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="form-control" 
                          style={{ height: '45px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="Insurance Quote">Insurance Quote</option>
                          <option value="Driving License File">Driving License File</option>
                          <option value="RTO Fitness / Permit">RTO Fitness / Permit</option>
                          <option value="Vehicle Name Transfer">Vehicle Name Transfer</option>
                          <option value="Other Inquiries">Other Inquiries</option>
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-12" style={{ marginBottom: '25px' }}>
                        <label style={{ fontWeight: '600', color: '#1d2939', marginBottom: '8px', display: 'block' }}>Additional Details</label>
                        <textarea 
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="form-control" 
                          placeholder="Describe your requirements or ask a question..." 
                          style={{ border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                        ></textarea>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-12">
                        <button type="submit" className="get-quote-btn" style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '16px' }}>
                          Submit Inquiry Form <i className="fa fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
