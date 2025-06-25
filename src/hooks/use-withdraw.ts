'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

import { API_URL } from '@/lib/api-config';

interface WithdrawItem {
  _id: string;
  user: {
    _id: string;
    email: string;
    displayName: string;
  };
  withdrawId: string;
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  note: string;
  image: string;
  status: 'pending' | 'transferred' | 'rejected';
  txnHash: string;
  createdAt: number;
  updatedAt: number;
  __v: number;
}

interface WithdrawResponse {
  success: boolean;
  data: {
    withdraws: WithdrawItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface UpdateWithdrawResponse {
  success: boolean;
  data: {
    withdrawId: string;
    status: string;
    updatedAt: string;
  };
}

export const useGetWithdrawList = () => {
  const [allWithdrawItems, setAllWithdrawItems] = useState<WithdrawItem[]>([]);
  const [loading, setLoading] = useState(true);
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

    const pageAlreadyFetched = allWithdrawItems.slice(startIndex, endIndex).length === limit;

    if (pageAlreadyFetched) {
      setLoading(false);
      return;
    }

    const fetchWithdrawList = async () => {
      setLoading(true);

      try {
        const res = await axios.get<WithdrawResponse>(`${API_URL}/admin/withdraws?page=${page}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (res.data.success) {
          setTotal(res.data.data.pagination.total || 0);
          
          // Ensure res.data.data.withdraws is an array before filtering
          if (Array.isArray(res.data.data.withdraws)) {
            setAllWithdrawItems((prev) => {
              const newItems = res.data.data.withdraws.filter((item) => !prev.find((existing) => existing.withdrawId === item.withdrawId));
              return [...prev, ...newItems];
            });
          } else {
            setAllWithdrawItems([]);
          }
        } else {
          setError('Failed to fetch data');
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

    void fetchWithdrawList();
  }, [page, limit]);

  return {
    withdrawItems: allWithdrawItems,
    page,
    limit,
    total,
    loading,
    error,
    setPage,
    setLimit,
  };
};

export const useApproveWithdraw = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UpdateWithdrawResponse | null>(null);

  const approveWithdraw = async (id: string, image: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('Authentication token not found');

      const response = await axios.put<UpdateWithdrawResponse>(
        `${API_URL}/admin/withdraws/${id}/approve`,
        {
          image: image,
        },
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
        setError('Failed to approve withdraw');
        throw new Error('Failed to approve withdraw');
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

  return { approveWithdraw, loading, error, data };
};

export const useRejectWithdraw = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UpdateWithdrawResponse | null>(null);

  const rejectWithdraw = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('Authentication token not found');

      const response = await axios.put<UpdateWithdrawResponse>(
        `${API_URL}/admin/withdraws/${id}/reject`,
        {},
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
        setError('Failed to reject withdraw');
        throw new Error('Failed to reject withdraw');
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

  return { rejectWithdraw, loading, error, data };
};