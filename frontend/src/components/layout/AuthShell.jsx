import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4 py-16">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-glow">
      <Link to="/" className="mx-auto flex w-fit justify-center">
        <Logo className="h-9" />
      </Link>
      <h1 className="mt-6 text-center font-heading text-2xl font-bold text-navy-600">{title}</h1>
      {subtitle && <p className="mt-2 text-center text-sm text-navy-400">{subtitle}</p>}
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-6 text-center text-sm text-navy-400">{footer}</div>}
    </div>
  </div>
);

export default AuthShell;
