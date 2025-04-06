'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

import { API_URL } from '@/lib/api-config';
import type { Club } from '@/components/dashboard/club/club-table';

interface ClubResponse {
  success: boolean;
  data: Club[];
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

  // Get token from localStorage
  const token = localStorage.getItem('auth-token');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get<ClubResponse>(`${API_URL}/clubs?page=1&limit=5`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (response.data.success) {
          setClubs(response.data.data);
        } else {
          setError('Failed to fetch clubs');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      void fetchClubs();
    }
  }, [token]);

  return { clubs, loading, error };
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
        `${API_URL}/clubs/${userId}/status`,
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
