import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, LogOut, LayoutDashboard } from 'lucide-react';

const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom sticky-top py-2.5 shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold text-dark fs-4">
          <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px' }}>
            <Activity size={22} />
          </div>
          <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.5px' }}>
            Project<span className="text-primary">Pulse</span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />

        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="mx-auto align-items-center gap-lg-3">
            <Nav.Link as={NavLink} to="/" className="fw-medium px-3 text-secondary">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about" className="fw-medium px-3 text-secondary">
              About
            </Nav.Link>
            <Nav.Link as={NavLink} to="/features" className="fw-medium px-3 text-secondary">
              Features
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-2 pt-2 pt-lg-0">
            {isAuthenticated ? (
              <>
                <Button
                  as={Link}
                  to={getDashboardPath()}
                  variant="primary"
                  className="rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={handleLogout}
                  className="rounded-pill px-3 d-flex align-items-center gap-1.5"
                >
                  <LogOut size={16} /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  className="rounded-pill px-3.5"
                >
                  Log In
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  className="rounded-pill px-4 shadow-sm"
                >
                  Student Register
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
