import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "size" | "crust" | "bread" |"spice" |"source" |"paste" |"side" |string; // extend as needed
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customization: string[]; // list of customization names
}

interface DummyData {
    categories: Category[];
    customization: Customization[];
    menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    const list = await databases.listDocuments(
        appwriteConfig.databaseId,
        collectionId
    );

    await Promise.all(
        list.documents.map((doc) =>
            databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
        )
    );
}

async function clearStorage(): Promise<void> {
    const list = await storage.listFiles(appwriteConfig.bucketId);

    await Promise.all(
        list.files.map((file) =>
            storage.deleteFile(appwriteConfig.bucketId, file.$id)
        )
    );
}

// Note: React Native cannot upload a remote http(s) URL directly to Appwrite Storage.
// The Storage SDK expects a local file URI (e.g., file://...) or an InputFile/buffer.
// Attempting to fetch a remote image and pass its URL to createFile causes
// 'Network request failed' on device. For seeding purposes, we will skip uploading
// and just use the original remote image URL. If you want to upload later, download
// the file to a local path first (e.g., via expo-file-system) and pass that URI.
async function uploadImageToStorage(imageUrl: string) {
    try {
        // If you later switch to local file upload, implement it here and return the stored file's view URL.
        // Example sketch (do not use as-is without expo-file-system):
        // const localUri = await downloadToLocalFile(imageUrl);
        // const file = await storage.createFile(appwriteConfig.bucketId, ID.unique(), {
        //   uri: localUri,
        //   name: imageUrl.split('/').pop() || `file-${Date.now()}.jpg`,
        //   type: 'image/jpeg',
        // });
        // return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${file.$id}/view?project=${appwriteConfig.project}`;

        // For now, fall back to the original remote URL to avoid network upload failures during seeding.
        return imageUrl;
    } catch (e) {
        // As a safety net, still return the original URL if anything goes wrong.
        console.warn('Image upload skipped due to error, using original URL instead:', e);
        return imageUrl;
    }
}

async function seed(): Promise<void> {
    // 1. Clear all
    await clearAll(appwriteConfig.categoriesCollectionId);
    await clearAll(appwriteConfig.customizationCollectionId);
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.menuCustomizationCollectionId);
    await clearStorage();

    // 2. Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
            ID.unique(),
            cat
        );
        categoryMap[cat.name] = doc.$id;
    }

    // 3. Create Customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customization) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationCollectionId,
            ID.unique(),
            {
                name: cus.name,
                price: cus.price,
                type: cus.type,
            }
        );
        customizationMap[cus.name] = doc.$id;
    }

    // 4. Create Menu Items
    const menuMap: Record<string, string> = {};
    for (const item of data.menu) {
        const uploadedImage = await uploadImageToStorage(item.image_url);

        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            ID.unique(),
            {
                name: item.name,
                description: item.description,
                image_url: uploadedImage,
                price: item.price,
                rating: item.rating,
                calories: item.calories,
                protein: item.protein,
                categories: categoryMap[item.category_name],
            }
        );

        menuMap[item.name] = doc.$id;

        // 5. Create menu_customizations
        for (const cusName of item.customization) {
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.menuCustomizationCollectionId,
                ID.unique(),
                {
                    menu: doc.$id,
                    customization: customizationMap[cusName],
                }
            );
        }
    }

    console.log("✅ Seeding complete.");
}

export default seed;