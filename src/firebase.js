// Импорт функций Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  getDoc, 
  query, 
  where 
} from 'firebase/firestore';

// Конфигурация Firebase
// Примечание: Замените этот объект на реальные значения из вашей Firebase консоли
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyC6cGD7bmUK4hCrO_uMJWV5eOhrsFU3NkU",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "luzindiplom.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "luzindiplom",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "luzindiplom.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "65804616943",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:65804616943:web:00e8e6eecee45d500a071a"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация сервисов
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Регистрация
const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Создаем документ пользователя в Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      fullName: '',
      phone: '',
      address: '',
      createdAt: new Date(),
      telegramConnected: false,
      telegramUserId: '',
      role: 'user'
    });
    
    return userCredential.user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Вход
const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Выход
const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Смена пароля пользователя
const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Пользователь не аутентифицирован');
    }
    
    // Повторная аутентификация пользователя перед сменой пароля
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Смена пароля
    await updatePassword(user, newPassword);
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Восстановление пароля
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Получение данных пользователя
const getUserData = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Обновление данных пользователя
const updateUserData = async (userId, data) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, data);
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Добавление посылки
const addPackage = async (userId, packageData) => {
  try {
    const packagesCollectionRef = collection(db, "packages");
    const docRef = await addDoc(packagesCollectionRef, {
      ...packageData,
      userId: userId,
      createdAt: new Date(),
      archived: false
    });
    return docRef.id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Получение посылок пользователя
const getUserPackages = async (userId, archived = false) => {
  try {
    const packagesQuery = query(
      collection(db, "packages"), 
      where("userId", "==", userId),
      where("archived", "==", archived)
    );
    
    const querySnapshot = await getDocs(packagesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Архивирование посылки
const archivePackage = async (packageId, archived = true) => {
  try {
    const packageDocRef = doc(db, "packages", packageId);
    await updateDoc(packageDocRef, { archived });
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Подключение Telegram-уведомлений
const connectTelegramNotifications = async (userId, telegramUserId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { 
      telegramConnected: true,
      telegramUserId: telegramUserId
    });
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Отключение Telegram-уведомлений
const disconnectTelegramNotifications = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { 
      telegramConnected: false,
      telegramUserId: ''
    });
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Добавление данных
const addData = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Получение данных
const getData = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Функции администратора

// Получение всех пользователей (только для админа)
const getAllUsers = async () => {
  try {
    const usersQuery = query(collection(db, "users"));
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Удаление пользователя (только для админа)
const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Создание пользователя администратором
const createUserByAdmin = async (userData) => {
  try {
    // Создаем документ пользователя в Firestore с произвольным ID
    const userRef = doc(collection(db, "users"));
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      telegramConnected: false,
      telegramUserId: '',
      role: userData.role || 'user'
    });
    
    return userRef.id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Получение всех посылок (только для админа)
const getAllPackages = async () => {
  try {
    const packagesQuery = query(collection(db, "packages"));
    const querySnapshot = await getDocs(packagesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Удаление посылки (только для админа)
const deletePackage = async (packageId) => {
  try {
    await deleteDoc(doc(db, "packages", packageId));
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Обновление посылки (только для админа)
const updatePackage = async (packageId, packageData) => {
  try {
    const packageRef = doc(db, "packages", packageId);
    await updateDoc(packageRef, packageData);
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Проверка, является ли пользователь администратором
const checkIsAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().role === 'admin';
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const updatePackageTelegramSettings = async (packageId, settings) => {
  try {
    const packageRef = doc(db, 'packages', packageId);
    await updateDoc(packageRef, {
      telegramNotifications: settings
    });
  } catch (error) {
    console.error('Ошибка при обновлении настроек уведомлений:', error);
    throw error;
  }
};

const allStatuses = [
  'created',
  'in_transit',
  'arrived',
  'delivered',
  'returned',
  'lost',
  'damaged',
  'pending',
  'registered',
  'ready'
];

// Экспорт функций
export {
  auth,
  db,
  storage,
  registerUser,
  loginUser,
  logoutUser,
  changeUserPassword,
  resetPassword,
  getUserData,
  updateUserData,
  addPackage,
  getUserPackages,
  archivePackage,
  connectTelegramNotifications,
  disconnectTelegramNotifications,
  addData,
  getData,
  // Админ функции
  getAllUsers,
  deleteUser,
  createUserByAdmin,
  getAllPackages,
  deletePackage,
  updatePackage,
  checkIsAdmin,
  allStatuses
};
export default app; 

const formatStatus = (status) => {
  switch (status.toLowerCase()) {
    case 'in_transit':
      return 'В пути';
    case 'pending':
      return 'Ожидает';
    case 'registered':
      return 'Зарегистрирована';
    case 'delivered':
      return 'Доставлено';
    case 'ready':
      return 'Готова к получению';
    case 'returned':
      return 'Возвращено';
    default:
      return status;
  }
}; 