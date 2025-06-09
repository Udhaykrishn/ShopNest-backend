import { Document } from 'mongoose'
import { IBaseRepository } from '@/repository/base.repository.interface'

export interface IAdminAuthRepository<T extends Document> extends IBaseRepository<T> {
   
}