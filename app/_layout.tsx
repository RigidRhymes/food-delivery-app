import { Stack, SplashScreen } from "expo-router";
import "./global.css"
import {useFonts} from "expo-font";
import {useEffect} from "react";
import * as Sentry from '@sentry/react-native';
import useAuthStore from "@/store/auth.store";

Sentry.init({
  dsn: 'https://c52ac7dc8500df9d7c12ad6f68d9be14@o4510352180510720.ingest.de.sentry.io/4510352183984208',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function RootLayout() {
  const {isLoading, fetchAuthenticatedUser} = useAuthStore()
  const [fontsLoaded, error] = useFonts({
    "QuickSand-Bold": require('../assets/fonts/Quicksand-Bold.ttf'),
    "QuickSand-Light": require('../assets/fonts/Quicksand-Light.ttf'),
    "QuickSand-Medium": require('../assets/fonts/Quicksand-Medium.ttf'),
    "QuickSand-SemiBold": require('../assets/fonts/Quicksand-Regular.ttf'),
  })

  useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded, error]);

  useEffect(() => {
    fetchAuthenticatedUser()
  }, []);

  if(!fontsLoaded || isLoading) return  null
  return <Stack screenOptions={{headerShown: false}} />;
});