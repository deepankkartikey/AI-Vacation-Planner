import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

/**
 * IconWithBackground - Displays an icon with a white background container
 * to hide black edges and create a professional look
 * 
 * @param {string} source - Image source (require or uri)
 * @param {number} size - Size of the icon (default: 80)
 * @param {number} borderRadius - Border radius (default: 18)
 * @param {string} backgroundColor - Background color (default: Colors.WHITE)
 */
export default function IconWithBackground({ 
    source, 
    size = 80, 
    borderRadius = 18,
    backgroundColor = Colors.WHITE,
    containerStyle = {},
    imageStyle = {}
}) {
    const containerSize = size + 10; // Add 10px for padding (5px on each side)
    const containerBorderRadius = borderRadius + 4; // Slightly larger border radius for container

    return (
        <View style={[
            styles.container,
            {
                width: containerSize,
                height: containerSize,
                borderRadius: containerBorderRadius,
                backgroundColor: backgroundColor,
            },
            containerStyle
        ]}>
            <Image 
                source={source}
                style={[
                    styles.image,
                    {
                        width: size,
                        height: size,
                        borderRadius: borderRadius,
                    },
                    imageStyle
                ]}
                resizeMode="cover"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
        padding: 5,
    },
    image: {
        // Additional image styles can be added here
    }
});
