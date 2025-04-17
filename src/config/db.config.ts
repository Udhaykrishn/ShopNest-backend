import mongoose from 'mongoose';
import { config } from './env.config';

export class DatabaseService {
    static async connection(): Promise<void> {
        try {
            await mongoose.connect(config.DATABASE_URL, {
                maxPoolSize: 100,
                minPoolSize: 10,
            });
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Database connection error:', error);
            process.exit(1);
        }
    }
}