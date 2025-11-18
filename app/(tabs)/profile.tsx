import {View, Text, FlatList, Image, TouchableOpacity} from 'react-native'
import {SafeAreaView} from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import useAuthStore from "../../store/auth.store";
import {images, profileImages} from "@/constants";
import * as ImagePicker from 'expo-image-picker'
import cn from "clsx";
import { User } from '@/type';
import CustomButton from "@/components/CustomButton";
import {router} from "expo-router";
import {getLogOut} from "@/lib/appwrite";


const Profile = () => {
    const{user, setProfileImage} = useAuthStore()

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if(!result.canceled) {
            const selectedImage = result.assets[0].uri;
            setProfileImage(selectedImage)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    }

    const initials = user ? getInitials(user.name) : ' '

    const mergedProfileData = user ? profileImages.map((item) => ({
        ...item,
        value: user[item.key as keyof User] || 'Not Provided'


    })) : []

    const logOut = async () =>{
        try {
            await getLogOut()
            router.replace('/sign-in')
        }catch (error: any){
            console.log(error.message)
        }
    }
    return (
        <SafeAreaView className='bg-white'>
            <FlatList data={mergedProfileData}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({item, index}) => {
                          const isEven = index % 2 === 0;
                          return (
                              <View className='flex flex-row p-4 mx-4 gap-2 mt-2'>
                                 <View className='size-16 bg-primary/15 rounded-full flex items-center justify-center'>
                                     <Image
                                         source={item.image}
                                         className='size-5'
                                         resizeMode='contain'
                                     />
                                 </View>
                                  <View className='flex flex-col'>
                                      <Text className='px-2 text-gray-200'>{item.title}</Text>
                                      <Text className='px-2 text-blak'>{item.value || 'Not provided'}</Text>
                                  </View>
                              </View>

                          )
                      }}

                      ListHeaderComponent={() => (
                          <View className='bg-white mb-4'>
                              <View className='flex-between flex-row px-5 mt-5'>
                                  <CustomHeader title='Profile'/>
                              </View>
                              <View className='flex w-full items items-center justify-center relative'>
                                  <View className='size-20 rounded-full bg-white border border-primary'>
                                      <Text>
                                          { user?.avatar ? (
                                              <Image source={{uri: user.profileImage }} className='w-full h-full rounded-full'/>
                                          ) : (
                                              <Text className='font-bold text-5xl text-black-100'>{initials || ''}</Text>
                                          )}
                                      </Text>
                                      <View className='absolute bottom-0  -right-5 m-2 '>
                                          <TouchableOpacity className='flex-center   rounded-full w-8 h-8 border border-white bg-primary' onPress={() => pickImage()}>
                                              <Image source={images.pencil} className='size-5' resizeMode='contain'/>
                                          </TouchableOpacity>
                                      </View>
                                  </View>
                              </View>
                          </View>
                      )}
                      ListFooterComponent={() => (
                          <View>
                              <View className='flex w-full items-center justify-center p-6 mt-4 gap-4'>
                                  <TouchableOpacity className='w-full bg-primary/5 rounded-full border border-primary h-[46px] text-center flex flex-row items-center justify-center text-primary'
                                  onPress={() => router.push('/pages/edit-profile')}
                                  >
                                      <Text className='text-primary'>Edit Profile</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity className='w-full bg-error/5 rounded-full border gap-2 border-error h-[46px] text-center flex flex-row items-center justify-center '
                                  onPress={() => logOut()}
                                  >
                                      <Image source={images.logout} className='size-10' resizeMode='contain'/>
                                      <Text className='text-error'>Logout</Text>
                                  </TouchableOpacity>
                              </View>
                          </View>
                      )}
            />
        </SafeAreaView>
    )
}
export default Profile
