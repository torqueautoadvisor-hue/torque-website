'use client';

export default function GalleryPage() {
  const galleryImages = [
    {
      url: '/images/wallpaper.png',
      caption: 'Commercial Fleets and Transit Services'
    },
    {
      url: '/images/torqueautoadvisor.jpeg',
      caption: 'Customer Consultation and Document Verification'
    },
    {
      url: '/images/logo.png',
      caption: 'Torque Auto Advisor Brand'
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <section style={{ backgroundColor: '#1d2939', padding: '60px 0', color: '#fff', position: 'relative' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: '42px', fontWeight: '800', margin: 0 }}>Photo Gallery</h1>
          <p style={{ color: '#82c21f', fontSize: '16px', fontWeight: '600', marginTop: '10px' }}>
            A Glimpse into Our Operations &amp; Client Success
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="row text-center" style={{ marginBottom: '50px' }}>
            <div className="col-sm-12">
              <div className="section-tag" style={{ margin: '0 auto 20px' }}>
                <i className="fa fa-picture-o"></i> Moments
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#1d2939' }}>Client &amp; Fleet Service Gallery</h2>
            </div>
          </div>

          <div className="row">
            {galleryImages.map((image, idx) => (
              <div key={idx} className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <div style={{ height: '220px', background: '#e4e7ea', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={image.url} 
                      alt={image.caption} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s' }}
                      className="gallery-img"
                    />
                  </div>
                  <div style={{ padding: '15px 20px', textAlign: 'center' }}>
                    <h5 style={{ fontWeight: '700', color: '#1d2939', margin: 0, fontSize: '14px' }}>{image.caption}</h5>
                  </div>
                </div>
              </div>
            ))}

            {/* Custom Gallery placeholders for rich visuals */}
            <div className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%' }}>
                <div style={{ height: '220px', background: 'linear-gradient(135deg, #1d2939 0%, #111a24 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '20px' }}>
                  <i className="fa fa-truck" style={{ fontSize: '50px', color: '#82c21f', marginBottom: '15px' }}></i>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: '#82c21f' }}>RTO fitness check</span>
                </div>
                <div style={{ padding: '15px 20px', textAlign: 'center' }}>
                  <h5 style={{ fontWeight: '700', color: '#1d2939', margin: 0, fontSize: '14px' }}>Transport Fitness Testing &amp; Verification</h5>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%' }}>
                <div style={{ height: '220px', background: 'linear-gradient(135deg, #c9302c 0%, #a21c18 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '20px' }}>
                  <i className="fa fa-id-card-o" style={{ fontSize: '50px', color: '#ffffff', marginBottom: '15px' }}></i>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: '#ffffff' }}>License updates</span>
                </div>
                <div style={{ padding: '15px 20px', textAlign: 'center' }}>
                  <h5 style={{ fontWeight: '700', color: '#1d2939', margin: 0, fontSize: '14px' }}>Heavy Motor License Files &amp; Smart Cards</h5>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '100%' }}>
                <div style={{ height: '220px', background: 'linear-gradient(135deg, #82c21f 0%, #689b18 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '20px' }}>
                  <i className="fa fa-check-circle" style={{ fontSize: '50px', color: '#ffffff', marginBottom: '15px' }}></i>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: '#ffffff' }}>policy claim checks</span>
                </div>
                <div style={{ padding: '15px 20px', textAlign: 'center' }}>
                  <h5 style={{ fontWeight: '700', color: '#1d2939', margin: 0, fontSize: '14px' }}>Insurance Policy Claims Verification</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
