import React from 'react';
import { useSelector } from 'react-redux';

const StudentProfilePage = () => {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="max-w-lg rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-navy-600">Your Profile</h2>
      <div className="mt-6 space-y-4 text-sm">
        <div>
          <p className="text-xs text-navy-400">Full Name</p>
          <p className="font-medium text-navy-600">{user?.name}</p>
        </div>
        <div>
          <p className="text-xs text-navy-400">Email</p>
          <p className="font-medium text-navy-600">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs text-navy-400">Phone</p>
          <p className="font-medium text-navy-600">{user?.phone}</p>
        </div>
      </div>
      <p className="mt-6 text-xs text-navy-300">
        Profile editing (NEET score, address, DOB) can be wired to PATCH /api/users/me — add that endpoint when
        ready.
      </p>
    </div>
  );
};

export default StudentProfilePage;
