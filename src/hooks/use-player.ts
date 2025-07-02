'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

import { API_URL } from '@/lib/api-config';

export interface Player {
  userId: string;
  displayName: string;
  representativeName: string;
  phoneNumber: string;
  email: string;
  onboarded: boolean;
  onboardStatus: string;
  password: string;
}

interface PlayerResponse {
  success: boolean;
  data: Player[];
  total: number;
  page: number;
  limit: number;
}

interface UpdatePlayerStatusResponse {
  success: boolean;
  data: {
    userId: string;
    onboardStatus: string;
    onboarded: boolean;
  };
}

export const useGetPlayer = () => {
  const [players, setPlayers] = useState<Player[]>([]);
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

    const pageAlreadyFetched = players.slice(startIndex, endIndex).length === limit;

    if (pageAlreadyFetched) {
      setLoading(false);
      return;
    }

    const fetchPlayers = async () => {
      setLoading(true);

      try {
        const response = await axios.get<PlayerResponse>(`${API_URL}/admin/players?page=${page}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (response.data.success) {
          setTotal(response.data.total);
          setPlayers((prev) => {
            const newItems = response.data.data.filter((item) => !prev.find((existing) => existing.userId === item.userId));
            return [...prev, ...newItems];
          });
        } else {
          setError('Failed to fetch players');
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

    void fetchPlayers();
  }, [page, limit]);

  return {
    players,
    loading,
    error,
    total,
    page,
    limit,
    setPage,
    setLimit,
  };
};

export const useUpdatePlayerStatus = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UpdatePlayerStatusResponse | null>(null);

  const updateStatus = async (userId: string, status: 'pending' | 'accepted' | 'rejected') => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('Authentication token not found');

      const response = await axios.patch<UpdatePlayerStatusResponse>(
        `${API_URL}/admin/players/${userId}/status`,
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
