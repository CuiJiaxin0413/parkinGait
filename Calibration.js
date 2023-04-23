import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { initializeApp, firebase } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set } from "firebase/database";
import { auth } from "./firebase";
import { useNavigation } from "@react-navigation/native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const firebaseConfig = {
    apiKey: "AIzaSyDZN7DF3BPdseBoCP2l6A3Yjbc0ECb0pMk",
    authDomain: "parkingait.firebaseapp.com",
    databaseURL: "https://parkingait-default-rtdb.firebaseio.com",
    projectId: "parkingait",
    storageBucket: "parkingait.appspot.com",
    messagingSenderId: "987453531886",
    appId: "1:987453531886:web:d641b174467546f31fb5ff",
    measurementId: "G-1C4E694RZQ"
  };
  const app = initializeApp(firebaseConfig);
  // Initialize Realtime Database and get a reference to the service
  const database = getDatabase(app);
  
  
  const ACCELEROMETER_TIMING = 100; // ms
  const ACCELEROMETER_HZ = 1000/ACCELEROMETER_TIMING;
  const DISTANCE_TRAVELED = 5;
  const DISTANCE_THRESHOLD = 3;
  const USER_HEIGHT = 1.778 // m
  const METERS_TO_INCHES = 39.3701 // constant, no units
const Calibration = ({ navigation }) => {
    const [isCollecting, setIsCollecting] = useState(false);
    const [accelerometerData, setAccelerometerData] = useState([]);
    
    const handleToggleCollecting = () => {
      if (!isCollecting) {
        setAccelerometerData([]);
        setTimeout(() => {
          setIsCollecting(true);
          Vibration.vibrate(100);
        }, 3000);
      } else {
        setIsCollecting(false);
      }
    };
  
    useEffect(() => {
      let subscription;
      if (isCollecting) {
        subscription = Accelerometer.addListener((accelerometerData) => {
          setAccelerometerData((prevData) => [...prevData, accelerometerData]);
        });
        Accelerometer.setUpdateInterval(ACCELEROMETER_TIMING);
      } else {
        subscription?.remove();
      }
      return () => subscription?.remove();
    }, [isCollecting]);
  
    const handleLogData = () => {
      const xData = accelerometerData.map(data => data.x.toFixed(4));
      const yData = accelerometerData.map(data => data.y.toFixed(4)-1);
      const zData = accelerometerData.map(data => parseFloat(data.z.toFixed(4)));
      const magnitudeData = accelerometerData.map(data => Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z));

      /*console.log("X data: " + xData);
      console.log("Y data: " + yData);
      console.log("Z data: " + zData);
      console.log("Mag data: " + magnitudeData);*/
      
      const average = array => array.slice(0, array.length - 10).reduce((a, b) => a + b, 0) / (array.length - 10);
      //const average = array => array.reduce((a, b) => a + b) / array.length;
      const mean = average(zData);
      //console.log(mean);

      const steps = [];

      for (let z = 0, index = 0; z < zData.length-10; z++) {
      //for (let z = 0; z < zData.length; z++){
        if (z - index > DISTANCE_THRESHOLD && ((zData[z] < mean && zData[z-1] > mean) || (zData[z-1] < mean && zData[z] > mean))) {
          steps.push((z+(z-1))/2);
          index = z;
        }
      }
      //console.log(steps);
      const times = [];

      for (let i = 1; i < steps.length; i++) {
        let diff = steps[i] - steps[i-1];
        times.push(diff/10);
      }
      //console.log(times);

      const av_time = times.reduce((a, b) => a + b, 0) / times.length;
      //console.log(av_time);
      const av_step_length = DISTANCE_TRAVELED / steps.length;
      //console.log(av_step_length);
      const av_step_length_in = av_step_length * METERS_TO_INCHES;
      console.log(av_step_length_in);

      const gaitConstant = av_step_length / av_time;
      console.log(gaitConstant);
  
      set(ref(database, 'users/' + auth.currentUser.uid + '/Calibration'), {
        gaitConstant: gaitConstant,
        Threshold: mean,
      });
      console.log("MOVING TO MAINPAGE");
      navigation.navigate("MainPage");
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleToggleCollecting}>
            <Text style={styles.buttonText}>{isCollecting ? 'Stop Collecting' : 'Start Collecting'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleLogData}>
            <Text style={styles.buttonText}>Calibrate</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Calibration;
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4CAF50',
      padding: 10,
      borderRadius: 5,
      margin: 10,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    text: {
      margin: 10,
    },
  });
  
