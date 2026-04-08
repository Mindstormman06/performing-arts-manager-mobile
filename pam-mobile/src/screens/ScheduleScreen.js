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

    const fetchSchedule = async () => {
        try {
            setError('');
            const response = await apiService.getPersonalSchedule();

            setSchedules(response.data || []);
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
        const eventContextName = item.Show?.title || item.Organization?.name || 'General Event';
        const eventDate = new Date(item.start_time).toLocaleString();

        return (
            <View className="mb-3">
                <Card mode="elevated">
                    <Card.Content>
                        <Text className="mb-1 text-lg font-bold text-gray-900">
                            {eventContextName}
                        </Text>
                        <Text className="text-base text-gray-700">
                            Start Time: {eventDate}
                        </Text>
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
                    keyExtractor={(item) => item.id.toString()}
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
