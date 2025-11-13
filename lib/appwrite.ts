import {CreateUserParams, GetMenuParams, SignInParams} from "@/type"
import {Client, Account, Databases, Avatars, ID, Query, Storage} from "react-native-appwrite"

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