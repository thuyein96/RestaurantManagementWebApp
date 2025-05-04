
import axios from 'axios';

const API_URL = 'https://localhost:7112/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Customer {
  id?: number;
  name: string;
  phoneNumber: string;
  email: string;
}

export interface Table {
  id?: number;
  tableNumber: string;
  numberOfSeats: number;
}

export interface TimeSlot {
  id?: number;
  slotId: string;
  time: string;
}

export interface Booking {
  id?: number;
  bookingNumber?: number;
  numberOfPeople: number;
  specialRequest: string;
  bookingDate: string;
  isConfirmed?: boolean;
  customerId: number;
  tableId: number;
  bookingSlotId: number;
}

// Customer APIs
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get('/Customer');
  return response.data;
};

export const createCustomer = async (customer: Customer): Promise<Customer> => {
  const response = await apiClient.post('/Customer', customer);
  return response.data;
};

export const updateCustomer = async (id: number, customer: Customer): Promise<Customer> => {
  const response = await apiClient.put(`/Customer`, { id: id, ...customer } );
  return response.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await apiClient.delete(`/Customer/${id}`);
};

// Table APIs
export const getTables = async (): Promise<Table[]> => {
  const response = await apiClient.get('/Table');
  return response.data;
};

export const createTable = async (table: Table): Promise<Table> => {
  const response = await apiClient.post('/Table', table);
  return response.data;
};

export const updateTable = async (id: number, table: Table): Promise<Table> => {
  const response = await apiClient.put(`/Table`, table);
  return response.data;
};

export const deleteTable = async (id: number): Promise<void> => {
  await apiClient.delete(`/Table/${id}`);
};

// TimeSlot APIs
export const getTimeSlots = async (): Promise<TimeSlot[]> => {
  const response = await apiClient.get('/TimeSlot');
  return response.data;
};

export const createTimeSlot = async (timeSlot: TimeSlot): Promise<TimeSlot> => {
  const response = await apiClient.post('/TimeSlot', timeSlot);
  return response.data;
};

export const updateTimeSlot = async (id: number, timeSlot: TimeSlot): Promise<TimeSlot> => {
  const response = await apiClient.put(`/TimeSlot`, {id: id, ...timeSlot });
  return response.data;
};

export const deleteTimeSlot = async (id: number): Promise<void> => {
  await apiClient.delete(`/TimeSlot/${id}`);
};

// Booking APIs
export const getBookings = async (): Promise<Booking[]> => {
  const response = await apiClient.get('/Booking');
  return response.data;
};

export const createBooking = async (booking: Booking): Promise<Booking> => {
  console.log('Creating booking:', booking);
  const response = await apiClient.post('/Booking', booking);
  return response.data;
};

export const updateBooking = async (id: number, booking: Booking): Promise<Booking> => {
  const response = await apiClient.put(`/Booking`, { id: id, ...booking });
  return response.data;
}

export const deleteBooking = async (id: number): Promise<void> => {
  await apiClient.delete(`/Booking/${id}`);
};

// Get bookings by customer ID
export const getBookingsByCustomerId = async (customerId: number): Promise<Booking[]> => {
  try {
    const response = await apiClient.get(`/Booking/customer/${customerId}`);
    // Ensure we return an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching bookings for customer ${customerId}:`, error);
    return [];
  }
};
