import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShifts, clockIn, clockOut } from '@/lib/api/staff';

export function useShifts(staffId?: string) {
  const queryClient = useQueryClient();

  const shiftsQuery = useQuery({
    queryKey: ['shifts', staffId],
    queryFn: () => getShifts(staffId),
  });

  const clockInMutation = useMutation({
    mutationFn: (sId: string) => clockIn(sId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: (shiftId: string) => clockOut(shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const activeShift = shiftsQuery.data?.find((s) => s.status === 'Ongoing');

  return {
    shifts: shiftsQuery.data ?? [],
    activeShift,
    isLoading: shiftsQuery.isLoading,
    error: shiftsQuery.error,
    clockIn: clockInMutation.mutateAsync,
    isClockingIn: clockInMutation.isPending,
    clockOut: clockOutMutation.mutateAsync,
    isClockingOut: clockOutMutation.isPending,
  };
}
