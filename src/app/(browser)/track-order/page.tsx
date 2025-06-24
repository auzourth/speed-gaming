'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import InputField from '@/components/ui/InputField';
import OrderStepper from '@/components/ui/OrderStepper';

export default function TrackOrder() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [showFAQ, setShowFAQ] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter a redemption code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if the code exists in Supabase
      const { data, error: searchError } = await supabase
        .from('cheap-play-zone')
        .select('*')
        .eq('code', code.trim())
        .single();

      if (searchError || !data) {
        setError('Order not found. Please check your code and try again.');
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to find order. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  // Parse the JSON data safely
  const parseStepData = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return { status: 'null', timestamp: Date.now() }; // Default step if parsing fails
    }
  };

  // Create steps array for OrderStepper
  const getStepsData = () => {
    if (!order) return [];

    return [
      parseStepData(order.pending),
      parseStepData(order.processing),
      parseStepData(order.completed),
    ];
  };

  return (
    <div className="min-h-screen text-white">
      {/* Main Content */}
      <main className="bg-gray-800 max-w-4xl mx-auto px-6 py-12 my-12">
        <h2 className="text-3xl font-bold mb-8">Check Your Order Status</h2>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex items-end gap-4 mb-8">
          <InputField
            label="Enter Redemption Code"
            value={code}
            onChange={setCode}
            className="flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-[#f2951d] hover:bg-orange-400 text-white font-medium px-8 py-3 rounded-md transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-md mb-8">
            {error}
          </div>
        )}

        {/* Order Information */}
        {order && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-6">Order Information</h3>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <div>
                <span className="text-gray-400">Game Email: </span>
                <span className="text-white">{order?.email}</span>
              </div>
              <div>
                <span className="text-gray-400">Game Password: </span>
                <span className="text-white">{order.code}</span>
              </div>
              <div>
                <span className="text-gray-400">Guide: </span>
                <span className="text-white">{order.loginInfo}</span>
              </div>
            </div>

            {/* Order Stepper */}
            <OrderStepper steps={getStepsData()} />
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <button
            onClick={() => setShowFAQ(!showFAQ)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-medium">
              How To open a case in kinguin?
            </h3>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                showFAQ ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showFAQ && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-300">
                To open a case in Kinguin, please follow these steps:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-300">
                <li>Log into your Kinguin account</li>
                <li>Navigate to your order history</li>
                <li>Find the relevant order and click "Report Problem"</li>
                <li>Select the appropriate issue category</li>
                <li>Provide detailed information about your problem</li>
                <li>Submit the case and wait for support response</li>
              </ol>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
