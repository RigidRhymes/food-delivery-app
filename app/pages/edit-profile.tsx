import {View, Text, TouchableOpacity, Image, TextInput, Alert} from 'react-native'
import React, {useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {images} from "@/constants";
import CustomInput from '@/components/CustomInput';
import CustomButton from "@/components/CustomButton";
import {router} from "expo-router";
import {updateUser} from "@/lib/appwrite";

const EditProfile = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState({'name': '', 'email': '', 'phone': '', 'address1': '', 'address2': '', 'password': '',  })

    const submitForm = async () => {
        const {name, email, phone, address1, address2, password} = form
        if(!name || !email || !phone || !address1) {
            Alert.alert('Error', 'Please fill all the fields')
            return;
        }
        setIsSubmitting(true)

        try {
            await updateUser({name, email, password, phone, address1, address2})
            Alert.alert('Success', 'Profile Updated Successfully')
            router.push('/profile')
        }catch (error: any){
            Alert.alert('Error', error.message)
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='flex-1 mt-12 px-5'>
                <View className='flex flex-row justify-between  items-center mb-10'>
                    <TouchableOpacity className='flex flex-row mb-10 size-10 rounded-full items-center justify-center bg-primary/10 px-6'
                                      onPress={() => router.back()}>
                        <Image source={images.arrowBack} className='size-5' resizeMode='contain'/>
                    </TouchableOpacity>
                    <Text className='h2-bold text-dark-100 mb-5 font-quicksand-bold'>Edit Profile</Text>
                </View>
                <View className='flex flex-col gap-y-5 font-quicksand-bold'>
                    <CustomInput
                        label='Change Name'
                        placeholder='Enter your name'
                        value={form.name}
                        onChangeText={text => setForm({...form, name: text})}
                    />

                    <CustomInput
                        label='Email Address'
                        placeholder='Enter your email address'
                        value={form.email}
                        onChangeText={text => setForm({...form, email: text})}
                    />
                    <CustomInput
                        label='Phone Number'
                        placeholder='Enter your number'
                        value={form.phone}
                        onChangeText={text => setForm({...form, phone: text})}
                    />
                    <CustomInput
                        label='Address Line 1'
                        placeholder='Address Line 1'
                        value={form.address1}
                        onChangeText={text => setForm({...form, address1: text})}
                    />
                    <CustomInput
                        label='Address Line 2'
                        placeholder='Address Line 2'
                        value={form.address2}
                        onChangeText={text => setForm({...form, address2: text})}
                    />
                    <CustomButton title='Save Changes' onPress={submitForm}
                    isLoading={isSubmitting}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}
export default EditProfile
