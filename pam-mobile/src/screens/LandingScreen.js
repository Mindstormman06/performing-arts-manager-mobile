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

    const renderEventItem = ({ item }) => {
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
                <FlatList
                    data={sortedShows}
                    keyExtractor={(item, index) => {
                        const showId = getShowId(item);
                        const showTitle = getShowTitle(item);
                        return showId ? showId.toString() : `${showTitle}-${index}`;
                    }}
                    renderItem={renderShowItem}
                    contentContainerClassName="px-4 pt-4 pb-6"
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={(
                        <View>
                            <Text className="mb-2 text-lg font-semibold text-gray-900">Upcoming Events</Text>
                            {upcomingEvents.length > 0 ? upcomingEvents.map((item, index) => (
                                <React.Fragment key={item.id ? item.id.toString() : `upcoming-${index}`}>
                                    {renderEventItem({ item })}
                                </React.Fragment>
                            )) : (
                                <Text className="mt-1 mb-4 text-base text-gray-500">
                                    No upcoming events in your schedule.
                                </Text>
                            )}

                            <Button className="mb-4" mode="contained" onPress={() => navigation.navigate('Schedule')}>
                                Go to Full Schedule
                            </Button>

                            <Text className="mb-2 text-lg font-semibold text-gray-900">My Shows</Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text className="mt-2 text-base text-gray-500">
                            You are not assigned to any shows yet.
                        </Text>
                    }
                />
            )}
        </View>
    );
}
