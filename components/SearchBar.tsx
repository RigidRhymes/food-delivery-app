import {View, Text, TextInput, TouchableOpacity, Image} from 'react-native'
import React, {useState} from 'react'
import {router, useLocalSearchParams} from "expo-router";
import {images} from "@/constants";


const SearchBar = () => {
    const params = useLocalSearchParams<{query?: string}>()
    const [query, setQuery] = useState(params.query)


    const handleSearch = (text: string) => {
        setQuery(text);

        if(!text) router.setParams({query: undefined})
    }

    const handleSubmit = () => {
        if(query?.trim()) router.setParams({query})
    }
    return (
        <View className='searchbar shadow-xl rounded-l-2xl rounded-r-2xl flex-row bg-white'>
            <TextInput
            className='flex-1 p-5'
            placeholder='Search for burder, chicken, fish, etc.'
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmit}
            placeholderTextColor='#A0A0A0'
            returnKeyType='search'
            />
            <TouchableOpacity className='pr-5' onPress={() => router.setParams({query})}>
                <Image source={images.search}
                       className='size-5'
                       resizeMode={'contain'}
                       tintColor={"A0A0A0"}
                />
            </TouchableOpacity>
        </View>
    )
}
export default SearchBar
