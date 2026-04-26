import { useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
// import * as Notifications from 'expo-notifications'; // Assume expo-notifications or similar

export const useNotifications = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      // In a real Expo app, we'd request permissions here
      // const { status: existingStatus } = await Notifications.getPermissionsAsync();
      // let finalStatus = existingStatus;
      // if (existingStatus !== 'granted') {
      //   const { status } = await Notifications.requestPermissionsAsync();
      //   finalStatus = status;
      // }
    };

    setupNotifications();

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('doctor-case-notifications-' + Date.now())
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

            if (payload.eventType === 'INSERT' && (newCase.is_urgent || newCase.status === 'in-progress' || newCase.status === 'pending')) {
              showNativeNotification(`New Case Alert: ${newCase.patient_name}`, {
                body: `Tooth ${newCase.tooth_number}: ${newCase.diagnosis}`,
              });
            } else if (payload.eventType === 'UPDATE' && newCase.status !== oldCase.status) {
              showNativeNotification(`Case Update: ${newCase.patient_name}`, {
                body: `Status changed to ${newCase.status}`,
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

  const showNativeNotification = async (title: string, options?: { body: string }) => {
    // This is where we'd call the native notification API
    // await Notifications.scheduleNotificationAsync({
    //   content: {
    //     title,
    //     body: options?.body,
    //     sound: true,
    //   },
    //   trigger: null,
    // });
    
    console.log("Push Notification:", title, options?.body);
  };

  return { showNativeNotification };
};
