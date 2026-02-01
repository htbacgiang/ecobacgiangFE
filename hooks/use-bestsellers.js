import { useState, useEffect } from 'react';

export const useBestsellers = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        setLoading(true);
        // Chỉ dùng Server API
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiBaseUrl}/orders/bestsellers`);
        if (!response.ok) {
          throw new Error('Failed to fetch bestsellers');
        }
        const data = await response.json();
        setBestsellers(data);
      } catch (err) {
        console.error('Error fetching bestsellers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  return { bestsellers, loading, error };
};
