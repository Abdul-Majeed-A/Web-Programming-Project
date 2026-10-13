import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Container, Dropdown, Badge, Button } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { Menu, Bell, LogOut, User, Shield, GraduationCap, Users } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) {
          setUnreadCount(res.data.unreadCount || 0);
          setRecentNotifications(res.data.data.slice(0, 5) || []);
        }
      } catch (err) {
        // Silent catch for background polling
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // Poll every 45s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    if (user?.role === 'admin') return <Shield size={14} className="text-danger" />;
    if (user?.role === 'faculty') return <Users size={14} className="text-info" />;
    return <GraduationCap size={14} className="text-primary" />;
  };

  const getNotificationLink = () => {
    if (user?.role === 'admin') return '/admin/notifications';
    if (user?.role === 'faculty') return '/faculty/notifications';
    return '/student/notifications';
  };

  const getProfileLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'faculty') return '/faculty/profile';
    return '/student/profile';
  };

  return (
    <div className="d-flex min-vh-100 bg-slate-50">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="d-flex flex-column flex-grow-1 min-vw-0" style={{ backgroundColor: '#f8fafc' }}>
        {/* Topbar */}
        <header className="bg-white border-bottom py-3 px-4 sticky-top shadow-xs">
          <div className="d-flex align-items-center justify-content-between">
            {/* Mobile Toggle & Brand indicator */}
            <div className="d-flex align-items-center gap-3">
              <Button
                variant="light"
                className="d-lg-none p-1.5 rounded-2 border"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle Navigation"
              >
                <Menu size={20} />
              </Button>
              <div className="d-none d-sm-block">
                <span className="text-muted small">Academic Portal</span>
                <h6 className="mb-0 fw-bold text-dark text-capitalize">{user?.role} Workspace</h6>
              </div>
            </div>

            {/* Right Topbar Actions */}
            <div className="d-flex align-items-center gap-3">
              {/* Notifications Dropdown */}
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="position-relative p-2 rounded-circle border shadow-xs" id="dropdown-notifications">
                  <Bell size={18} className="text-secondary" />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg border-0 rounded-4 p-2" style={{ width: '320px' }}>
                  <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                    <span className="fw-bold small text-dark">Notifications</span>
                    {unreadCount > 0 && <Badge bg="primary" pill>{unreadCount} new</Badge>}
                  </div>
                  <div className="py-1" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                    {recentNotifications.length === 0 ? (
                      <div className="text-center py-3 text-muted small">No notifications yet</div>
                    ) : (
                      recentNotifications.map((notif) => (
                        <Dropdown.Item
                          key={notif.id}
                          as={Link}
                          to={notif.link || getNotificationLink()}
                          className={`p-2.5 rounded-3 mb-1 text-wrap ${!notif.is_read ? 'bg-light fw-medium' : ''}`}
                        >
                          <div className="fw-semibold small text-dark">{notif.title}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{notif.message}</div>
                        </Dropdown.Item>
                      ))
                    )}
                  </div>
                  <div className="border-top pt-2 text-center">
                    <Link to={getNotificationLink()} className="small text-decoration-none fw-semibold text-primary">
                      View All Notifications
                    </Link>
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* User Dropdown */}
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2 p-1.5 pe-3 rounded-pill border shadow-xs" id="dropdown-user">
                  <div
                    className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
                  >
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-start d-none d-md-block">
                    <div className="fw-semibold text-dark small line-height-1">{user?.full_name}</div>
                    <div className="text-muted text-capitalize d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                      {getRoleIcon()} {user?.role}
                    </div>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg border-0 rounded-4 p-2" style={{ minWidth: '200px' }}>
                  <div className="px-3 py-2 border-bottom mb-1">
                    <p className="mb-0 fw-bold small text-dark">{user?.full_name}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{user?.email}</p>
                  </div>
                  <Dropdown.Item as={Link} to={getProfileLink()} className="rounded-3 d-flex align-items-center gap-2 py-2">
                    <User size={16} /> My Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="rounded-3 text-danger d-flex align-items-center gap-2 py-2">
                    <LogOut size={16} /> Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-grow-1 p-3 p-md-4">
          <Container fluid className="px-0">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
