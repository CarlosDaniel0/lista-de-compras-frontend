import { useEffect, useRef } from 'react';

export const useMounted = () => {
  const isMouted = useRef(false);

  useEffect(() => {
    isMouted.current = true;
  }, []);

  return isMouted.current;
};
