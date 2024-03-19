import React, { useEffect, useState } from 'react';
import {Appbar, Divider, Menu, Portal} from 'react-native-paper';
import firebase from "firebase/app" ;
import { app, database, auth } from '../firebase-config'; 
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import {today} from "../utilities";
import SettingsDialog from "./SettingsDialog";

export default function TopBar() {
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const [isDialogVisible, setIsDialogVisible] = React.useState(false);
    const showDialog = () => setIsDialogVisible(true);
    const hideDialog = () => setIsDialogVisible(false);

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
        
    const resetWater = async () => {
        if (userUid) {
          const todayRef = ref(database, `users/${userUid}/${today()}`);
          await update(todayRef, {
            waterAmount: 0,
            date: today(),
            percentage: 0,
          });
        }
      };

    return (
        <Appbar.Header>
            <Appbar.Action style={{flex: 0}} onPress={() => {}} />
            <Appbar.Content style={{alignItems: 'center'}} title="Water Intake Tracker"/>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={<Appbar.Action style={{flex: 0}} color="#FFFFFF" icon="dots-vertical" onPress={() => {openMenu()}} />}>
                <Menu.Item onPress={() => {resetWater(); closeMenu();}} title="Reset water intake" />
                <Divider />
                <Menu.Item onPress={() => {showDialog(); closeMenu();}} title="Settings" />
            </Menu>
            <Portal>
                <SettingsDialog
                    isDialogVisible={isDialogVisible}
                    setIsDialogVisible={setIsDialogVisible}
                    hideDialog={hideDialog}
                />
            </Portal>
        </Appbar.Header>
    );
};
