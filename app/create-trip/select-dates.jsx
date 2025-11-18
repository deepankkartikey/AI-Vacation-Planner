import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { CreateTripContext } from '../../context/CreateTripContext';

export default function SelectDates() {
 
    const navigation = useNavigation();
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [markedDates, setMarkedDates] = useState({});
    const { tripData, setTripData } = useContext(CreateTripContext);
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTransparent: true,
            headerTitle: ''
        })
    }, [])
    
    const showMessage = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.LONG);
        } else {
            Alert.alert('Date Selection', message);
        }
    };

    const onDayPress = (day) => {
        const selectedDate = moment(day.dateString);
        
        if (!startDate || (startDate && endDate)) {
            // First selection or reset selection
            setStartDate(selectedDate);
            setEndDate(null);
            setMarkedDates({
                [day.dateString]: {
                    selected: true,
                    startingDay: true,
                    endingDay: true,
                    color: Colors.PRIMARY
                }
            });
        } else {
            // Second selection
            if (selectedDate.isBefore(startDate)) {
                // Selected date is before start date, make it the new start
                setEndDate(startDate);
                setStartDate(selectedDate);
            } else {
                // Normal case: end date after start date
                setEndDate(selectedDate);
            }
            
            // Calculate range and mark dates
            const start = selectedDate.isBefore(startDate) ? selectedDate : startDate;
            const end = selectedDate.isBefore(startDate) ? startDate : selectedDate;
            
            // Check if range is within limit (5 days)
            const daysDiff = end.diff(start, 'days');
            if (daysDiff > 5) {
                showMessage('Maximum trip duration is 5 days');
                return;
            }
            
            // Create marked dates for range
            const range = {};
            let current = start.clone();
            
            while (current.isSameOrBefore(end)) {
                const dateString = current.format('YYYY-MM-DD');
                
                if (current.isSame(start, 'day') && current.isSame(end, 'day')) {
                    // Single day selection
                    range[dateString] = {
                        selected: true,
                        startingDay: true,
                        endingDay: true,
                        color: Colors.PRIMARY
                    };
                } else if (current.isSame(start, 'day')) {
                    // Start day
                    range[dateString] = {
                        selected: true,
                        startingDay: true,
                        color: Colors.PRIMARY,
                        textColor: Colors.WHITE
                    };
                } else if (current.isSame(end, 'day')) {
                    // End day
                    range[dateString] = {
                        selected: true,
                        endingDay: true,
                        color: Colors.PRIMARY,
                        textColor: Colors.WHITE
                    };
                } else {
                    // Days in between
                    range[dateString] = {
                        selected: true,
                        color: Colors.LIGHT_BLUE,
                        textColor: Colors.PRIMARY
                    };
                }
                
                current.add(1, 'day');
            }
            
            setMarkedDates(range);
        }
    };

    const OnDateSelectionContinue = () => {
        if (!startDate || !endDate) {
            showMessage('Please select start and end dates');
            return;
        }

        const totalNoOfDays = endDate.diff(startDate, 'days') + 1;
        console.log(totalNoOfDays);

        setTripData({
            ...tripData,
            startDate: startDate,
            endDate: endDate,
            totalNoOfDays: totalNoOfDays
        });

        router.push('/create-trip/select-budget');
    }

    return (
        <View
            style={{
                padding: 25,
                paddingTop: 75,
                backgroundColor: Colors.WHITE,
                height: '100%'
            }}
        >
            <Text style={{
                fontFamily: 'outfit-bold',
                fontSize: 35,
                marginTop: 20
            }}>Travel Dates</Text>

            <Text style={{
                fontFamily: 'outfit',
                fontSize: 16,
                color: Colors.GRAY,
                marginTop: 10
            }}>
                {startDate && !endDate && 'Select end date'}
                {startDate && endDate && `${startDate.format('MMM DD')} - ${endDate.format('MMM DD, YYYY')}`}
                {!startDate && 'Select your travel dates'}
            </Text>

            <View style={{
                marginTop: 30
            }}>
                <Calendar
                    onDayPress={onDayPress}
                    markingType={'period'}
                    markedDates={markedDates}
                    minDate={new Date().toISOString().split('T')[0]}
                    theme={{
                        backgroundColor: Colors.WHITE,
                        calendarBackground: Colors.WHITE,
                        textSectionTitleColor: Colors.PRIMARY,
                        selectedDayBackgroundColor: Colors.PRIMARY,
                        selectedDayTextColor: Colors.WHITE,
                        todayTextColor: Colors.PRIMARY,
                        dayTextColor: Colors.PRIMARY,
                        textDisabledColor: Colors.GRAY,
                        dotColor: Colors.PRIMARY,
                        selectedDotColor: Colors.WHITE,
                        arrowColor: Colors.PRIMARY,
                        monthTextColor: Colors.PRIMARY,
                        textDayFontFamily: 'outfit',
                        textMonthFontFamily: 'outfit-bold',
                        textDayHeaderFontFamily: 'outfit-medium',
                        textMonthFontSize: 18,
                        textDayFontSize: 16,
                        textDayHeaderFontSize: 14
                    }}
                />
            </View>

            <TouchableOpacity 
                onPress={OnDateSelectionContinue}
                style={{
                    padding: 15,
                    backgroundColor: Colors.PRIMARY,
                    borderRadius: 15,
                    marginTop: 35,
                    opacity: (startDate && endDate) ? 1 : 0.5
                }}
                disabled={!startDate || !endDate}
            >
                <Text style={{
                    textAlign: 'center',
                    color: Colors.WHITE,
                    fontFamily: 'outfit-medium',
                    fontSize: 20
                }}>Continue</Text>
            </TouchableOpacity>
        </View>
    )
}