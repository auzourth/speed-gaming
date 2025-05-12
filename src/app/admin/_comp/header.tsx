'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { signOut } from '@/lib/supabase';

export default function AdminHeader() {
  const router = useRouter();
  const { isAdmin } = useAppContext();

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, router]);

  const handleLogout = async () => {
    try {
      // Use Supabase signOut function instead of localStorage
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className=" bg-gray-900 text-white">
      <nav className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-xl font-bold">
            Admin Panel
          </Link>

          <div className="flex items-center space-x-4">
            {isAdmin ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/admin/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
