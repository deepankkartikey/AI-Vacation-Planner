import { View, Text } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/Colors'

export default function OptionCard({option,selectedOption}) {
  return (
    <View style={[{
        padding:25,
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:Colors.LIGHT_GRAY,
        borderRadius:15
    },selectedOption?.id==option?.id&&{borderWidth:3}]}>
        <View style={{ flex: 1 }}>
                <Text style={{
                    fontSize:20,
                    fontFamily:'outfit-bold'
                }}>{option?.title}</Text>
                 <Text style={{
                    fontSize:17,
                    fontFamily:'outfit',
                    color:Colors.GRAY
                }}>{option?.desc}</Text>
                {option?.range && (
                    <Text style={{
                        fontSize:15,
                        fontFamily:'outfit-medium',
                        color:Colors.PRIMARY,
                        marginTop:5
                    }}>{option.range}</Text>
                )}
        </View>
        <Text style={{
            fontSize:35
        }}>{option.icon}</Text>
   
    </View>
  )
}