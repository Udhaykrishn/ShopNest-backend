import { IOrderService } from "@/services/interface";
import { IInvoiceService } from "@/services/interface/invoice";
import { ORDER } from "@/types/orders";
import { errorResponse } from "@/utils";
import { inject, injectable } from "inversify";
import PDFDocument from "pdfkit";

@injectable()
export class InvoiceService implements IInvoiceService {
    constructor(
        @inject(ORDER.OrderService) private readonly orderService: IOrderService
    ) { }

    async getTemplate(userId: string, orderId: string, res: any): Promise<void> {
        try {
            if (!userId) {
                throw new Error("User not authenticated");
            }
            if (!orderId) {
                throw new Error("Order ID is required");
            }

            const order = await this.orderService.getOrderDetails(userId, orderId);
            if (!order) {
                throw new Error("Order not found or not eligible for invoice");
            }

            const doc = new PDFDocument({
                size: 'A4',
                margin: 0,
                autoFirstPage: true,
                info: {
                    Title: `Invoice-${orderId}`,
                    Author: 'ShopNest',
                }
            });

            doc.pipe(res);

            const pageWidth = 595.28;
            const pageHeight = 841.89;
            const margin = 50;
            const contentWidth = pageWidth - (margin * 2);

            const primaryColor = '#22c55e';
            const textColor = '#333333';
            const accentTextColor = '#555555';
            const cancelledColor = '#ff0000';

            doc.rect(0, 0, pageWidth, 70).fill(primaryColor);

            doc.fillColor('#ffffff')
                .fontSize(26)
                .font('Helvetica-Bold')
                .text('ShopNest', margin, 22);

            doc.fillColor('#ffffff')
                .fontSize(18)
                .font('Helvetica-Bold')
                .text('INVOICE', pageWidth - margin - 80, 22, { align: 'right', width: 80 });

            doc.fillColor('#ffffff')
                .fontSize(10)
                .font('Helvetica')
                .text(orderId, pageWidth - margin - 80, 42, { align: 'right', width: 80 });

            doc.rect(0, 70, pageWidth, pageHeight - 70).fill('#ffffff');

            const sectionTop = 100;
            const colWidth = contentWidth / 2 - 15;

            doc.fillColor(textColor)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('Shipping Address', margin, sectionTop);

            doc.font('Helvetica')
                .fontSize(11)
                .fillColor(accentTextColor)
                .text(order.shippingAddress.name, margin, sectionTop + 25)
                .text(order.shippingAddress.street, margin, sectionTop + 40)
                .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`, margin, sectionTop + 55)
                .text(order.shippingAddress.country, margin, sectionTop + 70);

            const rightColX = margin + colWidth + 30;

            doc.fillColor(textColor)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('Invoice Details', rightColX, sectionTop);

            const detailsStartY = sectionTop + 25;
            const lineHeight = 18;
            const labelX = rightColX;
            const valueX = rightColX + 120;

            function addDetailRow(label: string, value: string, y: number, valueColor = accentTextColor) {
                doc.font('Helvetica')
                    .fontSize(11)
                    .fillColor(accentTextColor)
                    .text(`${label}:`, labelX, y, { width: 110, align: 'left' });

                doc.font('Helvetica')
                    .fillColor(valueColor)
                    .text(value, valueX, y, { width: 150 });
            }

            addDetailRow('Order ID', String(order.orderId), detailsStartY);
            addDetailRow('Invoice Date', new Date().toLocaleDateString('en-IN'), detailsStartY + lineHeight);
            addDetailRow('Order Date', new Date(order.orderedDate).toLocaleDateString('en-IN'), detailsStartY + lineHeight * 2);
            addDetailRow('Order Status', order.status, detailsStartY + lineHeight * 3,
                order.status.toLowerCase() === 'cancelled' ? cancelledColor : accentTextColor);
            addDetailRow('Payment Method', order.paymentMethod, detailsStartY + lineHeight * 4);
            addDetailRow('Payment Status', order.paymentStatus, detailsStartY + lineHeight * 5,
                order.paymentStatus.toLowerCase() === 'cancelled' ? cancelledColor : accentTextColor);

            doc.strokeColor('#e0e0e0')
                .lineWidth(1)
                .moveTo(margin, sectionTop + 130)
                .lineTo(pageWidth - margin, sectionTop + 130)
                .stroke();

            const tableTop = sectionTop + 150;

            const columns = {
                product: { x: margin, width: contentWidth * 0.5 },
                qty: { x: margin + contentWidth * 0.5, width: contentWidth * 0.15 },
                price: { x: margin + contentWidth * 0.65, width: contentWidth * 0.15 },
                status: { x: margin + contentWidth * 0.8, width: contentWidth * 0.2 }
            };

            doc.rect(margin, tableTop - 5, contentWidth, 25).fill('#f5f5f5');

            doc.fillColor(textColor)
                .font('Helvetica-Bold')
                .fontSize(11)
                .text('Product Name', columns.product.x + 5, tableTop + 5, { width: columns.product.width - 10 })
                .text('Qty', columns.qty.x + 5, tableTop + 5, { width: columns.qty.width - 10 })
                .text('Price', columns.price.x + 5, tableTop + 5, { width: columns.price.width - 10 })
                .text('Status', columns.status.x + 5, tableTop + 5, { width: columns.status.width - 10 });

            const rowHeight = 30;
            let currentY = tableTop + 25;
            let subtotal = 0;
            let total = 0;

            doc.lineWidth(0.5)
                .strokeColor('#e0e0e0')
                .moveTo(margin, tableTop + 20)
                .lineTo(margin + contentWidth, tableTop + 20)
                .stroke();

            function formatIndianRupee(amount: number): string {
                return `Rs. ${amount.toLocaleString('en-IN')}`;
            }

            order.orderItems.forEach((item: any, index: number) => {
                const y = currentY + (index * rowHeight);
                const itemPrice = item.price * item.quantity;
                subtotal += itemPrice;
                total = subtotal + order.shippingCost + order.tax

                if (index % 2 === 0) {
                    doc.rect(margin, y - 5, contentWidth, rowHeight).fill('#f9f9f9');
                }

                doc.font('Helvetica')
                    .fontSize(11)
                    .fillColor(textColor)
                    .text(item.productName, columns.product.x + 5, y, { width: columns.product.width - 10 });

                doc.text(item.quantity.toString(), columns.qty.x + 5, y, { width: columns.qty.width - 10 });

                doc.text(formatIndianRupee(itemPrice), columns.price.x + 5, y, { width: columns.price.width - 10 });

                let statusColor = textColor;
                if (item.itemStatus.toLowerCase() === 'cancelled') {
                    statusColor = cancelledColor;
                } else if (item.itemStatus.toLowerCase() === 'returned') {
                    statusColor = '#ff6600';
                }

                doc.fillColor(statusColor)
                    .text(item.itemStatus, columns.status.x + 5, y, { width: columns.status.width - 10 });

                if (index < order.orderItems.length - 1) {
                    doc.strokeColor('#e0e0e0')
                        .moveTo(margin, y + rowHeight - 5)
                        .lineTo(margin + contentWidth, y + rowHeight - 5)
                        .stroke();
                }
            });

            const tableBottom = currentY + (order.orderItems.length * rowHeight) - 5;
            doc.strokeColor('#e0e0e0')
                .moveTo(margin, tableBottom)
                .lineTo(margin + contentWidth, tableBottom)
                .stroke()

            const totalsY = tableBottom + 15;

            doc.font('Helvetica')
                .fillColor(textColor)
                .fontSize(11)
                .text('Subtotal:', margin + contentWidth - 150, totalsY, { width: 80, align: 'right' });

            doc.font('Helvetica-Bold')
                .text(formatIndianRupee(total), margin + contentWidth - 70, totalsY, { width: 70, align: 'right' });

            doc.font('Helvetica')
                .fillColor(textColor)
                .fontSize(11)
                .text('delivery fees:', margin + contentWidth - 150, totalsY + 25 , { width: 80, align: 'right' });

            doc.font("Helvetica-Bold")
                .text(formatIndianRupee(order.shippingCost), margin + contentWidth - 70, totalsY + 25, { width: 70, align: "right" })


            doc.font('Helvetica')
                .fillColor(textColor)
                .fontSize(11)
                .text('tax:', margin + contentWidth - 150, totalsY + 50, { width: 80, align: 'right' });


            doc.font("Helvetica-Bold")
                .text(formatIndianRupee(order.tax), margin + contentWidth - 70, totalsY + 50, { width: 70, align: "right" })

            doc.font('Helvetica-Bold')
                .fillColor(textColor)
                .fontSize(13)
                .text('Total:', margin + contentWidth - 150, totalsY + 75 , { width: 80, align: 'right' });

            doc.font('Helvetica-Bold')
                .fontSize(13)
                .text(formatIndianRupee(subtotal), margin + contentWidth - 70, totalsY + 75, { width: 70, align: 'right' });

            doc.fillColor(primaryColor)
                .fontSize(12)
                .font('Helvetica')
                .text('Thank you for your order!', margin, tableBottom + 200, {
                    align: 'center',
                    width: contentWidth
                });

            const footerY = pageHeight - 80;

            doc.rect(margin - 5, footerY - 5, contentWidth + 10, 50).lineWidth(0.5).stroke();

            doc.fillColor(accentTextColor)
                .fontSize(9)
                .font('Helvetica')
                .text('This is a computer-generated invoice and does not require a signature.', margin, footerY + 10, {
                    align: 'center',
                    width: contentWidth
                });

            doc.fontSize(9)
                .text('For any questions regarding this invoice, please contact support@ShopNest.com', margin, footerY + 25, {
                    align: 'center',
                    width: contentWidth
                });

            doc.end();
        } catch (error: any) {
            throw errorResponse(error.message)
        }
    }
}