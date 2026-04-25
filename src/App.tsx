import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider } from "@/components/ThemeProvider";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NewCase from "./pages/NewCase";
import AIEngine from "./pages/AIEngine";
import LabRequisition from "./pages/LabRequisition";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Uploads from "./pages/Uploads";
import NotFound from "./pages/NotFound";

import { useRealtimeNotifications } from "./lib/useRealtimeNotifications";

const Stack = createStackNavigator();
const queryClient = new QueryClient();

const App = () => {
  useRealtimeNotifications();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
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
              <Stack.Screen name="Signup" component={Signup} />
              
              {/* Authenticated Routes */}
              <Stack.Screen name="Dashboard" component={Dashboard} />
              <Stack.Screen name="NewCase" component={NewCase} />
              <Stack.Screen name="AIEngine" component={AIEngine} />
              <Stack.Screen name="LabRequisition" component={LabRequisition} />
              <Stack.Screen name="Patients" component={Patients} />
              <Stack.Screen name="PatientDetail" component={PatientDetail} />
              <Stack.Screen name="Uploads" component={Uploads} />
              <Stack.Screen name="NotFound" component={NotFound} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
