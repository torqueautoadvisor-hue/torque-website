'use client';

export default function AboutPage() {
  return (
    <div>
      {/* Page Header */}
      <section style={{ backgroundColor: '#1d2939', padding: '60px 0', color: '#fff', position: 'relative' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '42px', fontWeight: '800', margin: 0 }}>About Our Company</h1>
          <p style={{ color: '#82c21f', fontSize: '16px', fontWeight: '600', marginTop: '10px' }}>
            Torque Auto Advisor - Morbi's Premier Vehicle Consultancy
          </p>
        </div>
      </section>

      {/* About Description */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="col-md-6 col-sm-12" style={{ marginBottom: '30px' }}>
              <div className="section-tag">
                <i className="fa fa-info-circle"></i> Who We Are
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#1d2939', marginBottom: '20px' }}>
                Simplifying Vehicle Compliance &amp; Policy Operations
              </h2>
              <p style={{ color: '#666', lineHeight: '1.7', fontSize: '15px', marginBottom: '20px' }}>
                At Torque Auto Advisor, we recognize that managing vehicle registration, driving licenses, and commercial permits can be confusing and time-consuming. That is why we provide a single point of contact to handle all of your vehicle compliance needs under one roof.
              </p>
              <p style={{ color: '#666', lineHeight: '1.7', fontSize: '15px' }}>
                With over five years of active operations in Morbi and surrounding districts of Gujarat, we have successfully processed thousands of client records, keeping commercial fleets and personal vehicles fully legal, safe, and insured.
              </p>
            </div>
            <div className="col-md-6 col-sm-12">
              <img 
                src="/images/torqueautoadvisor.jpeg" 
                alt="Torque Office" 
                style={{ width: '100%', borderRadius: '8px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '80px 0' }}>
        <div className="container">
          <div className="row text-center" style={{ marginBottom: '50px' }}>
            <div className="col-sm-12">
              <div className="section-tag" style={{ margin: '0 auto 20px' }}>
                <i className="fa fa-heart"></i> Core Pillars
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#1d2939' }}>Why Choose Torque Auto Advisor?</h2>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
              <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #eee', height: '100%' }}>
                <div style={{ fontSize: '32px', color: '#82c21f', marginBottom: '15px' }}>
                  <i className="fa fa-shield"></i>
                </div>
                <h4 style={{ fontWeight: '700', color: '#1d2939', marginBottom: '10px' }}>Unmatched Reliability</h4>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                  We keep accurate track of deadlines, documents, and regulatory changes, ensuring your paperwork is submitted accurately and on schedule.
                </p>
              </div>
            </div>

            <div className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
              <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #eee', height: '100%' }}>
                <div style={{ fontSize: '32px', color: '#82c21f', marginBottom: '15px' }}>
                  <i className="fa fa-flash"></i>
                </div>
                <h4 style={{ fontWeight: '700', color: '#1d2939', marginBottom: '10px' }}>Fast Process Speed</h4>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                  Our experienced agents know the procedures and requirements, cutting down waiting times and moving files through departments quickly.
                </p>
              </div>
            </div>

            <div className="col-md-4 col-sm-12" style={{ marginBottom: '30px' }}>
              <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #eee', height: '100%' }}>
                <div style={{ fontSize: '32px', color: '#82c21f', marginBottom: '15px' }}>
                  <i className="fa fa-users"></i>
                </div>
                <h4 style={{ fontWeight: '700', color: '#1d2939', marginBottom: '10px' }}>Dedicated Support</h4>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                  Whether you have an accident claim to file, need an emergency P.U.C. test, or require help with license renewals, we support you every step of the way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
