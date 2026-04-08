import React, { useState, useContext } from 'react';
import { View, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await login(email, password);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-100"
        >
            <View className="flex-1 justify-center px-5">
                <Text className="mb-10 text-center text-4xl font-bold text-gray-800">
                    Performing Arts Manager
                </Text>

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
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                    >
                        Login
                    </Button>
                </View>

                <View className="mt-3">
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Signup')}
                    >
                        Don't have an account? Sign up
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}
