import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Customer, 
  Table, 
  TimeSlot, 
  Booking, 
  getCustomers, 
  getTables, 
  getTimeSlots, 
  createBooking,
  getBookingsByCustomerId,
  deleteBooking,
  getBookings,
  updateBooking
} from '../services/apiService';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, RefreshCw } from 'lucide-react';
import DataTable from '../components/DataTable';

const BookingPage: React.FC = () => {
  const { toast } = useToast();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Booking>();
  const selectedCustomerId = watch('customerId');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);

  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    error: customersError,
    refetch: refetchCustomers
  } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers
  });
  
  const {
    data: tables = [],
    isLoading: isLoadingTables,
    error: tablesError,
    refetch: refetchTables
  } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const allTables = await getTables();
      return allTables;
    }
  });
  
  const {
    data: timeSlots = [],
    isLoading: isLoadingTimeSlots,
    error: timeSlotsError,
    refetch: refetchTimeSlots
  } = useQuery({
    queryKey: ['timeSlots'],
    queryFn: async () => {
      const allTimeSlots = await getTimeSlots();
      console.log('Fetched TimeSlots:', allTimeSlots);
      return allTimeSlots;
    }
  });
  
  // Query for customer bookings
  const {
    data: customerBookings = [],
    isLoading: isLoadingCustomerBookings,
    refetch: refetchCustomerBookings
  } = useQuery({
    queryKey: ['bookings', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return [];
      return getBookingsByCustomerId(Number(selectedCustomerId));
    },
    enabled: !!selectedCustomerId
  });

  const {
    data: allBookings = [],
    isLoading: isLoadingAllBookings,
    error: allBookingsError,
    refetch: refetchAllBookings
  } = useQuery({
    queryKey: ['allBookings'],
    queryFn: getBookings
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isLoading = isLoadingCustomers || isLoadingTables || isLoadingTimeSlots;
  const hasError = customersError || tablesError || timeSlotsError;
  
  const refetchAll = () => {
    refetchCustomers();
    refetchTables();
    refetchTimeSlots();
    refetchAllBookings();
    if(selectedCustomerId){
      refetchCustomerBookings();
    }
  };
  
  const onSubmit = async (data: Booking) => {
    setIsSubmitting(true);
    try {
      // Map the form data to the expected structure
      const bookingData: Booking = {
        id: 0,
        customerId: Number(data.customerId),
        tableId: Number(data.tableId),
        bookingSlotId: Number(data.bookingSlotId),
        bookingDate: data.bookingDate,
        numberOfPeople: Number(data.numberOfPeople),
        specialRequest: data.specialRequest || "",
        isConfirmed: true,
      };
      
      if (isEditMode && editingBookingId) {
        console.log('Updating booking with data:', bookingData);
        await updateBooking(editingBookingId, bookingData);
        toast({
          title: 'Success',
          description: 'Booking updated successfully',
        });
        setIsEditMode(false);
        setEditingBookingId(null);
      } else {
        console.log('Submitting booking with data:', bookingData);
        await createBooking(bookingData);
        toast({
          title: 'Success',
          description: 'Booking created successfully',
        });
      }
      reset();
      // Refetch data after successful booking
      refetchAll();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} booking`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteBooking = async (booking: Booking) => {
    if (!booking.id) {
      toast({
        title: 'Error',
        description: 'Cannot delete booking without ID',
        variant: 'destructive'
      });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await deleteBooking(booking.id);
      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });
      refetchAll();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete booking',
        variant: 'destructive'
      });
    }
  };

  const handleEditBooking = (booking: Booking) => {
    if (!booking.id) {
      toast({
        title: 'Error',
        description: 'Cannot edit booking without ID',
        variant: 'destructive'
      });
      return;
    }

    // Set form values from the selected booking
    setValue('customerId', booking.customerId);
    setValue('tableId', booking.tableId);
    setValue('bookingSlotId', booking.bookingSlotId);
    setValue('numberOfPeople', booking.numberOfPeople);
    setValue('specialRequest', booking.specialRequest || '');
    
    // Set edit mode
    setIsEditMode(true);
    setEditingBookingId(booking.id);
    
    // Scroll to the form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingBookingId(null);
    reset();
  };

  // Define columns for the bookings table
  const bookingColumns = [
    { 
      header: 'Booking #', 
      accessor: 'bookingNumber' as keyof Booking
    },
    {
      header: 'Customer',
      accessor: 'customer' as keyof Booking,
      render: (booking: Booking) => { 
        const customer = customers.find(customer => customer.id === booking.customerId);
        return customer ? `${customer.name}` : 'N/A'; }
    },
    { 
      header: 'People', 
      accessor: 'numberOfPeople' as keyof Booking 
    },
    {
      header: 'Time',
      accessor: 'bookingSlotId' as keyof Booking,
      render: (booking: Booking) => {
        const slot = timeSlots.find(slot => slot.id == booking.bookingSlotId);
        console.log('Slot:', slot);
        if (slot == null) return 'No time available';

        // Format and display only the time
        const today = new Date().toISOString().split('T')[0]; // Get today's date
        const dateTimeString = `${today}T${slot.time}`; // Combine date and time
        const formattedTime = new Date(dateTimeString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        return formattedTime;
      }
    },
    {
      header: 'Table',
      accessor: 'tableId' as keyof Booking,
      render: (booking: Booking) => {
        const table = tables.find(table => table.id === booking.tableId);
        return table ? `Table ${table.tableNumber} (${table.numberOfSeats} seats)` : 'N/A';
      }
    },
    {
      header: 'Status',
      accessor: 'isConfirmed' as keyof Booking,
      render: (booking: Booking) => booking.isConfirmed ? 
        'Confirmed' : 'Pending'
    },
    {
      header: 'Special Request',
      accessor: 'specialRequest' as keyof Booking,
      render: (booking: Booking) => booking.specialRequest || 'None'
    }
  ];
  
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Card title="Make a Reservation">
            <div className="flex justify-center items-center h-64">
              <p>Loading booking information...</p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  if (hasError) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Card title="Make a Reservation">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                <p>Failed to load booking data</p>
              </div>
              <Button onClick={refetchAll} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Handle empty data states
  const noCustomers = !customers || customers.length === 0;
  const noTables = !tables || tables.length === 0;
  const noTimeSlots = !timeSlots || timeSlots.length === 0;
  
  if (noCustomers || noTables || noTimeSlots) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Card title="Make a Reservation">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="flex items-center text-amber-500">
                <AlertCircle className="mr-2 h-5 w-5" />
                <p>
                  {noCustomers ? "No customers available. " : ""}
                  {noTables ? "No tables available. " : ""}
                  {noTimeSlots ? "No time slots available." : ""}
                </p>
              </div>
              <Button onClick={refetchAll} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <Card title={isEditMode ? "Edit Reservation" : "Make a Reservation"}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium mb-1">
                  Customer
                </label>
                <select
                  id="customerId"
                  {...register('customerId', { required: 'Customer is required' })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isEditMode}
                >
                  <option value="">Select a customer</option>
                  {customers && Array.isArray(customers) && customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.phoneNumber})
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <p className="text-destructive text-sm mt-1">{errors.customerId.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="tableId" className="block text-sm font-medium mb-1">
                  Table
                </label>
                <select
                  id="tableId"
                  {...register('tableId', { required: 'Table is required' })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a table</option>
                  {tables && Array.isArray(tables) && tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      Table {table.tableNumber} ({table.numberOfSeats} seats)
                    </option>
                  ))}
                </select>
                {errors.tableId && (
                  <p className="text-destructive text-sm mt-1">{errors.tableId.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="timeSlotId" className="block text-sm font-medium mb-1">
                  Time Slot
                </label>
                <select
                  id="timeSlotId"
                  {...register('bookingSlotId', { required: 'Time slot is required' })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a time slot</option>
                  {timeSlots && Array.isArray(timeSlots) && timeSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.slotId} - {new Date(`${new Date().toISOString().split('T')[0]}T${slot.time}`).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                    </option>
                  ))}
                </select>
                {errors.bookingSlotId && (
                  <p className="text-destructive text-sm mt-1">{errors.bookingSlotId.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="numberOfPeople" className="block text-sm font-medium mb-1">
                  Number of People
                </label>
                <input
                  id="numberOfPeople"
                  type="number"
                  min="1"
                  {...register('numberOfPeople', { 
                    required: 'Number of people is required',
                    min: { value: 1, message: 'At least 1 person is required' } 
                  })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.numberOfPeople && (
                  <p className="text-destructive text-sm mt-1">{errors.numberOfPeople.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="bookingDate" className="block text-sm font-medium mb-1">
                  Booking Date
                </label>
                <input
                  id="bookingDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('bookingDate', { required: 'Booking date is required' })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.bookingDate && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.bookingDate.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="specialRequest" className="block text-sm font-medium mb-1">
                  Special Request
                </label>
                <textarea
                  id="specialRequest"
                  {...register('specialRequest')}
                  rows={4}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Any special requests or dietary requirements?"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              {isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Book Table'}
              </Button>
            </div>
          </form>
        </Card>
        
        {/* {selectedCustomerId && (
          <Card title="Customer's Bookings">
            {isLoadingCustomerBookings ? (
              <div className="p-6 text-center">
                Loading customer bookings...
              </div>
            ) : customerBookings.length > 0 ? (
              <DataTable
                columns={bookingColumns}
                data={customerBookings}
                onDelete={handleDeleteBooking}
                onEdit={handleEditBooking}
              />
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No bookings found for this customer
              </div>
            )}
          </Card> 
        )} */}

        <Card title="All Bookings">
          {isLoadingAllBookings ? (
            <div className="p-6 text-center">
              Loading all bookings...
            </div>
          ) : allBookings.length > 0 ? (
            <DataTable
              columns={bookingColumns}
              data={allBookings}
              onDelete={handleDeleteBooking}
              onEdit={handleEditBooking}
            />
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No bookings found
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default BookingPage;