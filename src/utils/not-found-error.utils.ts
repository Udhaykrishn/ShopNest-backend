export class NotFoundError extends Error {
    constructor(entity: string) {
        super(`${entity} not found`);
        this.name = "NotFoundError";
    }
}

export const validateExists = <T>(value: T | null | undefined, entity: string): T => {
    if (!value) {
        throw new NotFoundError(entity);
    }
    return value;
};