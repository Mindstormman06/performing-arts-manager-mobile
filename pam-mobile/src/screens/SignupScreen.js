import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, Alert, Text } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';

import { apiService } from '../services/api';

export default function SignupScreen({ navigation }) {
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!fname || !lname || !email || !password) {
            setError('Please fill out all fields.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiService.signup({ fname, lname, email, password });

            Alert.alert("Success", "Account created successfully! Please log in.");

            navigation.navigate('Login');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-100"
        >
            <ScrollView
                className="flex-1"
                contentContainerClassName="flex-grow justify-center px-5 py-8"
            >
                <Text className="mb-8 text-center text-4xl font-bold text-gray-800">
                    Create Account
                </Text>

                <View className="mb-2">
                    <TextInput
                        label="First Name"
                        value={fname}
                        onChangeText={setFname}
                        mode="outlined"
                    />
                </View>

                <View className="mb-2">
                    <TextInput
                        label="Last Name"
                        value={lname}
                        onChangeText={setLname}
                        mode="outlined"
                    />
                </View>

                <View className="mb-2">
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View className="mb-2">
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        secureTextEntry
                    />
                </View>

                <HelperText type="error" visible={!!error}>
                    {error}
                </HelperText>

                <View className="mt-2">
                    <Button
                        mode="contained"
                        onPress={handleSignup}
                        loading={loading}
                        disabled={loading}
                    >
                        Sign Up
                    </Button>
                </View>

                <View className="mt-3">
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Login')}
                    >
                        Already have an account? Log in
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
