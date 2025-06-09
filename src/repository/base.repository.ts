import { Model, Document, UpdateQuery, FilterQuery } from "mongoose"
import { IBaseRepository } from "./base.repository.interface";

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {

    constructor(protected readonly model: Model<T>) {
    }
    async create(item: Partial<T>): Promise<T> {
        return await this.model.create(item)
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id)
    }

    async findAll(): Promise<T[] | null> {
        return await this.model.find({});
    }

    async update(id: string, update: UpdateQuery<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, update, { new: true })
    }

    async findOne(filtered: FilterQuery<T>): Promise<T | null> {
        return await this.model.findOne(filtered)
    }

    async delete(id: string): Promise<T | null> {
        return await this.model.findByIdAndDelete(id)
    }
}