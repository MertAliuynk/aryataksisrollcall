'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/staff/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Çalışan paneline yönlendiriliyor...</p>
      </div>
    </div>
  );
}
