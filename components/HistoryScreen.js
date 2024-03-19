import React from 'react';
// import * as firebase from "firebase";
import {Dimensions, StyleSheet, View} from "react-native";
import {Title} from "react-native-paper";
import {CalendarList} from "react-native-calendars";
import { today} from "../utilities";
import DateData from "./DateData";
import firebase from "firebase/app" ;
import { app, database, auth } from '../firebase-config'; 
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function HistoryScreen() {

    const [marked, setMarked] = React.useState({});
    const [waterObject, setWaterObject] = React.useState({});
    const [selected, setSelected] = React.useState(null);

    React.useEffect(() => {
        // Listen for changes in the /users/001/ path of your Firebase Realtime Database
        const waterIntakeRef = ref(database, 'users/001/');
        const unsubscribe = onValue(waterIntakeRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const prods = Object.values(data);
                const markedData = prods.reduce((obj, item) => ({...obj, [item.date]: {selected: true}}) ,{});
                const waterData = prods.reduce((obj, item) => ({...obj, [item.date]: item.waterAmount}) ,{});
                setMarked(markedData);
                setWaterObject(waterData);
            }
        });

        // Clean up listener on component unmount
        return () => unsubscribe();
    }, []);


    return (
        <View style={styles.container}>
            <Title>Water intake history</Title>
            <View style={styles.calendar}>
                <CalendarList
                    theme={{
                        calendarBackground: '#131A26',
                        textSectionTitleColor: '#ffffff',
                        selectedDayTextColor: '#ffffff',
                        selectedDayBackgroundColor: '#2176FF',
                        dayTextColor: '#ffffff',
                        monthTextColor: '#ffffff',
                        textMonthFontWeight: 'bold',
                    }}
                    firstDay={1}
                    horizontal={true}
                    pagingEnabled={true}
                    onDayPress={(day) => {
                        if (!(waterObject.hasOwnProperty(day['dateString']))) {
                            setSelected(null);
                        } else {
                            setSelected(day["dateString"])
                        }
                    }}
                    markedDates={{...marked, [today()]: {selected: true, selectedColor: '#81c5fe'}}}
                />
            </View>
            <View style={styles.content}>
                <DateData
                    date={selected}
                    chartData={waterObject}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        marginTop: 20,
        alignItems: 'center',
    },
    calendar: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
    },
    buttons: {
        flex: 0,
        flexDirection: 'row',
        width: Dimensions.get('window').width,
        justifyContent: 'space-evenly',
    },
});