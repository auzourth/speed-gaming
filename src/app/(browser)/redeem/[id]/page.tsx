'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import InputField from '@/components/ui/InputField';
import { parseStepData } from '../../../../lib/helper';

// Notification component
const Notification = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 flex items-center p-4 rounded-lg shadow-lg transition-all transform duration-500 z-50 ${
        type === 'success'
          ? 'bg-green-900/80 border border-green-500'
          : 'bg-red-900/80 border border-red-500'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={20} className="text-green-400 mr-2" />
      ) : (
        <XCircle size={20} className="text-red-400 mr-2" />
      )}
      <span className="text-white">{message}</span>
      <button onClick={onClose} className="ml-4 text-gray-300 hover:text-white">
        &times;
      </button>
    </div>
  );
};

export default function Redeem() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeExists, setCodeExists] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Helper function to show notifications
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  // Helper function to clear notifications
  const clearNotification = () => {
    setNotification(null);
  };

  useLayoutEffect(() => {
    // fetch order from Supabase
    const fetchOrder = async () => {
      const { data: ordersData } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('code', code)
        .single();
      if (ordersData) {
        setOrder(ordersData);
        setOrderId(ordersData.id);
        setEmail(ordersData.email || '');
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
        setError('This code has already been redeemed. check track order page');
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

    // if (!acceptTerms) {
    //   setError('Please accept the terms to continue');
    //   return;
    // }

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
        setError('This code has already been redeemed. check track order page');
        setLoading(false);
        return;
      }

      // Update the existing order with user information and mark as redeemed
      const { error: updateError } = await supabase
        .from('cheap-play-zone')
        .update({
          email,
          updated_at: new Date().toISOString(),
          isRedeemed: true, // Mark the code as redeemed
          status: 'processing', // Update status to pending
          processing: JSON.stringify({
            ...parseStepData(order.processing || '{}'),
            status: 'completed',
            timestamp: new Date().toISOString(),
          }),
          completed: JSON.stringify({
            ...parseStepData(order.completed || '{}'),
            status: 'processing',
          }),
        })
        .eq('code', code);

      if (updateError) {
        throw updateError;
      }

      // Show success notification
      showNotification('Code successfully redeemed!', 'success');

      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        router.push('/redeem/confirmation');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Please try again.';
      setError('Failed to redeem code: ' + errorMessage);
      showNotification(`Failed to redeem: ${errorMessage}`, 'error');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      <Link
        href="/"
        className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </Link>

      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Redeem Your Game
        </h1>

        {/* Already Redeemed Warning */}
        {order && order.isRedeemed && (
          <div className="bg-orange-900/50 border border-orange-500 text-white p-4 rounded mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-2">Code Already Redeemed</h3>
                <p className="text-sm text-orange-200">
                  This redemption code has already been used. If you need to
                  track your order status, please visit the{' '}
                  <Link
                    href="/track-order"
                    className="text-orange-300 underline hover:text-orange-200"
                  >
                    track order page
                  </Link>
                  .
                </p>
                <p className="text-sm text-orange-200 mt-2">
                  If you believe this is an error, please contact our support
                  team.
                </p>
              </div>
            </div>
          </div>
        )}

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
          <InputField
            label="YOUR ORDER ID"
            value={orderId || ''}
            onChange={() => {}}
            placeholder="Enter your order ID..."
            className="mb-6"
            required
          />

          <InputField
            label="YOUR EMAIL"
            value={email}
            onChange={setEmail}
            placeholder="email@example.com"
            type="email"
            className="mb-6"
            required
          />

          <InputField
            label="YOUR REDEEM CODE"
            value={code}
            onChange={(newCode) => {
              setCode(newCode);
              if (newCode.length > 8) {
                checkCodeExists(newCode);
              }
            }}
            placeholder="Enter your redeem code..."
            className="mb-6"
            required
          />

          {/* Warning Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-yellow-800">
                <h3 className="font-medium text-sm mb-2">
                  Please Read Before Ordering
                </h3>
                <div className="text-xs space-y-2">
                  <p>
                    - The product you are purchasing is an{' '}
                    <strong>account</strong>. As mentioned in the product
                    description, delivery may take up to 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkbox */}
          {/* <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 text-white bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-300">
              I accept, I want to order
            </label>
          </div> */}

          <button
            type="submit"
            disabled={loading || !codeExists || order?.isRedeemed}
            className={`w-full bg-amber-500 font-bold py-3 px-4 rounded-lg transition-colors ${
              loading || !codeExists || order?.isRedeemed
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-amber-600'
            }`}
          >
            {loading ? 'Processing...' : 'Redeem'}
          </button>
        </form>
      </div>
    </div>
  );
}
