'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logoutAction } from '../actions/auth';

export default function DashboardClientLayout({
  children,
  username,
  permissions,
  isAdmin,
}: {
  children: React.ReactNode;
  username: string;
  permissions: string[];
  isAdmin: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Synchronize mobile and desktop body classes on resize and mount
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 1024;
      if (isMobile) {
        document.body.classList.remove('leftpanel-collapsed');
      } else {
        document.body.classList.remove('leftpanel-show');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('leftpanel-show', 'leftpanel-collapsed');
    };
  }, []);

  // Close mobile sidebar menu when changing pages
  useEffect(() => {
    document.body.classList.remove('leftpanel-show');
  }, [pathname]);

  const toggleSidebar = () => {
    const isMobile = window.innerWidth <= 1024;

    if (isMobile) {
      if (document.body.classList.contains('leftpanel-show')) {
        document.body.classList.remove('leftpanel-show');
      } else {
        document.body.classList.add('leftpanel-show');
      }
    } else {
      const isCollapsed = !collapsed;
      setCollapsed(isCollapsed);
      if (isCollapsed) {
        document.body.classList.add('leftpanel-collapsed');
      } else {
        document.body.classList.remove('leftpanel-collapsed');
      }
    }
  };

  const handleLogout = async () => {
    const res = await logoutAction();
    window.location.href = res.redirect || '/';
  };

  const hasAccess = (moduleId: string) => {
    return isAdmin || permissions.includes(moduleId);
  };

  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      {/* Sidebar (replacing left-column.php) */}
      <div className="leftpanel" style={{ minHeight: '100vh' }}>
        <div className="logopanel" style={{ height: '50px', background: '#fff', padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <a href="#" style={{ display: 'block' }}>
            <img 
              src="/images/logo.png" 
              style={{ 
                maxHeight: '40px', 
                width: 'auto', 
                display: 'block', 
                margin: '0 auto' 
              }} 
              alt="Logo" 
            />
          </a>
        </div>
        
        <div className="leftpanelinner">
          <ul className="nav nav-pills nav-stacked nav-bracket">
            {/* 1. TORQUE AUTO ADVISOR SECTION */}
            <h5 className="sidebartitle">Torque Auto Advisor</h5>
            
            <li className={pathname === '/insurance' ? 'active' : ''}>
              <a href="/insurance">
                <i className="fa fa-home"></i> <span>Dashboard</span>
              </a>
            </li>

            {/* Inquiry Module (id: 3) */}
            {hasAccess('3') && (
              <li className={pathname.startsWith('/inquiry') ? 'active' : ''}>
                <a href="/inquiries">
                  <i className="fa fa-file"></i> <span>Inquiry</span>
                </a>
              </li>
            )}

            {/* Global/General Insurance Module (id: 3) */}
            {hasAccess('3') && (
              <li className={pathname.startsWith('/global') ? 'active' : ''}>
                <a href="/global">
                  <i className="fa fa-file"></i> <span>Global Data</span>
                </a>
              </li>
            )}

            {/* Taken Logs Module (id: 3) */}
            {hasAccess('3') && (
              <li className={pathname.startsWith('/taken') ? 'active' : ''}>
                <a href="/taken">
                  <i className="fa fa-file"></i> <span>Taken Data</span>
                </a>
              </li>
            )}

            {/* Renewal Module (id: 3) */}
            {hasAccess('3') && (
              <li className={(pathname.startsWith('/renewal') && !pathname.startsWith('/renewal/reminders')) ? 'active' : ''}>
                <a href="/renewal">
                  <i className="fa fa-file"></i> <span>Renewal Data</span>
                </a>
              </li>
            )}

            {/* Renewal Reminders (id: 3) */}
            {hasAccess('3') && (
              <li className={pathname === '/renewal/reminders' ? 'active' : ''}>
                <a href="/renewal/reminders">
                  <i className="fa fa-bell"></i> <span>Renewal Reminders</span>
                </a>
              </li>
            )}

            {/* Claims Module (id: 8) */}
            {hasAccess('8') && (
              <li className={pathname.startsWith('/claims') ? 'active' : ''}>
                <a href="/claims">
                  <i className="fa fa-file"></i> <span>Claim</span>
                </a>
              </li>
            )}

            {/* Policy PDF Module (id: 11) */}
            {hasAccess('11') && (
              <li className={pathname.startsWith('/policies') ? 'active' : ''}>
                <a href="#policies">
                  <i className="fa fa-file"></i> <span>Policy PDF</span>
                </a>
              </li>
            )}

            {/* Policy Check Form Module (id: 11) */}
            {hasAccess('11') && (
              <li className={pathname.startsWith('/insurance-guide') ? 'active' : ''}>
                <a href="#guide">
                  <i className="fa fa-file"></i> <span>Policy Check Form</span>
                </a>
              </li>
            )}

            {/* Rate Calculator 1 (id: 17) */}
            {hasAccess('17') && (
              <li className={pathname === '/calculators/one' ? 'active' : ''}>
                <a href="/calculators/one">
                  <i className="fa fa-calculator"></i> <span>Rate Calculator - 1</span>
                </a>
              </li>
            )}

            {/* Rate Calculator 2 (id: 18) */}
            {hasAccess('18') && (
              <li className={pathname === '/calculators/two' ? 'active' : ''}>
                <a href="/calculators/two">
                  <i className="fa fa-calculator"></i> <span>Rate Calculator - 2</span>
                </a>
              </li>
            )}

            {/* Rate Calculator 3 (id: 19) */}
            {hasAccess('19') && (
              <li className={pathname === '/calculators/three' ? 'active' : ''}>
                <a href="/calculators/three">
                  <i className="fa fa-calculator"></i> <span>Rate Calculator - 3</span>
                </a>
              </li>
            )}

            {/* Divider */}
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '15px 0' }} />

            {/* 2. RTO SECTION */}
            <h5 className="sidebartitle">RTO</h5>
            
            <li className={pathname === '/rto' ? 'active' : ''}>
              <a href="/rto">
                <i className="fa fa-home"></i> <span>Dashboard</span>
              </a>
            </li>

            {/* License Work (id: 6) */}
            {hasAccess('6') && (
              <li className={pathname.startsWith('/license') ? 'active' : ''}>
                <a href="/license">
                  <i className="fa fa-file"></i> <span>License Work</span>
                </a>
              </li>
            )}

            {/* Vahan Work (id: 7) */}
            {hasAccess('7') && (
              <li className={pathname.startsWith('/vahan') ? 'active' : ''}>
                <a href="/vahan">
                  <i className="fa fa-file"></i> <span>Vahan Work</span>
                </a>
              </li>
            )}

            {/* Fitness & Permit (id: 12) */}
            {hasAccess('12') && (
              <li className={pathname.startsWith('/fitness') ? 'active' : ''}>
                <a href="/fitness">
                  <i className="fa fa-file"></i> <span>Fitness & Permit PDF</span>
                </a>
              </li>
            )}

            {/* Divider */}
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '15px 0' }} />

            {/* 3. ADMIN SECTION */}
            <h5 className="sidebartitle">ADMIN</h5>

            {isAdmin && (
              <>
                <li className={pathname.startsWith('/sub-admins') ? 'active' : ''}>
                  <a href="/sub-admins">
                    <i className="fa fa-users"></i> <span>Sub Admins</span>
                  </a>
                </li>
                <li className={pathname.startsWith('/setup/companies') ? 'active' : ''}>
                  <a href="/setup/companies">
                    <i className="fa fa-building"></i> <span>Companies</span>
                  </a>
                </li>
                <li className={pathname.startsWith('/setup/categories') ? 'active' : ''}>
                  <a href="/setup/categories">
                    <i className="fa fa-folder"></i> <span>Categories</span>
                  </a>
                </li>
                <li className={pathname.startsWith('/setup/agents') ? 'active' : ''}>
                  <a href="/setup/agents">
                    <i className="fa fa-briefcase"></i> <span>Agents</span>
                  </a>
                </li>
              </>
            )}

            {/* Daily Hisab (id: 9) */}
            {hasAccess('9') && (
              <li className={pathname.startsWith('/daily-hisab') ? 'active' : ''}>
                <a href="/daily-hisab">
                  <i className="fa fa-upload"></i> <span>Daily Hisab</span>
                </a>
              </li>
            )}

            {/* Office Expenses (id: 10) */}
            {hasAccess('10') && (
              <li className={pathname.startsWith('/expenses') ? 'active' : ''}>
                <a href="/expenses">
                  <i className="fa fa-upload"></i> <span>Office Expenses</span>
                </a>
              </li>
            )}

            {/* Cheque (id: 13) */}
            {hasAccess('13') && (
              <li className={pathname.startsWith('/cheque') ? 'active' : ''}>
                <a href="/cheque">
                  <i className="fa fa-upload"></i> <span>Cheque</span>
                </a>
              </li>
            )}

            {/* Salary (id: 14) */}
            {hasAccess('14') && (
              <li className={pathname.startsWith('/salary') ? 'active' : ''}>
                <a href="/salary">
                  <i className="fa fa-upload"></i> <span>Salary</span>
                </a>
              </li>
            )}

            {/* Ughrani (id: 15) */}
            {hasAccess('15') && (
              <li className={pathname.startsWith('/ughrani') ? 'active' : ''}>
                <a href="/ughrani">
                  <i className="fa fa-upload"></i> <span>Ughrani</span>
                </a>
              </li>
            )}

            {/* Our Customer (id: 16) */}
            {hasAccess('16') && (
              <li className={pathname.startsWith('/customer') ? 'active' : ''}>
                <a href="#customer">
                  <i className="fa fa-file"></i> <span>Our Customer</span>
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mainpanel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header (replacing header.php) */}
        <div className="headerbar">
          <a className="menutoggle" onClick={toggleSidebar} style={{ cursor: 'pointer' }}>
            <i className="fa fa-bars"></i>
          </a>
          
          <div className="header-right">
            <ul className="headermenu">
              <li>
                <div className={`btn-group ${userDropdownOpen ? 'open' : ''}`}>
                  <button 
                    type="button" 
                    className="btn btn-default dropdown-toggle"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    style={{ background: 'transparent', border: 'none' }}
                  > 
                    <img src="/images/user.png" alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '8px' }} /> 
                    {username} 
                    <span className="caret" style={{ marginLeft: '5px' }}></span> 
                  </button>
                  {userDropdownOpen && (
                    <ul className="dropdown-menu dropdown-menu-usermenu pull-right" style={{ display: 'block' }}>
                      <li>
                        <a href="#profile" onClick={() => setUserDropdownOpen(false)}>
                          <i className="glyphicon glyphicon-user"></i> My Profile
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                          <i className="glyphicon glyphicon-log-out"></i> Sign Out
                        </a>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Dashboard Pages */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </section>
  );
}

