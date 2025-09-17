'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GoogleCallback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage(
        {
          type: 'OAUTH_ERROR',
          error: error,
        },
        window.location.origin
      );
      window.close();
      return;
    }

    if (code) {
      // Send success to parent window
      window.opener?.postMessage(
        {
          type: 'OAUTH_SUCCESS',
          code: code,
        },
        window.location.origin
      );
      window.close();
    }
  }, [searchParams]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-2 text-gray-600'>Completing Google login...</p>
      </div>
    </div>
  );
}
