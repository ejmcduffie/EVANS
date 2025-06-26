import { initDb } from './fileDb';

export const connectToDB = async () => {
  try {
    await initDb();
    console.log('Connected to file-based database');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const disconnectFromDB = async () => {
  // No need to disconnect from file-based storage
  return true;
};