import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, Text } from 'react-native';
import { Card, ActivityIndicator, Appbar } from 'react-native-paper';

import { apiService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function ScheduleScreen() {
    const { logout } = useContext(AuthContext);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

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

        return [];
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

    const getEventContextText = (event) => {
        const showName = event?.Show?.title
            || event?.show?.title
            || event?.show_title
            || event?.showName;

        if (showName) {
            return showName;
        }

        const orgName = event?.Organization?.name;
        if (orgName) {
            return `Org Event: ${orgName}`;
        }

        return 'General Event';
    };

    const fetchSchedule = async () => {
        try {
            setError('');
            const response = await apiService.getPersonalSchedule();

            setSchedules(normalizeArray(response));
        } catch (err) {
            setError(err.message || 'Could not load schedule');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSchedule();
    };

    const renderItem = ({ item }) => {
        const eventTitle = item.title || 'Untitled event';
        const eventDate = formatDateTime(item.start_time);
        const eventLocation = item.location || item.venue || '';
        const eventContextText = getEventContextText(item);

        return (
            <View className="mb-3">
                <Card mode="elevated">
                    <Card.Content>
                        <Text className="font-semibold text-gray-900">{eventTitle}</Text>
                        <Text className="text-sm text-gray-700">{eventDate}</Text>
                        {eventLocation ? <Text className="text-sm text-gray-700">{eventLocation}</Text> : null}
                        <Text className="mt-1 text-sm font-semibold text-blue-700">{eventContextText}</Text>
                    </Card.Content>
                </Card>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-100">
            {/* Top Navigation Bar */}
            <Appbar.Header elevated>
                <Appbar.Content title="My Schedule" />
                {/* Triggers the context logout, instantly kicking them back to the Login screen */}
                <Appbar.Action icon="logout" onPress={logout} />
            </Appbar.Header>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator animating={true} size="large" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-center text-base text-red-600">
                        {error}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={schedules}
                    keyExtractor={(item, index) => (item.id ? item.id.toString() : `event-${index}`)}
                    renderItem={renderItem}
                    contentContainerClassName="p-4"
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <Text className="mt-10 text-center text-base text-gray-500">
                            You have no scheduled events.
                        </Text>
                    }
                />
            )}
        </View>
    );
}
