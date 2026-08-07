import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineDocumentText, HiOutlineUser, HiOutlineLogout } from 'react-icons/hi';
import Logo from '../common/Logo';
import { logout } from '../../features/authSlice';

const LINKS = [
  { to: '/portal', label: 'Dashboard', icon: HiOutlineViewGrid, end: true },
  { to: '/portal/documents', label: 'Documents', icon: HiOutlineDocumentText },
  { to: '/portal/profile', label: 'Profile', icon: HiOutlineUser },
];

const StudentPortalLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-navy-50">
      <aside className="hidden w-64 shrink-0 flex-col bg-navy p-6 text-white lg:flex">
        <Logo variant="dark" className="h-8" />
        <div className="mt-10 flex flex-col gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'bg-coral text-white' : 'text-navy-100 hover:bg-white/10'
                }`
              }
            >
              <l.icon size={18} /> {l.label}
            </NavLink>
          ))}
        </div>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-200 hover:bg-white/10">
          <HiOutlineLogout size={18} /> Log Out
        </button>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-navy-100 bg-white px-6 py-4">
          <h1 className="font-heading text-lg font-semibold text-navy-600">Welcome, {user?.name?.split(' ')[0]}</h1>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentPortalLayout;
