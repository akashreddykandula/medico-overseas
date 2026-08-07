import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../lib/api';
import PageHero from '../components/common/PageHero';

const CATEGORIES = ['all', 'campus', 'hostel', 'student_life', 'office', 'events', 'graduation'];

const useGallery = (category) =>
  useQuery({
    queryKey: ['gallery', category],
    queryFn: async () => {
      const { data } = await api.get('/gallery', { params: category !== 'all' ? { category } : {} });
      return data.data.items;
    },
  });

const GalleryPage = () => {
  const [category, setCategory] = useState('all');
  const { data: items = [], isLoading } = useGallery(category);

  return (
    <>
      <Helmet>
        <title>Gallery | Medico Overseas</title>
        <meta name="description" content="Explore campus, hostel, and student life photos from our partner universities abroad." />
      </Helmet>

      <PageHero eyebrow="LIFE ABROAD" title="Campus & Student Life Gallery" subtitle="A glimpse into campuses, hostels, and student life at our partner universities." />

      <div className="section-container py-16">
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                category === c ? 'bg-coral text-white' : 'bg-navy-50 text-navy-500 hover:bg-navy-100'
              }`}
            >
              {c.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="mb-4 h-56 animate-pulse rounded-2xl bg-navy-50" />)}

          {!isLoading && items.length === 0 && <p className="text-center text-navy-400">No photos in this category yet.</p>}

          {items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 6) * 0.05 }}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl"
            >
              <img src={item.image.url} alt={item.title || 'Gallery photo'} className="w-full object-cover transition-transform duration-500 hover:scale-105" />
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default GalleryPage;
