'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };

  return (
    <>
      {/* Load Stylesheets */}
      <link rel="stylesheet" href="/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/css/font-awesome.min.css" />
      <link rel="stylesheet" href="/css/frontend.css" />

      {/* 1. TOP BAR */}
      <div className="top-bar hidden-xs">
        <div className="container">
          <div className="row">
            <div className="col-sm-4">
              <div className="top-bar-socials">
                <a href="#"><i className="fa fa-facebook"></i></a>
                <a href="#"><i className="fa fa-twitter"></i></a>
                <a href="#"><i className="fa fa-linkedin"></i></a>
                <a href="#"><i className="fa fa-instagram"></i></a>
              </div>
            </div>
            <div className="col-sm-8">
              <div className="top-bar-contact">
                <span><i className="fa fa-envelope"></i> info@torqueautoadvisor.com</span>
                <span><i className="fa fa-map-marker"></i> Ayodhyapuri Main Road, Morbi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION HEADER */}
      <header className="main-header">
        <nav className="navbar navbar-default" style={{ margin: 0, background: '#fff', border: 'none', borderRadius: 0 }}>
          <div className="container">
            <div className="navbar-header" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
              <Link href="/" className="navbar-brand" style={{ padding: '10px 0', height: 'auto', display: 'flex', alignItems: 'center' }}>
                <img src="/images/logo.png" alt="Torque Auto Advisor Logo" />
              </Link>
              
              <ul className="nav navbar-nav navbar-right hidden-xs" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: 0 }}>
                <li>
                  <Link href="/" className={`nav-link-custom ${isActive('/')}`}>Home</Link>
                </li>
                <li>
                  <Link href="/about" className={`nav-link-custom ${isActive('/about')}`}>About Us</Link>
                </li>
                <li>
                  <Link href="/services" className={`nav-link-custom ${isActive('/services')}`}>Our Services</Link>
                </li>
                <li>
                  <Link href="/gallery" className={`nav-link-custom ${isActive('/gallery')}`}>Photo Gallery</Link>
                </li>
                <li>
                  <Link href="/contact" className={`nav-link-custom ${isActive('/contact')}`}>Contact Us</Link>
                </li>
                <li style={{ paddingLeft: '15px' }}>
                  <Link href="/contact" className="get-quote-btn">
                    Get a Quote <i className="fa fa-arrow-right"></i>
                  </Link>
                </li>
              </ul>

              {/* Mobile View CRM Link Trigger */}
              <div className="visible-xs" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <Link href="/sf" style={{ fontSize: '13px', fontWeight: 'bold', color: '#d14c3b', textDecoration: 'underline' }}>
                  CRM Log In
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* 3. CORE PAGE CONTENT */}
      <main style={{ minHeight: '60vh' }}>
        {children}
      </main>

      {/* 4. PUBLIC FOOTER */}
      <footer className="public-footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h4>Torque Auto Advisor</h4>
              <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
                Your trusted partner in comprehensive vehicle services. We understand the intricacies of vehicle management and insurance, and we are dedicated to providing a seamless experience.
              </p>
              <div className="top-bar-socials" style={{ gap: '15px' }}>
                <a href="#" style={{ fontSize: '18px' }}><i className="fa fa-facebook"></i></a>
                <a href="#" style={{ fontSize: '18px' }}><i className="fa fa-twitter"></i></a>
                <a href="#" style={{ fontSize: '18px' }}><i className="fa fa-linkedin"></i></a>
                <a href="#" style={{ fontSize: '18px' }}><i className="fa fa-instagram"></i></a>
              </div>
            </div>
            <div className="col-md-4">
              <h4>Quick Links</h4>
              <ul className="footer-links-list">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/services">Our Services</Link></li>
                <li><Link href="/gallery">Photo Gallery</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/sf" style={{ color: '#82c21f', fontWeight: 'bold' }}>Employee CRM Login</Link></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h4>Contact Details</h4>
              <ul className="footer-contact-list">
                <li>
                  <i className="fa fa-map-marker"></i>
                  <span>2nd Floor, Zeel Complex Behind Old Bus Stand, Ayodhyapuri, Main Road, Morbi - 363641</span>
                </li>
                <li>
                  <i className="fa fa-phone"></i>
                  <span>+91 80008 11331 / +91 97272 64373</span>
                </li>
                <li>
                  <i className="fa fa-envelope"></i>
                  <span>info@torqueautoadvisor.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="row footer-bottom">
            <div className="col-sm-6 text-left">
              &copy; {new Date().getFullYear()} Torque Auto Advisor. All Rights Reserved.
            </div>
            <div className="col-sm-6 text-right">
              Morbi, Gujarat, India
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
