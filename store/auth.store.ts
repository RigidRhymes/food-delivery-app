import { create } from 'zustand'
import {User} from "@/type";
import {getCurrentUser, updateUser} from "@/lib/appwrite";



type AuthState ={
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    setProfileImage: (uri: string) => void;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>

    updateProfile: (data: Partial<User>) => Promise<void>
};

const mapToUser = (doc: any): User => ({
    $id: doc.$id,
    name: doc.name,
    email: doc.email,
    avatar: doc.avatar,
    phone: doc.phone,
    address1: doc.address1,
    address2: doc.address2,
    profileImage: doc.avatar,
    imageUri: doc.avatar,
});

const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value) => set({isAuthenticated: value}),

    setUser: (user) => set({user}),

    setLoading: (value) => set({isLoading: value}),

    setProfileImage: (uri: string) => set((state) => ({
        user: state.user? {...state.user, profileImage: uri} : null
    })),

    updateProfile: async(data) => {
        const currentUser = get().user;
        if(!currentUser) return;

        try {
            const updatedUser = await updateUser(currentUser.$id, {
                ...data,
            });

            set({user: mapToUser(updatedUser)});
        } catch (error){
            console.log("updateProfile error", error)
            throw error
        }
    },

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