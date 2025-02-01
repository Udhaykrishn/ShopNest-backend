import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { config } from './env.config';

@injectable()
export class DatabaseService {
    async connect(): Promise<void> {
        try {
            await mongoose.connect(config.DATABASE_URL);
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Database connection error:', error);
            process.exit(1);
        }
    }
}