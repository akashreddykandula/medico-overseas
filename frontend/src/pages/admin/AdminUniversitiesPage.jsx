import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import api from '../../lib/api';

const AdminUniversitiesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['admin-universities'],
    queryFn: async () => {
      const { data } = await api.get('/universities');
      return data.data.universities;
    },
  });

  const { data: countries = [] } = useQuery({
    queryKey: ['admin-countries'],
    queryFn: async () => {
      const { data } = await api.get('/countries');
      return data.data.countries;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/universities', payload),
    onSuccess: () => {
      toast.success('University created');
      queryClient.invalidateQueries({ queryKey: ['admin-universities'] });
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create university'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/universities/${id}`),
    onSuccess: () => {
      toast.success('University deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-universities'] });
    },
  });

  const onSubmit = (formData) => {
    createMutation.mutate({
      name: formData.name,
      country: formData.country,
      fees: { tuitionPerYear: Number(formData.tuitionPerYear), currency: 'USD' },
      durationYears: 6,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-navy-600">Universities</h2>
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-2 rounded-lg bg-coral px-3 py-2 text-xs font-semibold text-white">
          <HiOutlinePlus /> Add University
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <input placeholder="University name" className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm" {...register('name', { required: true })} />
          <select className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm" {...register('country', { required: true })}>
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <input type="number" placeholder="Tuition per year (USD)" className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm" {...register('tuitionPerYear', { required: true })} />
          <button type="submit" disabled={createMutation.isPending} className="btn-primary !py-2">
            {createMutation.isPending ? 'Saving...' : 'Save University'}
          </button>
        </form>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-left text-xs uppercase text-navy-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Tuition/yr</th>
              <th className="px-4 py-3">NMC</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-navy-400">Loading...</td></tr>}
            {universities.map((u) => (
              <tr key={u._id} className="border-t border-navy-50">
                <td className="px-4 py-3 font-medium text-navy-600">{u.name}</td>
                <td className="px-4 py-3">{u.country?.name}</td>
                <td className="px-4 py-3">{u.fees.currency} {u.fees.tuitionPerYear.toLocaleString()}</td>
                <td className="px-4 py-3">{u.nmcApproved ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => deleteMutation.mutate(u._id)} className="text-coral hover:text-coral-700">
                    <HiOutlineTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUniversitiesPage;
