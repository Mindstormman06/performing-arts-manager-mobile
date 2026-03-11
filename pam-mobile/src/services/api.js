import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://appdev.itas.ca:5006/api';

export const TOKEN_KEY = 'pam_secure_token';

const getAuthHeader = async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
  
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const apiService = {

    async login(email, password) {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (data.token) {
            await SecureStore.setItemAsync(TOKEN_KEY, data.token);
        }

        return data;
    },

    async verifyToken() {
        const headers = await getAuthHeader();
        
        const response = await fetch(`${BASE_URL}/auth/verify`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Token invalid or expired');
        }

        return data;
    },

    async signup(userData) {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        return data;
    },

    async logout() {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    },

    async getPersonalSchedule() {
        const headers = await getAuthHeader();

        const response = await fetch(`${BASE_URL}/schedule/personal`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                ...headers,
            },
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch personal schedule');
        }

        return data;
    
    }

}