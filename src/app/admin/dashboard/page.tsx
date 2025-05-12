'use client';
import React, { useState, useEffect } from 'react';
import { Search, Copy, Plus, Trash } from 'lucide-react';
import { Order } from '../../../types';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CodeGeneratorModal from '@/components/common/CodeGeneratorModal';

const AdminDashboardPage: React.FC = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load orders from Supabase
  useEffect(() => {
    const checkSessionAndLoadData = async () => {
      setIsLoading(true);

      // Check authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        router.push('/admin/login');
        return;
      }

      // Load orders from Supabase
      const { data: ordersData, error: ordersError } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .order('created_at', { ascending: true });

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
      } else if (ordersData) {
        const formattedOrders: Order[] = ordersData.map((order) => ({
          id: order.id,
          code: order.code,
          orderId: order.orderId || null,
          status: order.status || 'pending',
          loginInfo: order.loginInfo || null,
          email: order.email || null,
          name: order.name || null,
          created: order.created_at,
        }));

        setOrders(formattedOrders);
      }

      setIsLoading(false);
    };

    checkSessionAndLoadData();
  }, [router, refreshTrigger]);

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.code.toLowerCase().includes(searchLower) ||
      (order.orderId && order.orderId.toLowerCase().includes(searchLower)) ||
      (order.email && order.email.toLowerCase().includes(searchLower)) ||
      (order.name && order.name.toLowerCase().includes(searchLower))
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleSelectAll = () => {
    if (selectedOrders.length === currentItems.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentItems.map((order) => order.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((orderId) => orderId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/redeem/${code}`);
  };

  const handleAddLoginInfo = (id: string) => {
    router.push(`/admin/orders/${id}`);
  };

  const handleSaveGeneratedCode = async (generatedCode: {
    name: string;
    email: string;
    code: string;
  }) => {
    try {
      const { error } = await supabase
        .from('cheap-play-zone')
        .insert({
          code: generatedCode.code,
          name: generatedCode.name,
          email: generatedCode.email,
          status: 'pending',
        })
        .select();

      if (error) {
        alert('Error saving to Supabase. Fallback to local context.');
        console.error('Error saving to Supabase:', error);
      } else {
        // Refresh the orders list
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Exception when saving code:', err);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) return;

    try {
      const { error } = await supabase
        .from('cheap-play-zone')
        .delete()
        .in('id', selectedOrders);

      if (error) {
        console.error('Error deleting from Supabase:', error);
        return;
      }

      // Refresh data after deletion
      setRefreshTrigger((prev) => prev + 1);
      setSelectedOrders([]);
    } catch (err) {
      console.error('Exception when deleting orders:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search by code, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded p-3 pl-10 text-white"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page > 0 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
            className="w-16 bg-gray-800 border border-gray-700 rounded p-2 text-white text-center"
          />
          <span>of {totalPages}</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            Generate Codes
          </button>
          <button
            onClick={handleSelectAll}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Select All
          </button>
        </div>
      </div>

      <CodeGeneratorModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onSave={handleSaveGeneratedCode}
      />

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-3 text-left">Select</th>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Copy</th>
              <th className="p-3 text-left">Add Game Information</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((order: Order) => (
              <tr
                key={order.id}
                className="border-t border-gray-700 hover:bg-gray-750"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleSelect(order.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="p-3">{order.id || '-'}</td>
                <td className="p-3">{order.name || '-'}</td>
                <td className="p-3">{order.email || '-'}</td>
                <td className="p-3">{order.code}</td>
                <td className="p-3">
                  {new Date(order.created).toLocaleString()}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleCopyCode(order.code)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleAddLoginInfo(order.id)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrders.length > 0 && (
        <button
          onClick={handleDeleteSelected}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
        >
          <Trash size={16} />
          Delete Selected
        </button>
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-800 rounded-l-md border-r border-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum = i + 1;
          if (currentPage > 3 && totalPages > 5) {
            pageNum = currentPage + i - 2;
            if (pageNum > totalPages) {
              pageNum = totalPages - (4 - i);
            }
          }

          if (pageNum <= totalPages) {
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 border-r border-gray-700 ${
                  currentPage === pageNum ? 'bg-blue-600' : 'bg-gray-800'
                }`}
              >
                {pageNum}
              </button>
            );
          }
          return null;
        })}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 bg-gray-800 rounded-r-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
