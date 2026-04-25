import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useNotifications = () => {
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to changes in the cases table
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cases',
            filter: `doctor_id=eq.${user.id}`,
          },
          (payload) => {
            const newCase = payload.new as any;
            const oldCase = payload.old as any;

            // Notify if a case is urgent or status changes to pending/in-progress
            if (payload.eventType === 'INSERT' && (newCase.is_urgent || newCase.status === 'in-progress' || newCase.status === 'pending')) {
              showNotification(`New Case Alert: ${newCase.patient_name}`, {
                body: `Tooth ${newCase.tooth_number}: ${newCase.diagnosis}`,
                icon: '/favicon.ico'
              });
            } else if (payload.eventType === 'UPDATE' && newCase.status !== oldCase.status) {
              showNotification(`Case Update: ${newCase.patient_name}`, {
                body: `Status changed to ${newCase.status}`,
                icon: '/favicon.ico'
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, []);

  const showNotification = (title: string, options?: NotificationOptions) => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
    
    // In-app toast
    toast(title, {
      description: options?.body,
    });
  };

  return { showNotification };
};
