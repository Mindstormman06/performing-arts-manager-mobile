import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, Appbar, HelperText } from 'react-native-paper';

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
            <Card style={styles.card} mode="elevated">
                <Card.Content>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                        {eventContextName}
                    </Text>
                    <Text variant="bodyMedium">
                        Start Time: {eventDate}
                    </Text>
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            {/* Top Navigation Bar */}
            <Appbar.Header elevated>
                <Appbar.Content title="My Schedule" />
                {/* Triggers the context logout, instantly kicking them back to the Login screen */}
                <Appbar.Action icon="logout" onPress={logout} />
            </Appbar.Header>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator animating={true} size="large" />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <HelperText type="error" visible={true} style={styles.errorText}>
                        {error}
                    </HelperText>
                </View>
            ) : (
                <FlatList
                    data={schedules}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>You have no scheduled events.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    cardTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#666',
        fontSize: 16,
    },
});