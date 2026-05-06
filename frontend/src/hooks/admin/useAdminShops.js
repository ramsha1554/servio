import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { serverUrl } from '../../App';

export const useAdminShops = () => {
  const queryClient = useQueryClient();

  const getShops = useQuery({
    queryKey: ['adminShops'],
    queryFn: async () => {
      const res = await axios.get(`${serverUrl}/api/admin/shops`, { withCredentials: true });
      return res.data;
    }
  });

  const toggleVerify = useMutation({
    mutationFn: async (shopId) => {
      const res = await axios.patch(`${serverUrl}/api/admin/shops/${shopId}/verify`, {}, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminShops']);
    }
  });

  const deleteShop = useMutation({
    mutationFn: async (shopId) => {
      const res = await axios.delete(`${serverUrl}/api/admin/shops/${shopId}/remove`, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminShops']);
      queryClient.invalidateQueries(['adminStats']);
    }
  });

  return { getShops, toggleVerify, deleteShop };
};
