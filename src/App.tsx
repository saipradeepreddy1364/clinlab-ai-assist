import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthWrapper } from "@/components/AuthWrapper";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import DoctorLogin from "./pages/DoctorLogin";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import OrgDashboard from "./pages/OrgDashboard";
import OrgCases from "./pages/OrgCases";
import OrgReports from "./pages/OrgReports";
import NewCase from "./pages/NewCase";
import AIEngine from "./pages/AIEngine";
import LabRequisition from "./pages/LabRequisition";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Uploads from "./pages/Uploads";
import ApprovalCenter from "./pages/ApprovalCenter";
import NotFound from "./pages/NotFound";

import { useRealtimeNotifications } from "./lib/useRealtimeNotifications";

const Stack = createStackNavigator();
const queryClient = new QueryClient();

const App = () => {
  const [isBooting, setIsBooting] = useState(true);
  useRealtimeNotifications();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 2000); // Show splash for 2 seconds on every refresh
    return () => clearTimeout(timer);
  }, []);

  if (isBooting) {
    return <SplashScreen />;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
          <AuthWrapper>
            <NavigationContainer>
              <StatusBar style="auto" />
              <Stack.Navigator 
                initialRouteName="SplashScreen"
                screenOptions={{
                  headerShown: false,
                }}
              >
                {/* Entry / Splash */}
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                
                {/* Public Routes */}
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="DoctorLogin" component={DoctorLogin} />
                <Stack.Screen name="Signup" component={Signup} />
                
                {/* Authenticated Routes */}
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="OrgDashboard" component={OrgDashboard} />
                <Stack.Screen name="OrgCases" component={OrgCases} />
                <Stack.Screen name="OrgReports" component={OrgReports} />
                <Stack.Screen name="NewCase" component={NewCase} />
                <Stack.Screen name="AIEngine" component={AIEngine} />
                <Stack.Screen name="LabRequisition" component={LabRequisition} />
                <Stack.Screen name="Patients" component={Patients} />
                <Stack.Screen name="PatientDetail" component={PatientDetail} />
                <Stack.Screen name="Uploads" component={Uploads} />
                <Stack.Screen name="ApprovalCenter" component={ApprovalCenter} />
                <Stack.Screen name="NotFound" component={NotFound} />
              </Stack.Navigator>
            </NavigationContainer>
          </AuthWrapper>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
