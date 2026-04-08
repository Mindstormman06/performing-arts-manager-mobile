import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { Appbar, Card, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { apiService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function LandingScreen() {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);

    const [schedules, setSchedules] = useState([]);
    const [myShows, setMyShows] = useState([]);
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

    const getShowId = (show) => show?.id ?? show?.show_id ?? show?.showId;
    const getShowTitle = (show) => show?.title ?? show?.name ?? 'Untitled Show';

    const getShowsFromSchedule = (scheduleItems) => {
        const uniqueShows = new Map();

        scheduleItems.forEach((event) => {
            const show = event?.Show;
            const showId = getShowId(show);
            const showTitle = getShowTitle(show);

            if (!show || (!showId && !showTitle)) {
                return;
            }

            const key = showId ?? showTitle;
            if (!uniqueShows.has(key)) {
                uniqueShows.set(key, show);
            }
        });

        return Array.from(uniqueShows.values());
    };

    const fetchSchedule = async () => {
        try {
            setError('');
            const [scheduleResult, showsResult] = await Promise.allSettled([
                apiService.getPersonalSchedule(),
                apiService.getMyShowsAcrossOrganizations(),
            ]);

            const scheduleItems = scheduleResult.status === 'fulfilled'
                ? normalizeArray(scheduleResult.value)
                : [];

            if (scheduleResult.status === 'rejected') {
                throw scheduleResult.reason;
            }

            const showsFromApi = showsResult.status === 'fulfilled'
                ? normalizeArray(showsResult.value)
                : [];

            setSchedules(scheduleItems);
            setMyShows(showsFromApi.length > 0 ? showsFromApi : getShowsFromSchedule(scheduleItems));
        } catch (err) {
            setError(err.message || 'Could not load schedule preview');
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

    const upcomingEvents = useMemo(() => {
        const now = new Date();

        return schedules
            .filter((event) => {
                const start = new Date(event.start_time);
                return !Number.isNaN(start.getTime()) && start >= now;
            })
            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
            .slice(0, 3);
    }, [schedules]);

    const sortedShows = useMemo(() => {
        return [...myShows].sort((a, b) => {
            const left = getShowTitle(a);
            const right = getShowTitle(b);
            return left.localeCompare(right);
        });
    }, [myShows]);

    const renderEventItem = ({ item }) => {
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

    const renderShowItem = ({ item }) => {
        const showId = getShowId(item);
        const showTitle = getShowTitle(item);
        const showDescription = item.description || 'Open show dashboard';

        return (
            <View className="mb-3">
                <Card mode="elevated" onPress={() => navigation.navigate('ShowDashboard', { showId, showTitle })}>
                    <Card.Content>
                        <Text className="mb-1 text-lg font-bold text-gray-900">{showTitle}</Text>
                        <Text className="text-base text-gray-700">{showDescription}</Text>
                    </Card.Content>
                </Card>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-100">
            <Appbar.Header elevated>
                <Appbar.Content title="Home" />
                <Appbar.Action icon="logout" onPress={logout} />
            </Appbar.Header>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator animating={true} size="large" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-center text-base text-red-600">{error}</Text>
                </View>
            ) : (
                <View className="flex-1 px-4 pt-4 pb-6">
                    <View style={{ flex: 1 }}>
                        <Text className="mb-2 text-lg font-semibold text-gray-900">Upcoming Events</Text>
                        <FlatList
                            data={upcomingEvents}
                            keyExtractor={(item, index) => (item.id ? item.id.toString() : `event-${index}`)}
                            renderItem={renderEventItem}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                <Text className="mt-4 text-base text-gray-500">
                                    No upcoming events in your schedule.
                                </Text>
                            }
                        />
                    </View>

                    <Button className="mb-4" mode="contained" onPress={() => navigation.navigate('Schedule')}>
                        Go to Full Schedule
                    </Button>

                    <View style={{ flex: 2 }}>
                        <Text className="mb-2 text-lg font-semibold text-gray-900">My Shows</Text>
                        <FlatList
                            data={sortedShows}
                            keyExtractor={(item, index) => {
                                const showId = getShowId(item);
                                const showTitle = getShowTitle(item);
                                return showId ? showId.toString() : `${showTitle}-${index}`;
                            }}
                            renderItem={renderShowItem}
                            onRefresh={onRefresh}
                            refreshing={refreshing}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text className="mt-4 text-base text-gray-500">
                                    You are not assigned to any shows yet.
                                </Text>
                            }
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

