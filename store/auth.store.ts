import { create } from 'zustand'
import {User} from "@/type";
import {isLoading} from "expo-font";
import {getCurrentUser} from "@/lib/appwrite";


type AuthState ={
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    setProfileImage: (uri: string) => void;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;


    fetchAuthenticatedUser: () => Promise<void>
}
const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value) => set({isAuthenticated: value}),

    setUser: (user) => set({user}),

    setLoading: (value) => set({isLoading: value}),

    setProfileImage: (uri: string) => set((state) => ({
        user: state.user? {...state.user, profileImage: uri} : null
    })),

    fetchAuthenticatedUser: async() => {
        set({isLoading: true})

        try {

            const user = await getCurrentUser();

            if(user) set({isAuthenticated: true, user: user as User})
            else set({isAuthenticated: false, user: null})
        }catch (e){
            console.log("fetchAuthenticatedUser error", e)

            set({isAuthenticated: false, user: null})
        }finally {
            set({isLoading: false})
        }
    }

}))

export default useAuthStore;