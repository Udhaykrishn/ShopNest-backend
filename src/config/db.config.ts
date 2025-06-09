import mongoose from 'mongoose';
import { config } from './env.config';
import { POOLSIZE } from "../constants/pool-size.constant"
import { Product } from '@/models/vendors/implements';

export class DatabaseService {
    static async connect(): Promise<void> {
        try {
            const { connection: { host,name } } = await mongoose.connect(config.DATABASE_URL, {
                dbName:"ecommerce",
                maxPoolSize: POOLSIZE.MAX,
                minPoolSize: POOLSIZE.MIN,
            });
            console.log('Connected to MongoDB',host,name);
        } catch (error) {
            console.error('Database connection error:', error);
            process.exit(1);
        }
    }
}