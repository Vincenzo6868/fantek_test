'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

import { API_URL } from '@/lib/api-config';
import type { Club } from '@/components/dashboard/club/club-table';

interface ClubResponse {
  success: boolean;
  data: Club[];
  total: number;
  page: number;
  limit: number;
}

interface UpdateStatusResponse {
  success: boolean;
  data: {
    userId: string;
    onboardStatus: string;
    onboarded: boolean;
  };
}

export const useGetClub = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('auth-token');

    // if token is not found, redirect to login page
    if (!token) {
      window.location.href = '/auth/sign-in';
      return;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pageAlreadyFetched = clubs.slice(startIndex, endIndex).length === limit;

    if (pageAlreadyFetched) {
      setLoading(false);
      return;
    }

    const fetchClubs = async () => {
      setLoading(true);

      try {
        const response = await axios.get<ClubResponse>(`${API_URL}/admin/clubs?page=${page}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (response.data.success) {
          setTotal(response.data.total);
          setClubs((prev) => {
            const newItems = response.data.data.filter((item) => !prev.find((existing) => existing.userId === item.userId));
            return [...prev, ...newItems];
          });
        } else {
          setError('Failed to fetch clubs');
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            // Redirect on unauthorized
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth-userId');
            window.location.href = '/auth/sign-in';
            return;
          }
          setError(err.message);
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchClubs();
  }, [page, limit]);

  return {
    clubs,
    loading,
    error,
    total,
    page,
    limit,
    setPage,
    setLimit,
  };
};

export const useUpdateClubStatus = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UpdateStatusResponse | null>(null);

  const updateStatus = async (userId: string, status: 'pending' | 'accepted' | 'rejected') => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('Authentication token not found');

      const response = await axios.patch<UpdateStatusResponse>(
        `${API_URL}/admin/clubs/${userId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.data.success) {
        setData(response.data);
        return response.data;
      } else {
        setError('Failed to update status');
        throw new Error('Failed to update status');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError('Unknown error');
        throw new Error('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error, data };
};
