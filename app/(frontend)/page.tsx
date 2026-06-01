'use client';

import Link from 'next/link';

export default function HomePage() {
  const marqueeItems = [
    'Driving License',
    'Parsing',
    'Fitness',
    'Permit',
    'CNG Cylinder',
    'Insurance Check',
    'Name Transfer'
  ];

  // Repeat items to ensure smooth continuous marquee loop
  const repeatedMarquee = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section 
        className="hero-section" 
        style={{ backgroundImage: `url('/images/wallpaper.png')` }}
      >
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-md-8 col-sm-12">
              <div className="hero-content">
                <h1 className="hero-title">
                  Protect and Finance <span>Your Vehicle</span>
                </h1>
                <p className="hero-desc">
                  Providing expert assistance for driving licenses, vehicle fitness certificates, permit files, P.U.C. testing, and comprehensive vehicle insurance. Get absolute peace of mind with our reliable, fast advisor services.
                </p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <Link href="/contact" className="get-quote-btn" style={{ textDecoration: 'none' }}>
                    Get a Free Quote <i className="fa fa-phone"></i>
                  </Link>
                  <Link href="/services" className="btn btn-default" style={{ padding: '10px 24px', fontWeight: 600, border: '2px solid #fff', background: 'transparent', color: '#fff', transition: 'all 0.3s' }}>
                    Explore Services <i className="fa fa-info-circle"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MARQUEE TICKER */}
      <div className="marquee-container">
        <div className="marquee-content">
          {repeatedMarquee.map((item, idx) => (
            <span key={idx}>
              {item} <span className="marquee-divider">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. ABOUT COMPANY */}
      <section className="about-section">
        <div className="container">
          <div className="row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="col-md-6 col-sm-12" style={{ marginBottom: '40px' }}>
              <div className="about-image-wrapper">
                <img 
                  src="/images/torqueautoadvisor.jpeg" 
                  alt="Torque Auto Advisor Team" 
                  className="about-image-main"
                />
                <div className="experience-badge">
                  <h3>5+ Years</h3>
                  <p>Of Trusted Service</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-12">
              <div className="section-tag">
                <i className="fa fa-car"></i> About Company
              </div>
              <h2 className="section-title">Welcome to Torque Auto Advisor</h2>
              <p style={{ color: '#666', lineHeight: '1.7', marginBottom: '30px', fontSize: '15px' }}>
                Your premier partner in comprehensive RTO and insurance consultancy services. Based in Morbi, Gujarat, we assist vehicle owners, fleets, and commercial operators navigate all licensing, compliance, and insurance policies hassle-free.
              </p>

              <div className="about-item">
                <h4>Driving License Assistance</h4>
                <p>Whether you need a 2-wheeler, 4-wheeler, or heavy commercial vehicle license, or require key modifications, address updates, and renewals, our team makes the process seamless.</p>
              </div>

              <div className="about-item">
                <h4>Vehicle Fitness &amp; Compliance</h4>
                <p>From obtaining fitness certificates to managing P.U.C. checks and CNG cylinder re-testing records, we ensure your vehicles meet all standard state regulatory codes.</p>
              </div>

              <div className="about-item">
                <h4>Insurance &amp; Financial Solutions</h4>
                <p>Protect your assets with third-party and comprehensive insurance plans. We handle policy verification, claims support, and HP loan cancellation paperwork smoothly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATISTICS COUNTER */}
      <section className="counter-section">
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-xs-6" style={{ marginBottom: '20px' }}>
              <div className="counter-box">
                <div className="counter-num">15+</div>
                <div className="counter-title">Our Services</div>
              </div>
            </div>
            <div className="col-md-3 col-xs-6" style={{ marginBottom: '20px' }}>
              <div className="counter-box">
                <div className="counter-num">7000+</div>
                <div className="counter-title">Satisfied Customers</div>
              </div>
            </div>
            <div className="col-md-3 col-xs-6" style={{ marginBottom: '20px' }}>
              <div className="counter-box">
                <div className="counter-num">5+ Years</div>
                <div className="counter-title">Industry Experience</div>
              </div>
            </div>
            <div className="col-md-3 col-xs-6" style={{ marginBottom: '20px' }}>
              <div className="counter-box">
                <div className="counter-num">30+</div>
                <div className="counter-title">Team Members</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SERVICES CARDS SECTION */}
      <section className="services-section">
        <div className="container">
          <div className="row text-center" style={{ marginBottom: '50px' }}>
            <div className="col-sm-12">
              <div className="section-tag" style={{ margin: '0 auto 20px' }}>
                <i className="fa fa-cogs"></i> Our All Services
              </div>
              <h2 className="section-title">We Guide to Insurance &amp; Compliance</h2>
              <p style={{ maxWidth: '600px', margin: '0 auto', color: '#666' }}>
                Explore our full suite of RTO, compliance, and policy services tailored to keep your private or commercial vehicle compliant and secure on the road.
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
              <div className="service-card">
                <div className="service-icon-box">
                  <i className="fa fa-file-text-o"></i>
                </div>
                <h3>Vehicle Permit Files</h3>
                <p>Assisting with National Permits, Local Tourist Permits, and Commercial State Authorizations for hassle-free freight and passenger transit across borders.</p>
              </div>
            </div>

            <div className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
              <div className="service-card">
                <div className="service-icon-box">
                  <i className="fa fa-leaf"></i>
                </div>
                <h3>P.U.C. Verification</h3>
                <p>Providing guidance for quick Pollution Under Control certification, environmental standard compliance tests, and renewal alerts to avoid penal fines.</p>
              </div>
            </div>

            <div className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
              <div className="service-card">
                <div className="service-icon-box">
                  <i className="fa fa-exchange"></i>
                </div>
                <h3>Ownership Transfer</h3>
                <p>Handling smooth vehicle name transfer operations, RTO registry records updates, hypothecation additions or cancellations, and noc transfers.</p>
              </div>
            </div>
          </div>

          <div className="row text-center" style={{ marginTop: '20px' }}>
            <div className="col-sm-12">
              <Link href="/services" className="get-quote-btn" style={{ textDecoration: 'none' }}>
                View All Services <i className="fa fa-th-list"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
