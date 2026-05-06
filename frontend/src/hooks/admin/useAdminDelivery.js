import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { serverUrl } from '../../App';
import { useSelector } from 'react-redux';

export const useAdminDelivery = () => {
  const { userData } = useSelector(state => state.user);

  const getDeliveryBoys = useQuery({
    queryKey: ['adminDeliveryBoys'],
    queryFn: async () => {
      const res = await axios.get(`${serverUrl}/api/admin/delivery`, { withCredentials: true });
      return res.data;
    },
    enabled: userData?.role === 'admin'
  });

  return { getDeliveryBoys };
};
