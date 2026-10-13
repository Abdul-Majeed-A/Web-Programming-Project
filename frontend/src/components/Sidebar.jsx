import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  CalendarCheck,
  Bell,
  User,
  Users,
  GraduationCap,
  UserCheck,
  CalendarDays,
  FileCheck2,
  SlidersHorizontal,
  BarChart3,
  Award,
  History,
  Activity,
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/projects', label: 'My Projects', icon: FolderKanban },
    { to: '/student/projects/create', label: 'Create Project', icon: PlusCircle },
    { to: '/student/schedules', label: 'Review Schedules', icon: CalendarCheck },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/assigned', label: 'Assigned Projects', icon: FolderKanban },
    { to: '/faculty/history', label: 'Evaluation History', icon: History },
    { to: '/faculty/schedules', label: 'Upcoming Schedules', icon: CalendarDays },
    { to: '/faculty/notifications', label: 'Notifications', icon: Bell },
    { to: '/faculty/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/projects', label: 'All Projects', icon: FolderKanban },
    { to: '/admin/students', label: 'Student Accounts', icon: GraduationCap },
    { to: '/admin/faculty', label: 'Faculty Accounts', icon: Users },
    { to: '/admin/assignments', label: 'Assign Reviewers', icon: UserCheck },
    { to: '/admin/schedules', label: 'Schedule Reviews', icon: CalendarDays },
    { to: '/admin/criteria', label: 'Review Criteria', icon: SlidersHorizontal },
    { to: '/admin/evaluations', label: 'Evaluation Records', icon: FileCheck2 },
    { to: '/admin/reports', label: 'Reports & CSV', icon: BarChart3 },
    { to: '/admin/notifications', label: 'Broadcast Alerts', icon: Bell },
  ];

  let links = studentLinks;
  if (role === 'faculty') links = facultyLinks;
  if (role === 'admin') links = adminLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 d-lg-none z-index-backdrop"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`bg-white border-end d-flex flex-column transition-all sidebar-container ${
          isMobileOpen ? 'sidebar-open' : 'sidebar-closed'
        }`}
        style={{
          width: '260px',
          minWidth: '260px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 1020,
        }}
      >
        {/* Brand header */}
        <div className="p-4 border-bottom d-flex align-items-center gap-2.5">
          <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px' }}>
            <Activity size={20} />
          </div>
          <div>
            <h5 className="mb-0 fw-bold text-dark" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Project<span className="text-primary">Pulse</span>
            </h5>
            <span className="badge bg-light text-secondary text-uppercase border" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
              {role} Portal
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="p-3 flex-grow-1 overflow-auto">
          <div className="text-muted text-uppercase fw-bold px-3 mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.8px' }}>
            Navigation Menu
          </div>
          <nav className="nav flex-column gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 fw-medium text-decoration-none transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-secondary hover-sidebar-item'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-3 border-top bg-light m-2 rounded-3">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}
            >
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="mb-0 fw-semibold text-dark text-truncate small">{user.full_name}</p>
              <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                {user.student_or_faculty_identifier || user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
