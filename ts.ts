import { Client, Databases, Permission, Role } from 'appwrite';

const client = new Client();
const databases = new Databases(client);

client
    .setEndpoint('https://[YOUR_APPWRITE_ENDPOINT]') // Your Appwrite Endpoint
    .setProject('YOUR_PROJECT_ID'); // Your project ID

const permissions = [
    Permission.read(Role.any()), // Grant read access to all users
    Permission.update(Role.any()), // Grant update access to all users
    Permission.delete(Role.any()) // Grant delete access to all users
];

databases.updateCollection('YOUR_DATABASE_ID', 'YOUR_COLLECTION_ID', permissions)
    .then(response => {
        console.log(response);
    })
    .catch(error => {
        console.error(error);
    });
