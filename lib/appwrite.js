import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.frb.aora",
  projectId: "6623c2f81e0292ff506e",
  databaseId: "6623c5952db4918d7917",
  userCollectionId: "6623c60ea78dc1db76d0",
  videoCollectionId: "6623c647884dbd46a464",
  storageId: "662768c2408e0d882195",
};

const { endpoint, platform, projectId, databaseId, userCollectionId, videoCollectionId, storageId } = config;

// Init your react-native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projectId) // Your project ID
  .setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Register User

// export const createUser = ({ username, email, password }) => {
//   account.create(ID.unique(), email, password, username).then(
//     function (response) {
//       console.log(response);
//     },
//     function (error) {
//       console.log(error);
//     }
//   );
// };
export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);

    if (!newAccount) throw Error;
    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(config.databaseId, config.userCollectionId, ID.unique(), {
      accountId: newAccount.$id,
      email,
      username,
      avatar: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;
    const currentUser = await databases.listDocuments(config.databaseId, config.userCollectionId, [Query.equal("accountId", currentAccount.$id)]);
    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};
export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.orderDesc("$createdAt", Query.limit(7))]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};
export const searchPost = async (query) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.search("title", query)]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};
export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.equal("creator", userId)]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, "top", 100);
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const uploadFile = async (file, type) => {
  if (!file) return;
  const asset = { name: file.fileName, type: file.mimeType, size: file.fileSize, uri: file.uri };

  try {
    const uploadedFile = await storage.createFile(storageId, ID.unique(), asset);
    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([uploadFile(form.thumbnail, "image"), uploadFile(form.video, "video")]);
    const newPost = await databases.createDocument(databaseId, videoCollectionId, ID.unique(), {
      title: form.title,
      thumbnail: thumbnailUrl,
      video: videoUrl,
      prompt: form.prompt,
      creator: form.userId,
    });

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};

// export async function getCurrentUser() {
//   try {
//     const currentAccount = await account.get();
//     if (!currentAccount) throw Error;
//     const currentUser = await databases.listDocuments(config.databaseId, config.userCollectionId, [Query.equal("accountId", currentAccount.$id)]);

//     if (!currentUser) throw Error;

//     return currentUser.documents[0];
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// }
