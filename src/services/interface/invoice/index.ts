export interface IInvoiceService {
    getTemplate(userId: string, orderId: string,response:any): Promise<void>
}