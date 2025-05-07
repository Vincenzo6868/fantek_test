'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

import { API_URL } from '@/lib/api-config';
import type { KYCItem, KYCResponse } from '@/components/dashboard/kyc/kyc-table';

interface UpdateStatusResponse {
  success: boolean;
  data: {
    userId: string;
    onboardStatus: string;
    onboarded: boolean;
  };
}

export const useGetKYCList = () => {
  const [allKYCItems, setAllKYCItems] = useState<KYCItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      window.location.href = '/auth/sign-in';
      return;
    }
  
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    const pageAlreadyFetched = allKYCItems.slice(startIndex, endIndex).length === limit;
  
    if (pageAlreadyFetched) {
      setLoading(false);
      return;
    }
  
    const fetchKYCList = async () => {
      setLoading(true);
  
      try {
        const res = await axios.get<KYCResponse>(`${API_URL}/kyc/admin/submissions?page=${page}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
  
        if (res.data.success) {
          setTotal(res.data.total);
  
          setAllKYCItems((prev) => {
            const newItems = res.data.data.filter(
              (item) => !prev.find((existing) => existing._id === item._id)
            );
            return [...prev, ...newItems];
          });
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
  
    void fetchKYCList();
  }, [page, limit]);
  

  return {
    kycItems: allKYCItems,
    page,
    limit,
    total,
    loading,
    error,
    setPage,
    setLimit,
  };
};

export const useUpdateKYCStatus = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UpdateStatusResponse | null>(null);

  const updateStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('Authentication token not found');

      const response = await axios.patch<UpdateStatusResponse>(
        `${API_URL}/kyc/admin/submissions/${id}`,
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
