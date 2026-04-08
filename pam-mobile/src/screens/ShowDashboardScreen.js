import React from 'react';
import { View, Text } from 'react-native';
import { Appbar, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ShowDashboardScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const { showTitle = 'Show Dashboard', showId } = route.params || {};

    return (
        <View className="flex-1 bg-gray-100">
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={showTitle} />
            </Appbar.Header>

            <View className="p-4">
                <Card mode="elevated">
                    <Card.Content>
                        <Text className="mb-2 text-lg font-bold text-gray-900">{showTitle}</Text>
                        <Text className="text-base text-gray-700">
                            Show dashboard placeholder{showId ? ` (ID: ${showId})` : ''}.
                        </Text>
                    </Card.Content>
                </Card>
            </View>
        </View>
    );
}

