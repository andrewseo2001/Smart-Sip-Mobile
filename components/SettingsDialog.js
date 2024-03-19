import * as React from 'react';
import {Button, Dialog, Portal, Provider, Text, TextInput} from "react-native-paper";
import firebase from "firebase/app" ;
import { app, database } from '../firebase-config'; 
import { getDatabase, ref, onValue, update } from 'firebase/database';

const db = getDatabase();

export default function SettingsDialog(props) {

    const[bottleVolume, setBottleVolume] = React.useState(0);
    const[cupVolume, setCupVolume] = React.useState(0);
    const[oldBottleVolume, setOldBottleVolume] = React.useState(0);
    const[oldCupVolume, setOldCupVolume] = React.useState(0);


  function updateWaterCup(volume) {
        update(ref(db, 'containers/001/'), {
            waterCup: volume,
        }).then(() => {
            console.log('Cup volume updated');
        }).catch((error) => {
            console.error('Error updating cup volume:', error);
        });
    }

    function updateWaterBottle(volume) {
        update(ref(db, 'containers/001/'), {
            waterBottle: volume,
        }).then(() => {
            console.log('Bottle volume updated');
        }).catch((error) => {
            console.error('Error updating bottle volume:', error);
        });
    }

    React.useEffect(() => {
        const containerRef = ref(db, 'containers/001/');
        const unsubscribe = onValue(containerRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setOldBottleVolume(data.waterBottle || 0);
                setOldCupVolume(data.waterCup || 0);
            }
        });
        return () => unsubscribe();
    }, []);


    return (
        <Provider>
            <Portal>
                <Dialog
                    visible={props.isDialogVisible}
                    onDismiss={() => props.setIsDialogVisible(false)}>
                    <Dialog.Title>Settings</Dialog.Title>
                    <Dialog.Content style={{alignContent: 'space-around'}}>
                        <Text>Here you can customize the volumes of the water cup and bottle
                            to match your own to make adding water quick and easy.</Text>

                        <Text>{`
                            Current volumes:

                            Water cup: ${oldCupVolume} ml
                            Water bottle: ${oldBottleVolume} ml`
                        }</Text>

                        <TextInput
                            style={{marginTop: 30}}
                            label="Volume of your water cup"
                            placeholder="in millilitres"
                            underlineColor="#2176FF"
                            theme={{colors: {primary: '#2176FF'}}}
                            onChangeText={text => setCupVolume(text)}
                        />
                        <TextInput
                            style={{marginTop: 60}}
                            label="Volume of your water bottle"
                            placeholder="in millilitres"
                            underlineColor="#2176FF"
                            theme={{colors: {primary: '#2176FF'}}}
                            onChangeText={text => setBottleVolume(text)}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            theme={{colors: {primary: '#2176FF'}}}
                            onPress={() => {
                                props.setIsDialogVisible(false);
                                if (!isNaN(bottleVolume) && !isNaN(cupVolume)) {
                                    updateWaterBottle(parseInt(bottleVolume));
                                    updateWaterCup(parseInt(cupVolume));
                                } else if (!isNaN(bottleVolume)) {
                                    updateWaterBottle(parseInt(bottleVolume));
                                } else if (!isNaN(cupVolume)) {
                                    updateWaterCup(parseInt(cupVolume));
                                }
                            }}>Done</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </Provider>
    );
};
                        