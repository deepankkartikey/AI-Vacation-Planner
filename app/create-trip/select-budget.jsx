import { View, Text, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigation, useRouter } from 'expo-router'
import { SelectBudgetOptions } from '../../constants/Options';
import { Colors } from '../../constants/Colors';
import { CreateTripContext } from '../../context/CreateTripContext';
import Slider from '@react-native-community/slider';
export default function SelectBudget() {
  
    const navigation=useNavigation();
    const [selectedOption,setSelectedOption]=useState();
    const [dailyBudget, setDailyBudget] = useState(150); // Default to $150/day
    const {tripData,setTripData}=useContext(CreateTripContext);
    const router=useRouter();
    
    useEffect(()=>{
        navigation.setOptions({
            headerShown:true,
            headerTransparent:true,
            headerTitle:''
        })
    },[]);

    // Automatically determine budget category based on daily budget
    useEffect(() => {
        let budgetCategory;
        if (dailyBudget < 100) {
            budgetCategory = SelectBudgetOptions[0]; // Cheap
        } else if (dailyBudget >= 100 && dailyBudget < 300) {
            budgetCategory = SelectBudgetOptions[1]; // Moderate
        } else {
            budgetCategory = SelectBudgetOptions[2]; // Luxury
        }
        setSelectedOption(budgetCategory);
    }, [dailyBudget]);

    useEffect(()=>{

        if(selectedOption) {
            setTripData({
                ...tripData,
                budget: selectedOption?.title,
                dailyBudget: dailyBudget
            })
        }
    },[selectedOption, dailyBudget])

    const onClickContinue=()=>{
        // Budget is automatically set by slider, so just proceed
        router.push('/create-trip/select-activities');
    }
    return (
    <ScrollView style={{
        flex: 1,
        paddingTop:75,
        padding:25,
        backgroundColor:Colors.WHITE
    }}>
      <Text style={{
        fontFamily:'outfit-bold',
        fontSize:35,
        marginTop:20
      }}>
        Budget
      </Text>

      <View style={{
        marginTop:20
      }}>
        <Text style={{
            fontFamily:'outfit-bold',
            fontSize:20,
            marginBottom: 20
        }}>Set your daily budget</Text>

        {/* Daily Budget Slider */}
        <View style={{
            padding: 20,
            backgroundColor: Colors.LIGHT_GRAY,
            borderRadius: 15
        }}>
            <Text style={{
                fontFamily: 'outfit-medium',
                fontSize: 16,
                color: Colors.GRAY,
                marginBottom: 10
            }}>Daily Budget Per Person</Text>
            
            <Text style={{
                fontFamily: 'outfit-bold',
                fontSize: 48,
                color: Colors.PRIMARY,
                textAlign: 'center',
                marginVertical: 10
            }}>${dailyBudget}</Text>
            
            <Text style={{
                fontFamily: 'outfit',
                fontSize: 14,
                color: Colors.GRAY,
                textAlign: 'center',
                marginBottom: 15
            }}>per person per day</Text>

            <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={20}
                maximumValue={400}
                step={10}
                value={dailyBudget}
                onValueChange={setDailyBudget}
                minimumTrackTintColor={Colors.PRIMARY}
                maximumTrackTintColor={Colors.GRAY}
                thumbTintColor={Colors.PRIMARY}
            />

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 5
            }}>
                <Text style={{
                    fontFamily: 'outfit',
                    fontSize: 12,
                    color: Colors.GRAY
                }}>$20</Text>
                <Text style={{
                    fontFamily: 'outfit',
                    fontSize: 12,
                    color: Colors.GRAY
                }}>$400+</Text>
            </View>
        </View>

        {/* Budget Category Indicator */}
        <View style={{
            marginTop: 20,
            padding: 20,
            backgroundColor: selectedOption?.id === 1 ? '#FFF3E0' : selectedOption?.id === 2 ? '#E3F2FD' : '#F3E5F5',
            borderRadius: 15,
            borderWidth: 2,
            borderColor: Colors.PRIMARY
        }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontFamily: 'outfit',
                        fontSize: 14,
                        color: Colors.GRAY,
                        marginBottom: 5
                    }}>Budget Category</Text>
                    <Text style={{
                        fontFamily: 'outfit-bold',
                        fontSize: 24
                    }}>{selectedOption?.title}</Text>
                    <Text style={{
                        fontFamily: 'outfit',
                        fontSize: 15,
                        color: Colors.GRAY,
                        marginTop: 5
                    }}>{selectedOption?.desc}</Text>
                    {selectedOption?.range && (
                        <Text style={{
                            fontFamily: 'outfit-medium',
                            fontSize: 13,
                            color: Colors.PRIMARY,
                            marginTop: 5
                        }}>Typical range: {selectedOption.range}</Text>
                    )}
                </View>
                <Text style={{
                    fontSize: 40
                }}>{selectedOption?.icon}</Text>
            </View>
        </View>
      </View>

      <TouchableOpacity 
      onPress={()=>onClickContinue()}
      style={{
        padding:15,
        backgroundColor:Colors.PRIMARY,
        borderRadius:15,
        marginTop:20,
        marginBottom: 40
      }}>

        <Text style={{
          textAlign:'center',
          color:Colors.WHITE,
          fontFamily:'outfit-medium',
          fontSize:20
        }}>Continue</Text>
     
      </TouchableOpacity>
    </ScrollView>
  )
}