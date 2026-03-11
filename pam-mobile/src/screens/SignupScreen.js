import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';

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
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text variant="displaySmall" style={styles.title}>
                    Create Account
                </Text>

                <TextInput
                    label="First Name"
                    value={fname}
                    onChangeText={setFname}
                    mode="outlined"
                    style={styles.input}
                />

                <TextInput
                    label="Last Name"
                    value={lname}
                    onChangeText={setLname}
                    mode="outlined"
                    style={styles.input}
                />

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                />

                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                />

                <HelperText type="error" visible={!!error}>
                    {error}
                </HelperText>

                <Button
                    mode="contained"
                    onPress={handleSignup}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Sign Up
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.linkButton}
                >
                    Already have an account? Log in
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 10,
        paddingVertical: 5,
    },
    linkButton: {
        marginTop: 15,
    },
});