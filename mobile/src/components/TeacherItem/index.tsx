import React, { useState } from 'react';
import { View, Image, Text, Linking } from 'react-native';

import styles from './styles';
import { RectButton } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';

import HeartOutlineIcon from '../../assets/images/icons/heart-outline.png';
import unfavoriteIcon from '../../assets/images/icons/unfavorite.png';
import whatsappIcon from '../../assets/images/icons/whatsapp.png';
import Teacher from '../../objects/Teacher';
import api from '../../services/api';

interface TeacherItemProps {
    teacher: Teacher;
    favorited: boolean;
}

const TeacherItem: React.FC<TeacherItemProps> = ({teacher, favorited}) => {
    const [isFavorited, setIsFavorited] = useState(favorited);
    
    function handleLinkToWhatsApp() {
        api.post('connections', {
            user_id: teacher.id
        });
        Linking.openURL(`whatsapp://send?phone=${teacher.whatsapp}`);
    }

    async function handleToggleFavorites() {
        setIsFavorited(!isFavorited);
        const favorites = await AsyncStorage.getItem('favorites');
        let favoritesArray = [];
        if (favorites) {
            favoritesArray = JSON.parse(favorites);
        }
        if (isFavorited) {
            const favoriteIndex = favoritesArray.findIndex((teacherItem: Teacher) => {
                return teacherItem.id === teacher.id;
            });
            favoritesArray.splice(favoriteIndex, 1);
            setIsFavorited(false);
        }
        else {
            favoritesArray.push(teacher);
            setIsFavorited(true);
        }
        await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
    }

    return (
        <View style={styles.container}>
            <View style={styles.profile}>
                <Image
                    style={styles.avatar}
                    source={{ uri: teacher.avatar }}
                />

                <View style={styles.profileInfo}>
                    <Text style={styles.name}>
                        {teacher.name}
                    </Text>
                    <Text style={styles.subject}>
                        {teacher.subject}
                    </Text>
                </View>
            </View>

            <Text style={styles.bio}>
                {teacher.bio}
            </Text>

            <View style={styles.footer}>
                <Text style={styles.price}>
                    Preço/Hora: {'  '}
    <Text style={styles.priceValue}>{teacher.cost}</Text>
                </Text>

                <View style={styles.buttonsContainer}>
                    <RectButton 
                        onPress={handleToggleFavorites}
                        style={[
                            styles.favoriteButton, 
                            isFavorited ? styles.favorited : {}]}>
                        {isFavorited ? <Image source={unfavoriteIcon}/>: <Image source={HeartOutlineIcon}/>}
                    </RectButton>

                    <RectButton onPress={handleLinkToWhatsApp} style={styles.contactButton}>
                        <Image source={whatsappIcon}/>
                        <Text style={styles.contactButtonText}>
                            Entrar em contato
                        </Text>
                    </RectButton>
                </View>
            </View>
        </View>
    );
}

export default TeacherItem;