import { api } from './client';

export interface Shift {
  id: string;
  tenant_id: string;
  staff_id: string;
  clock_in: string;
  clock_out: string | null;
  status: 'Ongoing' | 'Completed';
  total_hours?: number;
}

export const getShifts = async (staffId?: string): Promise<Shift[]> => {
  const url = staffId ? `/shifts?staff_id=${staffId}` : '/shifts';
  const response = await api.get(url);
  return response.data.data;
};

export const clockIn = async (staffId: string): Promise<Shift> => {
  const response = await api.post('/shifts', {
    action: 'clock_in',
    staff_id: staffId,
  });
  return response.data;
};

export const clockOut = async (shiftId: string): Promise<Shift> => {
  const response = await api.post('/shifts', {
    action: 'clock_out',
    shift_id: shiftId,
  });
  return response.data;
};
