
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  getTables,
  createTable,
  updateTable,
  deleteTable
} from '../services/apiService';

const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Table>();
  
  useEffect(() => {
    fetchTables();
  }, []);
  
  useEffect(() => {
    if (editingTable) {
      setValue('tableNumber', editingTable.tableNumber);
      setValue('numberOfSeats', editingTable.numberOfSeats);
    }
  }, [editingTable, setValue]);
  
  const fetchTables = async () => {
    try {
      const data = await getTables();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tables',
        variant: 'destructive'
      });
    }
  };
  
  const onSubmit = async (data: Table) => {
    setIsLoading(true);
    try {
      if (editingTable) {
        await updateTable(editingTable.id!, { ...data, id: editingTable.id});
        toast({
          title: 'Success',
          description: 'Table updated successfully',
        });
      } else {
        await createTable(data);
        toast({
          title: 'Success',
          description: 'Table created successfully',
        });
      }
      await fetchTables();
      setEditingTable(null);
    } catch (error) {
      console.error('Error saving table:', error);
      toast({
        title: 'Error',
        description: 'Failed to save table',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (table: Table) => {
    setEditingTable(table);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (table: Table) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      await deleteTable(table.id!);
      toast({
        title: 'Success',
        description: 'Table deleted successfully',
      });
      await fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete table',
        variant: 'destructive'
      });
    }
  };
  
  const handleCancel = () => {
    setEditingTable(null);
  };
  
  const columns = [
    { header: 'Table Number', accessor: 'tableNumber' as keyof Table },
    { header: 'Seats', accessor: 'numberOfSeats' as keyof Table },
  ];
  
  return (
    <Layout>
      <div className="space-y-8">
        <Card title={editingTable ? 'Edit Table' : 'Add New Table'}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tableNumber" className="block text-sm font-medium mb-1">
                  Table Number
                </label>
                <input
                  id="tableNumber"
                  type="text"
                  {...register('tableNumber', { 
                    required: 'Table number is required'
                  })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.tableNumber && (
                  <p className="text-destructive text-sm mt-1">{errors.tableNumber.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="numberOfSeats" className="block text-sm font-medium mb-1">
                  Number of Seats
                </label>
                <input
                  id="numberOfSeats"
                  type="number"
                  min="1"
                  {...register('numberOfSeats', { 
                    required: 'Number of seats is required',
                    min: { value: 1, message: 'At least 1 seat is required' } 
                  })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.numberOfSeats && (
                  <p className="text-destructive text-sm mt-1">{errors.numberOfSeats.message}</p>
                )}
              </div>
              
            </div>
            
            <div className="flex justify-end space-x-2">
              {editingTable && (
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
                {isLoading ? 'Saving...' : editingTable ? 'Update Table' : 'Add Table'}
              </button>
            </div>
          </form>
        </Card>
        
        <Card title="Tables">
          <DataTable
            columns={columns}
            data={tables}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default TablesPage;
