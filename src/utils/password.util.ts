import argon2 from "argon2"

export const passwordToBeHash = async (password: string): Promise<string> => {
    return await argon2.hash(password)
}

export const hashToBePassword = async (hashed: string, password: string): Promise<boolean> => {
    return await argon2.verify(hashed, password)
}