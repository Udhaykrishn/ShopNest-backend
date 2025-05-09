export const getPayload = async (data: any) => {
    return {
        id: data._id.toString(),
        role: data.role
    }
}