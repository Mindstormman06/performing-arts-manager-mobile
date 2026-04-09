import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Appbar, Card, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

import { apiService } from '../services/api';

export default function ShowDashboardScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const { showTitle = 'Show Dashboard', showId } = route.params || {};

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const normalizeArray = (value) => (Array.isArray(value) ? value : []);

    const getPayloadData = (payload) => {
        if (payload?.data) {
            return payload.data;
        }

        return payload || null;
    };

    const formatDateTime = (value) => {
        if (!value) {
            return 'TBD';
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return 'TBD';
        }

        return parsed.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const fetchDashboard = useCallback(async () => {
        if (!showId) {
            setError('No show selected. Please choose a show from Home.');
            setLoading(false);
            return;
        }

        try {
            setError('');
            const response = await apiService.getShowDashboard(showId);
            const data = getPayloadData(response);
            const viewer = data?.viewer || {};

            setDashboard({
                show: data,
                roles: normalizeArray(viewer?.membership?.roles),
                casting: normalizeArray(viewer?.casting),
                schedule: normalizeArray(viewer?.schedule),
                inventory: normalizeArray(viewer?.inventory),
            });
        } catch (err) {
            setError(err.message || 'Could not load show dashboard');
        } finally {
            setLoading(false);
        }
    }, [showId]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const renderSectionTitle = (title) => (
        <Text className="mb-2 text-base font-semibold text-gray-900">{title}</Text>
    );

    const renderEmpty = (message) => (
        <Text className="text-sm text-gray-500">{message}</Text>
    );

    return (
        <View className="flex-1 bg-gray-100">
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={showTitle} />
            </Appbar.Header>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator animating size="large" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="mb-4 text-center text-base text-red-600">{error}</Text>
                    <Button mode="contained" onPress={fetchDashboard}>Retry</Button>
                </View>
            ) : (
                <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
                    <Card mode="elevated" className="mb-4">
                        <Card.Content>
                            <Text className="mb-1 text-lg font-bold text-gray-900">
                                {dashboard?.show?.title || showTitle}
                            </Text>
                            <Text className="text-sm text-gray-700">Show ID: {showId}</Text>
                        </Card.Content>
                    </Card>

                    <Card mode="elevated" className="mb-4">
                        <Card.Content>
                            {renderSectionTitle('My Roles')}
                            {dashboard?.roles?.length > 0
                                ? <Text className="text-sm text-gray-700">{dashboard.roles.join(', ')}</Text>
                                : renderEmpty('No show roles assigned yet.')}
                        </Card.Content>
                    </Card>

                    <Card mode="elevated" className="mb-4">
                        <Card.Content>
                            {renderSectionTitle('My Casting')}
                            {dashboard?.casting?.length > 0
                                ? dashboard.casting.map((character) => (
                                    <Text key={character.id} className="mb-1 text-sm text-gray-700">
                                        {character.name}
                                    </Text>
                                ))
                                : renderEmpty('No character assignments for this show.')}
                        </Card.Content>
                    </Card>

                    <Card mode="elevated" className="mb-4">
                        <Card.Content>
                            {renderSectionTitle('My Upcoming Calls')}
                            {dashboard?.schedule?.length > 0
                                ? dashboard.schedule.map((event) => (
                                    <View key={event.id} className="mb-3">
                                        <Text className="font-semibold text-gray-900">{event.title || 'Untitled event'}</Text>
                                        <Text className="text-sm text-gray-700">{formatDateTime(event.start_time)}</Text>
                                        {event.location ? (
                                            <Text className="text-sm text-gray-700">{event.location}</Text>
                                        ) : null}
                                    </View>
                                ))
                                : renderEmpty('No upcoming show events assigned to you.')}
                        </Card.Content>
                    </Card>

                    <Card mode="elevated">
                        <Card.Content>
                            {renderSectionTitle('My Assigned Inventory')}
                            {dashboard?.inventory?.length > 0
                                ? dashboard.inventory.map((item) => (
                                    <View key={item.id} className="mb-3">
                                        <Text className="font-semibold text-gray-900">{item.name || 'Unnamed item'}</Text>
                                        <Text className="text-sm text-gray-700">
                                            Dept: {item.Department?.name || 'Unassigned'}
                                        </Text>
                                        {item.assignedCharacter?.name ? (
                                            <Text className="text-sm text-gray-700">
                                                Character: {item.assignedCharacter.name}
                                            </Text>
                                        ) : null}
                                    </View>
                                ))
                                : renderEmpty('No inventory currently assigned.')}
                        </Card.Content>
                    </Card>
                </ScrollView>
            )}
        </View>
    );
}
