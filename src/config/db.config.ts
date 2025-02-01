import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { env } from './env.config';

@injectable()
export class DatabaseService {
    async connect(): Promise<void> {
        try {
            await mongoose.connect(env.DATABASE_URL);
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Database connection error:', error);
            process.exit(1);
        }
    }
}