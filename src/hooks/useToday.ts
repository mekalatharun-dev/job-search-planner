import { useEffect, useState } from 'react';
import { todayISO } from '@/lib/dates';

/** Today's date, refreshed every minute and when you come back to the tab (so it rolls over at midnight). */
export function useToday(): string {
  const [today, setToday] = useState(todayISO);
  useEffect(() => {
    const update = () => setToday(todayISO());
    const timer = window.setInterval(update, 60_000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return today;
}
