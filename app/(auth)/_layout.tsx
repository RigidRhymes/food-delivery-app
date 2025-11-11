import {View, Text} from 'react-native'
import {SafeAreaView} from "react-native-safe-area-context";
import {Slot} from "expo-router";


const AuthLayout = () => {
    return (
        <SafeAreaView>
            <Text>AuthLayout</Text>
            <Slot />
        </SafeAreaView>
    )
}
export default AuthLayout
