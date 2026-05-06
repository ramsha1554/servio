import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { serverUrl } from '../../App';

export const useGetAdminUsers = () => {
    return useQuery({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const { data } = await axios.get(`${serverUrl}/api/admin/users`, { withCredentials: true });
            return data;
        }
    });
};

export const useToggleBanUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId) => {
            const { data } = await axios.patch(`${serverUrl}/api/admin/users/${userId}/ban`, {}, { withCredentials: true });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        }
    });
};

export const useChangeUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, role }) => {
            const { data } = await axios.patch(`${serverUrl}/api/admin/users/${userId}/role`, { role }, { withCredentials: true });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        }
    });
};
