import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DayHeader = ({ selectedDate, onDateChange, goalKcal = 2560 }) => {
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => { 
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const formatDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (compareDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    
    // Format: "DD MMM" (ex: "27 Jan")
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  const isToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePreviousDay}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={18} color="#000" />
      </TouchableOpacity>

      <View style={{alignItems:"center", paddingHorizontal: 34}}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <View style={styles.goalContainer}>
          <Text style={styles.goalLabel}>Goal: </Text>
          <Text style={styles.goalValue}>{goalKcal}</Text>
          <Text style={styles.goalLabel}> Kcal</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[ isToday() && styles.arrowButtonDisabled]} 
        onPress={handleNextDay}
        activeOpacity={isToday() ? 1 : 0.7}
        disabled={isToday()}
      >
        <Ionicons 
          name="chevron-forward" 
          size={18} 
          color={isToday() ? '#ccc' : '#000'} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 42,
    backgroundColor: '#FFF',
    justifyContent:'center',
  },
  arrowButtonDisabled: {
    color:"#C7C7C7"
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginBottom: 5,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 18,
    color: '#000',
    fontWeight: "400"
  },
  goalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});

export default DayHeader;