import React, { useEffect, useState } from 'react';
import {View, StyleSheet, Dimensions} from "react-native";
import {Title, Text, Button, Chip, Snackbar, Portal} from "react-native-paper";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import ChangeTargetDialog from "./ChangeTargetDialog";
import valuesToPercentage, {today} from "../utilities";
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from "firebase/app" ;
import { app, database, auth } from '../firebase-config'; 
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


import { initializeApp } from 'firebase/app';
import CustomWaterDialog from "./CustomWaterDialog";

const screenWidth = Dimensions.get("window").width;


export default function MainScreen() {

    const [target, setTarget] = React.useState(0);
    const [targetReach, setTargetReach] = React.useState(false);
    const [water, setWater] = React.useState(0);
    const [percentage, setPercentage] = React.useState(0);

    const [waterCup, setWaterCup] = React.useState(330);
    const [waterBottle, setWaterBottle] = React.useState(500);

    const [visible, setVisible] = React.useState(false);
    const onToggleSnackBar = () => setVisible(true);
    const onDismissSnackBar = () => setVisible(false);

    const [targetSnackVisible, setTargetSnackVisible] = React.useState(false);
    const onToggleTargetSnackBar = () => setTargetSnackVisible(true);
    const onDismissTargetSnackBar = () => setTargetSnackVisible(false);

    const [isTargetDialogVisible, setIsTargetDialogVisible] = React.useState(false);
    const [isCustomDialogVisible, setIsCustomDialogVisible] = React.useState(false);

    const [userUid, setUserUid] = useState(null);


        
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            setUserUid(currentUser.uid);
          }
        });
    
        return () => {
          unsubscribe();
        };
      }, [auth]);

    useEffect(() => {
    if (userUid) {
        // Setup listeners for user's target and water data
        const userTargetRef = ref(database, `users/${userUid}/target`);
        const userWaterRef = ref(database, `users/${userUid}/${today()}`);

        onValue(userTargetRef, (snapshot) => {
        const targetValue = snapshot.val();
        if (targetValue) setTarget(targetValue);
        });

        onValue(userWaterRef, (snapshot) => {
        const waterData = snapshot.val();
        if (waterData) {
            setWater(waterData.waterAmount);
            setPercentage(valuesToPercentage(target, waterData.waterAmount));
        }
        });
    }
    }, [database, userUid, target]);
    


    const defineTarget = async (userTarget) => {
        if (userUid) {
          const targetRef = ref(database, `users/${userUid}`);
          // Construct an object with the target as a child
          const updateData = { target: userTarget };
          await update(targetRef, updateData);
          setTarget(userTarget);
          console.log("set target");
        } else {
          Alert.alert("User not identified", "Cannot set target without user identification.");
        }
    };
    
    
    
      const addWater = async (amount) => {
        if (userUid && amount) {
          const todayRef = ref(database, `users/${userUid}/${today()}`);
          const newWaterAmount = water + amount;
          const newPercentage = valuesToPercentage(target, newWaterAmount);
    
          await update(todayRef, {
            waterAmount: newWaterAmount,
            date: today(),
            percentage: newPercentage,
          });
    
          setWater(newWaterAmount); 
          setPercentage(newPercentage);
          onToggleSnackBar();
          
              // Check if the new water amount exceeds the target
        if (newWaterAmount >= target) {
        setTargetReach(true);
         }
        }
      };
    
      const resetWater = async () => {
        if (userUid) {
          const todayRef = ref(database, `users/${userUid}/${today()}`);
          await update(todayRef, {
            waterAmount: 0,
            date: today(),
            percentage: 0,
          });
    
          setWater(0);
          setPercentage(0);
          onDismissSnackBar();
        }
      };
    
    useEffect(() => {
        console.log("target state change " + targetReach);
        if (targetReach === true) {
            onToggleTargetSnackBar();
            console.log("Target reached!");
        }
    }, [targetReach]); // Depend on targetReach to run this effect

    return (
        <View style={styles.container}>
            <Title>Today</Title>
            <Chip
                mode='outlined'
                icon='information'
                selectedColor='#2176FF'
                style={{
                    marginTop: 10,
                    width: '90%', // Adjust width to 90% of the container width
                    alignSelf: 'center', // Center the chip in the parent container
                    justifyContent: 'space-between', // Spread icon and text
                }}
                textStyle={{
                    fontSize: 16, // Adjust text size as needed
                }}
                onPress={() => setIsTargetDialogVisible(true)}>
                Water target: {target} ml
            </Chip>
            
            <View style={styles.content}>
                <AnimatedCircularProgress
                    style={styles.progress}
                    size={245}
                    width={32}
                    rotation={0.25}
                    arcSweepAngle={360}
                    fill={percentage}
                    tintColor="#2176FF"
                    backgroundColor="#131A26"
                    onAnimationComplete={() => console.log('onAnimationComplete')}
                    childrenContainerStyle={styles.circle}
                    children={
                        () => (
                            <View style={{alignItems: 'center', transform: [{ rotate: "-45deg"}],}}>
                                <Title>
                                    { water } ml
                                </Title>
                                <Text>
                                    {percentage} %
                                </Text>
                            </View>
                        )
                    }
                />
                <View style={styles.addContainer}>
                    <Title style={{marginHorizontal: 70}}>+ Add a portion of water</Title>
                    <View style={styles.buttons}>
                        <Button icon="cup" mode="contained" onPress={() => addWater(waterCup)}>
                            Cup
                        </Button>
                        <Button icon="glass-stange" mode="contained" onPress={() => addWater(waterBottle)}>
                            Bottle
                        </Button>
                        <Button icon="water" mode="contained" onPress={() => setIsCustomDialogVisible(true)}>
                            Something else
                        </Button>
                    </View>
                </View>
            </View>
            <Snackbar
                visible={visible}
                duration={2500}
                onDismiss={onDismissSnackBar}
                theme={{ colors: { surface: '#FFFFFF'}}}
                action={{
                    label: 'Reset',
                    onPress: () => resetWater()
                }}>
                Your daily water intake level is now {percentage}%!
            </Snackbar>
            <Snackbar
                visible={targetSnackVisible}
                duration={2500}
                onDismiss={onDismissTargetSnackBar}
                theme={{ colors: { surface: '#FFFFFF', onSurface: '#FDCA40', accent: '#FFFFFF'}}}
                action={{
                    label: 'Yay!',
                    onPress: () => onDismissTargetSnackBar()
                }}>Congrats, you reached your water intake goal!</Snackbar>
            <Portal>
                <ChangeTargetDialog
                    isDialogVisible={isTargetDialogVisible}
                    setIsDialogVisible={setIsTargetDialogVisible}
                    setTarget={defineTarget}
                />
                <CustomWaterDialog
                    isDialogVisible={isCustomDialogVisible}
                    setIsDialogVisible={setIsCustomDialogVisible}
                    addWater={addWater}
                />
            </Portal>
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
    content: {
        flex: 1,
        marginTop: 50,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    addContainer: {
        flex: 1,
        flexGrow: 0.45,
        flexDirection: 'row',
        alignItems: 'center',
        width: screenWidth,
        alignContent: 'space-between',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
    },
    buttons: {
        flexDirection: 'row',
        alignItems: 'center',
        width: screenWidth-100,
        alignContent: 'space-between',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
    },
    circle: {
        width: 181,
        height: 181,
        borderRadius: 120,
        borderWidth: 5,
        backgroundColor: '#27354d',
        borderColor: "#0051d4",
        borderTopLeftRadius: 10,
        borderBottomWidth: 10,
        borderRightWidth: 10,
        transform: [{ rotate: "45deg"}],
        shadowColor: "#000000",
        shadowOffset: {
            width: 1,
            height: 1,
        },
        shadowOpacity: 0.9,
        shadowRadius: 10.00,
        elevation: 10,
    },
    progress: {
        width: 264,
        height: 264,
        marginBottom: 10,
        borderRadius: 300,
        borderWidth: 10,
        borderColor: "#0051d4",
        overflow: 'hidden',
    }
});