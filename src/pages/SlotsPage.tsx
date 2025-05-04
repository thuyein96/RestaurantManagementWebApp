
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import { useToast } from '@/hooks/use-toast';
import {
  TimeSlot,
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
} from '../services/apiService';

const SlotsPage: React.FC = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TimeSlot>();
  
  useEffect(() => {
    fetchSlots();
  }, []);
  
  useEffect(() => {
    if (editingSlot) {
      setValue('slotId', editingSlot.slotId);
      if(editingSlot.time)
      {
        const today = new Date().toISOString().split('T')[0];
        const dateTimeString = `${today}T${editingSlot.time}`;
        setValue('time', new Date(dateTimeString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      }
    }
  }, [editingSlot, setValue]);
  
  const fetchSlots = async () => {
    try {
      const data = await getTimeSlots();
      setSlots(data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch time slots',
        variant: 'destructive'
      });
    }
  };
  
  const onSubmit = async (data: TimeSlot) => {
    setIsLoading(true);
    try {
      if (editingSlot) {
        await updateTimeSlot(editingSlot.id!, { ...data, id: editingSlot.id });
        toast({
          title: 'Success',
          description: 'Time slot updated successfully',
        });
      } else {
        await createTimeSlot(data);
        toast({
          title: 'Success',
          description: 'Time slot created successfully',
        });
      }
      await fetchSlots();
      setEditingSlot(null);
    } catch (error) {
      console.error('Error saving time slot:', error);
      toast({
        title: 'Error',
        description: 'Failed to save time slot',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (slot: TimeSlot) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    
    try {
      await deleteTimeSlot(slot.id!);
      toast({
        title: 'Success',
        description: 'Time slot deleted successfully',
      });
      await fetchSlots();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time slot',
        variant: 'destructive'
      });
    }
  };
  
  const handleCancel = () => {
    setEditingSlot(null);
  };
  
  const columns = [
    { header: 'Slot Name', accessor: 'slotName' as keyof TimeSlot },
    { header: 'Slot ID', accessor: 'slotId' as keyof TimeSlot },
    { 
      header: 'Time', 
      accessor: 'time' as keyof TimeSlot,
      render: (slot: TimeSlot) => {
        if (!slot.time) return 'No time available';
  
        // Format and display only the time
        const today = new Date().toISOString().split('T')[0]; // Get today's date
        const dateTimeString = `${today}T${slot.time}`; // Combine date and time
        const formattedTime = new Date(dateTimeString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  
        return formattedTime;
      }
    }
  ];
  
  return (
    <Layout>
      <div className="space-y-8">
        <Card title={editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="slotId" className="block text-sm font-medium mb-1">
                  Slot ID
                </label>
                <input
                  id="slotId"
                  type="text"
                  {...register('slotId', { required: 'Slot ID is required' })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="A unique identifier"
                />
                {errors.slotId && (
                  <p className="text-destructive text-sm mt-1">{errors.slotId.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="dateTime" className="block text-sm font-medium mb-1">
                  Time
                </label>
                <input
                  id="dateTime"
                  {...register('time', { required: 'Date and time are required' })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.time && (
                  <p className="text-destructive text-sm mt-1">{errors.time.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              {editingSlot && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : editingSlot ? 'Update Time Slot' : 'Add Time Slot'}
              </button>
            </div>
          </form>
        </Card>
        
        <Card title="Time Slots">
          <DataTable
            columns={columns}
            data={slots}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default SlotsPage;
