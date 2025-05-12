'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Redeem() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeExists, setCodeExists] = useState(true);

  useLayoutEffect(() => {
    // fetch order from Supabase
    const fetchOrder = async () => {
      const { data: ordersData } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('code', code)
        .single();
      if (ordersData) {
        setOrderId(ordersData.id);
        setEmail(ordersData.email);
      }
    };
    fetchOrder();
  }, [code]);

  // Get code from URL params if present
  useEffect(() => {
    // From path params - params.id is the code from the URL path
    if (params?.id) {
      setCode(params.id as string);
      checkCodeExists(params.id as string);
    }

    // From query params (fallback)
    const codeParam = searchParams.get('code');
    if (codeParam && !params?.id) {
      setCode(codeParam);
      checkCodeExists(codeParam);
    }
  }, [params, searchParams]);

  // Check if the code exists in Supabase
  const checkCodeExists = async (codeToCheck: string) => {
    try {
      const { data, error } = await supabase
        .from('cheap-play-zone')
        .select('id, status')
        .eq('code', codeToCheck)
        .single();

      if (error) {
        console.error('Error checking code:', error);
        setCodeExists(false);
        return;
      }

      // If the code has already been redeemed (not pending), show error
      if (data && data.status === 'delivered') {
        setError('This code has already been redeemed.');
        return;
      }

      setCodeExists(!!data);
    } catch (err) {
      console.error('Exception when checking code:', err);
      setCodeExists(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId || !email || !code) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if code exists in Supabase
      const { data: existingOrder, error: checkError } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('code', code)
        .single();

      console.log('Existing order:', existingOrder);

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = not found
        throw new Error('Failed to check code. Please try again.');
      }

      if (!existingOrder) {
        setError('Invalid redemption code. Please check and try again.');
        setLoading(false);
        return;
      }

      if (existingOrder.status === 'delivered') {
        setError('This code has already been redeemed.');
        setLoading(false);
        return;
      }

      // Update the existing order with user information
      const { error: updateError } = await supabase
        .from('cheap-play-zone')
        .update({
          email,
          updated_at: new Date().toISOString(),
        })
        .eq('code', code);

      if (updateError) {
        throw updateError;
      }

      // Redirect to confirmation page
      router.push('/redeem/confirmation');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Please try again.';
      setError('Failed to redeem code: ' + errorMessage);
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </Link>

      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          REDEEM YOUR CODE:
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {!codeExists && !error && code && (
          <div className="bg-yellow-900/50 border border-yellow-500 text-white p-3 rounded mb-4">
            This redemption code doesn&apos;t exist. Please check your code.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">YOUR ORDER ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID..."
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">YOUR EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 mb-2">YOUR REDEEM CODE</label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const newCode = e.target.value;
                setCode(newCode);
                if (newCode.length > 8) {
                  checkCodeExists(newCode);
                }
              }}
              placeholder="Enter your redeem code..."
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !codeExists}
            className={`w-full bg-white text-black font-bold py-3 px-4 rounded-full transition-colors ${
              loading || !codeExists
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-200'
            }`}
          >
            {loading ? 'Processing...' : 'Redeem'}
          </button>
        </form>
      </div>
    </div>
  );
}
