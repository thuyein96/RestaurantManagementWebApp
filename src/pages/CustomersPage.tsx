
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import { useToast } from '@/hooks/use-toast';
import {
  Customer,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../services/apiService';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Customer>();
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  useEffect(() => {
    if (editingCustomer) {
      setValue('name', editingCustomer.name);
      setValue('phoneNumber', editingCustomer.phoneNumber);
      setValue('email', editingCustomer.email);
    }
  }, [editingCustomer, setValue]);
  
  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customers',
        variant: 'destructive'
      });
    }
  };
  
  const onSubmit = async (data: Customer) => {
    setIsLoading(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, data);
        toast({
          title: 'Success',
          description: 'Customer updated successfully',
        });
      } else {
        await createCustomer(data);
        toast({
          title: 'Success',
          description: 'Customer created successfully',
        });
      }
      await fetchCustomers();
      reset();
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to save customer',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (customer: Customer) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await deleteCustomer(customer.id!);
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
      await fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive'
      });
    }
  };
  
  const handleCancel = () => {
    setEditingCustomer(null);
    reset();
  };
  
  const columns = [
    { header: 'Name', accessor: 'name' as keyof Customer },
    { header: 'Phone', accessor: 'phoneNumber' as keyof Customer },
    { header: 'Email', accessor: 'email' as keyof Customer },
  ];
  
  return (
    <Layout>
      <div className="space-y-8">
        <Card title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="text"
                  {...register('phoneNumber', { required: 'Phone number is required' })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.phoneNumber && (
                  <p className="text-destructive text-sm mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              {editingCustomer && (
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
                {isLoading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Add Customer'}
              </button>
            </div>
          </form>
        </Card>
        
        <Card title="Customers">
          <DataTable
            columns={columns}
            data={customers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default CustomersPage;
