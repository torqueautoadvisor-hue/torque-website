'use client';

import Link from 'next/link';

export default function ServicesPage() {
  const serviceList = [
    {
      title: 'Vehicle Insurance Solutions',
      icon: 'fa-shield',
      desc: 'Get customized policy quotes for your two-wheelers, private cars, or commercial fleet. We handle third-party insurance, comprehensive insurance, and claims filing support.'
    },
    {
      title: 'Driving License Files',
      icon: 'fa-id-card-o',
      desc: 'Expert coordination for heavy vehicle licenses, passenger transport licenses, light motor vehicle (LMV) files, RTO test bookings, and duplicate renewals.'
    },
    {
      title: 'Ownership Name Transfer',
      icon: 'fa-exchange',
      desc: 'Smooth buy/sell RTO registrations, name transfers, bank hypothecation cancellations, smart card updates, and state NOC transfers.'
    },
    {
      title: 'RTO Fitness &amp; Permits',
      icon: 'fa-certificate',
      desc: 'Assisting in commercial fitness tests, permit renewals (All India/State permits), speed governor certificates, and reflective tape approvals.'
    },
    {
      title: 'P.U.C. &amp; CNG Re-Testing',
      icon: 'fa-leaf',
      desc: 'Get your vehicles green-compliant with authorized Pollution Under Control alerts and CNG cylinder compliance testing reports.'
    },
    {
      title: 'HP Loan Cancellations',
      icon: 'fa-times-circle',
      desc: 'Complete all hypothecation closure file processes at RTO after settling bank loans, ensuring direct clear vehicle title rights.'
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <section style={{ backgroundColor: '#1d2939', padding: '60px 0', color: '#fff', position: 'relative' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '42px', fontWeight: '800', margin: 0 }}>Our Consultancy Services</h1>
          <p style={{ color: '#82c21f', fontSize: '16px', fontWeight: '600', marginTop: '10px' }}>
            Professional RTO, Licensing, &amp; Vehicle Insurance Services
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="row text-center" style={{ marginBottom: '50px' }}>
            <div className="col-sm-12">
              <div className="section-tag" style={{ margin: '0 auto 20px' }}>
                <i className="fa fa-cogs"></i> What We Do
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#1d2939' }}>Comprehensive Vehicle Operations</h2>
              <p style={{ maxWidth: '650px', margin: '15px auto 0', color: '#666', lineHeight: '1.6' }}>
                We guide you through complex transport department files and insurance rules, saving you time and preventing documentation issues.
              </p>
            </div>
          </div>

          <div className="row">
            {serviceList.map((service, idx) => (
              <div key={idx} className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
                <div className="service-card">
                  <div className="service-icon-box">
                    <i className={`fa ${service.icon}`}></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1d2939', marginBottom: '15px' }} dangerouslySetInnerHTML={{ __html: service.title }}></h3>
                  <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: service.desc }}></p>
                </div>
              </div>
            ))}
          </div>

          <div className="row text-center" style={{ marginTop: '40px' }}>
            <div className="col-sm-12" style={{ background: '#f8f9fa', padding: '40px', borderRadius: '8px', border: '1px solid #eee' }}>
              <h3 style={{ fontWeight: '700', color: '#1d2939', marginBottom: '15px' }}>Need a Custom Fleet Consultancy Solution?</h3>
              <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto 25px' }}>
                If you run a transport business or commercial agency in Morbi with multiple trucks, loaders, or buses, reach out for custom compliance agreements.
              </p>
              <Link href="/contact" className="get-quote-btn" style={{ textDecoration: 'none' }}>
                Talk to Our Expert <i className="fa fa-phone"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
