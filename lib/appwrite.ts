import {CreateUserParams, GetMenuParams, GetUpdateParams, SignInParams} from "@/type"
import {Account, Avatars, Client, Databases, ID, Query, Storage} from "react-native-appwrite"
import { readAsStringAsync } from 'expo-file-system/legacy';


export const appwriteConfig={
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    project: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    platform: "com.digitall.foodapp",
    databaseId: "6912f1ca003d3cb708f9",
    bucketId: "6914c437000c0db63396",
    useCollectionId: "691452d6003e6ce4cac9",
    categoriesCollectionId: "6914b153001e6cf31ece",
    menuCollectionId: "6914b51b00055b95bb1f",
    customizationCollectionId: "6914be1000372ce5b313",
    menuCustomizationCollectionId: "6914bf2c00388f13431e"
}

export const client = new Client()
client
.setEndpoint(appwriteConfig.endpoint!)
.setProject(appwriteConfig.project!)
.setPlatform(appwriteConfig.platform!)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

const avatar = new Avatars(client)


export const createUser = async({email, password, name}:CreateUserParams) =>{
    try {
        const newAccount = await account.create(ID.unique(), email, password, name)

        if(!newAccount) throw new Error;

        await signIn({email, password})

        const avatarUrl = `${appwriteConfig.endpoint}/v1/avatars/initials?name=${encodeURIComponent(name)}&width=100&height=100`

        console.log("Avatar URL:", avatarUrl)
        return  await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.useCollectionId,
            ID.unique(),
            {email, name, accountId: newAccount.$id, avatar: avatarUrl},

        );
    }catch (e){
        throw new Error (e as string)
    }
}

export const signIn = async({email, password}: SignInParams) => {

    try {
        const session = await account.createEmailPasswordSession({email, password})
    }catch (e){
        throw new Error(e as string)
    }
}

export const getCurrentUser = async () => {
    try {

        const currentAccount = await account.get();

        if(!currentAccount) throw new Error("No account found")

        const currentUser = await  databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.useCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if(!currentUser) throw  new Error

        return currentUser.documents[0]
    }catch (e){
        console.log(e)
        throw new Error(e as string)
    }
}

export const getMenu = async({category, query}:GetMenuParams)=> {
    try {
        const queries: string[] = [];
        if(category) queries.push(Query.equal('categories', category))
        if(query) queries.push(Query.search('name', query))

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries
        )

        return menus.documents
    }catch (e){
        throw new Error(e as string)
    }
}

export const getCategories = async() => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId
        )
        return categories.documents
    }catch (e){
        throw new Error(e as string)
    }
}

export const updateUser = async($id: string, params: Partial<GetUpdateParams> ) => {

    try {
        return await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.useCollectionId,
            $id,
            params
        )
    }catch (e){
        throw new Error(e as string)
    }
}

export const getLogOut = async() => {
    try {
    await account.deleteSession('current')
    } catch (error: any){
        throw new Error(error?.message || "Failed to log out. Please try again later.")
    }
}


export const uploadImageToAppwrite = async(imageUri, userId): Promise<string> => {

    const fileExtension = imageUri.substring(imageUri.lastIndexOf('.') + 1);
    const fileName = `profile-${userId}-${ID.unique()}.${fileExtension}`;
    const fileType = `image/${fileExtension}`;

    const fileInfo = await FileSystem.getInfoAsync(imageUri);

    if(!fileInfo || !fileInfo.size){
        throw new Error("Failed to get file info")
    }


    const file = {
        uri: imageUri,
        name: fileName,
        type: fileType,
        size: fileInfo.size
    }

    try {

        const uploadFile = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            file
        );

        if(!uploadFile || !uploadFile.$id){
            throw new Error("Upload failed: No file ID returned from Appwrite")
        }
        return uploadFile.$id
    }catch (error){
        console.log("Error uploading image to Appwrite:", error)
        throw error
    }



}

export const updateUserProfileImage = async($id, imageUrl) => {
    try {
        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.useCollectionId,
            $id,
            {profileImage: imageUrl}
        )
    }catch (error){
        console.log("Error updating user profile image:", error)
        throw error
    }
}