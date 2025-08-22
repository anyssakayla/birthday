import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import {
  HomeScreen,
  AddBirthdayScreen,
  BirthdayDetailScreen,
  EditContactScreen,
  SettingsScreen,
  CalendarScreen,
  AddNoteScreen,
  GiftPlanningScreen,
} from '@/screens';

// Define navigation param types
export type RootStackParamList = {
  Home: undefined;
  AddBirthday: undefined;
  BirthdayDetail: { birthdayId: string; initialTab?: 'notes' | 'gifts' | 'messages' };
  EditContact: { birthdayId: string };
  EditBirthday: { birthdayId: string };
  Settings: undefined;
  Calendar: undefined;
  AddNote: { birthdayId: string };
  GiftPlanning: { birthdayId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#e2e8f0',
          },
          headerTintColor: '#1a1d23',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 20,
          },
          headerBackTitle: '',
          headerLeftContainerStyle: {
            paddingLeft: 16,
          },
          headerRightContainerStyle: {
            paddingRight: 16,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            headerShown: false, // Custom header in HomeScreen
          }}
        />
        
        <Stack.Screen 
          name="AddBirthday" 
          component={AddBirthdayScreen}
          options={{
            title: 'Add Birthday',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen 
          name="BirthdayDetail" 
          component={BirthdayDetailScreen}
          options={{
            headerShown: false, // Custom header with gradient
          }}
        />
        
        <Stack.Screen 
          name="EditContact" 
          component={EditContactScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            headerShown: false,
          }}
        />
        
        <Stack.Screen 
          name="Calendar" 
          component={CalendarScreen}
          options={({ navigation }) => ({
            title: 'Calendar',
          })}
        />
        
        <Stack.Screen 
          name="AddNote" 
          component={AddNoteScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        
        <Stack.Screen 
          name="GiftPlanning" 
          component={GiftPlanningScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}