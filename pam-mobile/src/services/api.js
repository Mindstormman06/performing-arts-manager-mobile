import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://appdev.itas.ca:5006/api';

export const TOKEN_KEY = 'pam_secure_token';

const getAuthHeader = async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
  
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const normalizeArray = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    if (Array.isArray(payload?.results)) {
        return payload.results;
    }

    if (Array.isArray(payload?.rows)) {
        return payload.rows;
    }

    if (Array.isArray(payload?.payload)) {
        return payload.payload;
    }

    if (Array.isArray(payload?.payload?.data)) {
        return payload.payload.data;
    }

    return [];
};

const getOrganizationId = (org) => org?.id ?? org?.org_id ?? org?.orgId ?? org?.organization_id ?? org?.organizationId;
const getShowId = (show) => show?.id ?? show?.show_id ?? show?.showId;

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

    },

    async getMyOrganizations() {
        const headers = await getAuthHeader();

        const response = await fetch(`${BASE_URL}/orgs/my`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch organizations');
        }

        return data;
    },

    async getUserShows(orgId) {
        const headers = await getAuthHeader();
        const encodedOrgId = encodeURIComponent(orgId);

        const queryKeys = ['orgId', 'organizationId', 'org_id'];
        let lastError = null;

        for (const key of queryKeys) {
            const response = await fetch(`${BASE_URL}/shows/user?${key}=${encodedOrgId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            });

            const data = await response.json();

            if (response.ok) {
                return data;
            }

            lastError = new Error(data.message || 'Failed to fetch user shows');
        }

        throw lastError || new Error('Failed to fetch user shows');
    },

    async getShowDashboard(showId) {
        const headers = await getAuthHeader();
        const encodedShowId = encodeURIComponent(showId);

        const response = await fetch(`${BASE_URL}/shows/${encodedShowId}/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch show dashboard');
        }

        return data;
    },

    async getMyShowsAcrossOrganizations() {
        const organizationsResponse = await this.getMyOrganizations();
        const organizations = normalizeArray(organizationsResponse);
        const organizationIds = organizations
            .map(getOrganizationId)
            .filter((orgId) => orgId !== undefined && orgId !== null);

        if (organizationIds.length === 0) {
            return [];
        }

        const showResponses = await Promise.allSettled(
            organizationIds.map((orgId) => this.getUserShows(orgId))
        );

        const uniqueShows = new Map();

        showResponses.forEach((result) => {
            if (result.status !== 'fulfilled') {
                return;
            }

            normalizeArray(result.value).forEach((show) => {
                const key = getShowId(show) ?? `${show.title ?? 'untitled-show'}-${show.org_id ?? show.orgId ?? show.organization_id ?? show.organizationId ?? 'unknown-org'}`;
                if (!uniqueShows.has(key)) {
                    uniqueShows.set(key, show);
                }
            });
        });

        return Array.from(uniqueShows.values());
    }

}