import { useState, useEffect, useRef } from 'react';

const cache = new Map();

export const useCachedData = (key, fetchFn, ttl = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = async (forceRefresh = false) => {
    const cached = cache.get(key);
    const now = Date.now();

    // Use cache if available and not expired
    if (!forceRefresh && cached && (now - cached.timestamp) < ttl) {
      console.log(`📦 Using cached data for: ${key}`);
      if (isMounted.current) {
        setData(cached.data);
        setLoading(false);
      }
      return cached.data;
    }

    console.log(`🔄 Fetching fresh data for: ${key}`);
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      if (isMounted.current) {
        setData(result);
        setLoading(false);
      }
      cache.set(key, { data: result, timestamp: Date.now() });
      return result;
    } catch (err) {
      if (isMounted.current) {
        setError(err);
        setLoading(false);
      }
      throw err;
    }
  };

  // Force refresh (ignore cache)
  const refresh = () => fetchData(true);

  return { data, loading, error, refresh, fetchData };
};

// Clear specific cache or all cache
export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};