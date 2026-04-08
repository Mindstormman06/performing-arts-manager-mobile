import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import LandingScreen from '../screens/LandingScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ShowDashboardScreen from '../screens/ShowDashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (user) {
        return (
            <NavigationContainer>
                <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false }}>
                    <Stack.Screen id="landing-screen" name="Landing" component={LandingScreen} />
                    <Stack.Screen id="schedule-screen" name="Schedule" component={ScheduleScreen} />
                    <Stack.Screen id="show-dashboard-screen" name="ShowDashboard" component={ShowDashboardScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false }}>
                <Stack.Screen id="login-screen" name="Login" component={LoginScreen} />
                <Stack.Screen id="signup-screen" name="Signup" component={SignupScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}