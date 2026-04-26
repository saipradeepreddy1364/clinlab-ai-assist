import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { sendLocalNotification, registerForPushNotificationsAsync } from './notifications';

export const useRealtimeNotifications = () => {
  useEffect(() => {
    // 1. Register for notifications
    registerForPushNotificationsAsync();

    // 2. Subscribe to Supabase Realtime for the 'cases' table
    const channel = supabase
      .channel('global-case-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cases',
        },
        (payload) => {
          const newCase = payload.new;
          sendLocalNotification(
            'New Case Assigned!',
            `Case #${newCase.id}: ${newCase.patient_name || 'New Patient'} requires attention.`,
            { caseId: newCase.id }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
          filter: 'status=eq.Urgent',
        },
        (payload) => {
          const updatedCase = payload.new;
          sendLocalNotification(
            '🚨 URGENT UPDATE',
            `Case #${updatedCase.id} has been marked as URGENT!`,
            { caseId: updatedCase.id }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
