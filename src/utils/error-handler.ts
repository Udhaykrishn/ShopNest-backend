import { errorResponse } from "./api-respnose.utils";

export async function handleAsync<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        throw errorResponse(error.message)
    }
}