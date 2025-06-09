import { injectable } from "inversify";
import { OtpType } from "@/constants";
import nodemailer from 'nodemailer';
import { config } from "@/config";
import { IEmailService } from "@/services/interface";

@injectable()
export class EmailService implements IEmailService {
    private readonly transporter: nodemailer.Transporter;
    private readonly fromEmail: string;

    constructor() {
        this.fromEmail = config.GMAIL_APP_ADDRESS;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: this.fromEmail, pass: config.GMAIL_APP_PASSWORD },
            tls: { rejectUnauthorized: false },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 5
        });
    }

    private getCommonStyles() {
        return {
            base: `font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; background-color: #ffffff;`,
            header: `text-align: center; margin-bottom: 30px;`,
            content: `background-color: #f5f5f5; border-radius: 10px; padding: 30px; margin-bottom: 25px;`,
            footer: `border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px; text-align: center;`,
            brandColor: `rgb(53, 228, 62)`,
            year: new Date().getFullYear()
        };
    }

    private getOtpTemplate(type: OtpType, otp: string): { subject: string; html: string } {
        const styles = this.getCommonStyles();
        const templates: Partial<Record<OtpType, { subject: string; html: string }>> = {
            SIGNUP: {
                subject: 'Welcome to ShopNest - Verify Your Email',
                html: `
                    <div style="${styles.base}">
                        <div style="${styles.header}"><h1 style="color:${styles.brandColor};">ShopNest</h1></div>
                        <div style="${styles.content}">
                            <h2 style="text-align: center;">Verify Your Email</h2>
                            <p style="text-align: center;">Please use the verification code below:</p>
                            <div style="background-color: ${styles.brandColor}; padding: 20px; border-radius: 8px; text-align: center;">
                                <span style="color: #ffffff; font-size: 32px; font-weight: bold;">${otp}</span>
                            </div>
                        </div>
                        <div style="${styles.footer}"><p>© ${styles.year} ShopNest. All rights reserved.</p></div>
                    </div>`
            },
            FORGOT_PASSWORD: {
                subject: 'ShopNest - Reset Your Password',
                html: `
                    <div style="${styles.base}">
                        <div style="${styles.header}"><h1 style="color:${styles.brandColor};">ShopNest</h1></div>
                        <div style="${styles.content}">
                            <h2 style="text-align: center;">Reset Your Password</h2>
                            <p style="text-align: center;">Use the code below to reset your password:</p>
                            <div style="background-color: ${styles.brandColor}; padding: 20px; border-radius: 8px; text-align: center;">
                                <span style="color: #ffffff; font-size: 32px; font-weight: bold;">${otp}</span>
                            </div>
                        </div>
                        <div style="${styles.footer}"><p>© ${styles.year} ShopNest. All rights reserved.</p></div>
                    </div>`
            },
            CHANGE_EMAIL: {
                subject: 'ShopNest - Chagne Your Email',
                 html: `
                    <div style="${styles.base}">
                        <div style="${styles.header}"><h1 style="color:${styles.brandColor};">ShopNest</h1></div>
                        <div style="${styles.content}">
                            <h2 style="text-align: center;">Reset Your Password</h2>
                            <p style="text-align: center;">Use the code below to reset your password:</p>
                            <div style="background-color: ${styles.brandColor}; padding: 20px; border-radius: 8px; text-align: center;">
                                <span style="color: #ffffff; font-size: 32px; font-weight: bold;">${otp}</span>
                            </div>
                        </div>
                        <div style="${styles.footer}"><p>© ${styles.year} ShopNest. All rights reserved.</p></div>
                    </div>`
            }
        };
        return templates[type]!;
    }

    private getProductTemplate(type: OtpType, productName: string): { subject: string; html: string } {
        const styles = this.getCommonStyles();
        const templates: Partial<Record<OtpType, { subject: string; html: string }>> = {
            PRODUCT_APPROVED: {
                subject: 'ShopNest - Your Product has been Approved!',
                html: `
                    <div style="${styles.base}">
                        <div style="${styles.header}"><h1 style="color:${styles.brandColor};">ShopNest</h1></div>
                        <div style="${styles.content}">
                            <h2>Congratulations!</h2>
                            <p>Your product <strong>${productName}</strong> has been approved and is now live on our platform.</p>
                        </div>
                        <div style="${styles.footer}"><p>© ${styles.year} ShopNest. All rights reserved.</p></div>
                    </div>`
            },
            PRODUCT_REJECTED: {
                subject: 'ShopNest - Your Product Submission was Rejected',
                html: `
                    <div style="${styles.base}">
                        <div style="${styles.header}"><h1 style="color:${styles.brandColor};">ShopNest</h1></div>
                        <div style="${styles.content}">
                            <h2>Product Submission Update</h2>
                            <p>We regret to inform you that your product <strong>${productName}</strong> was not approved due to potential issues.</p>
                        </div>
                        <div style="${styles.footer}"><p>© ${styles.year} ShopNest. All rights reserved.</p></div>
                    </div>`
            }
        };
        return templates[type]!;
    }

    private getVendorTemplate(type: OtpType): { subject: string; html: string } {
        const styles = this.getCommonStyles();
        const templates: Partial<Record<OtpType, { subject: string; html: string }>> = {
            VENDOR_APPROVED: {
                subject: 'ShopNest - Vendor Account Approved',
                html: `
                    <div style="${styles.base}">
                        <div style="${styles.header}"><h1 style="color:${styles.brandColor};">ShopNest</h1></div>
                        <div style="${styles.content}">
                            <h2>Congratulations!</h2>
                            <p>Your vendor account has been approved. You can now start selling on ShopNest!</p>
                        </div>
                        <div style="${styles.footer}"><p>© ${styles.year} ShopNest. All rights reserved.</p></div>
                    </div>`
            },
            VENDOR_REJECTED: {
                subject: 'ShopNest - Vendor Account Rejected',
                html: `
                    <div style="${styles.base}">
                        <div style="${styles.header}"><h1 style="color:${styles.brandColor};">ShopNest</h1></div>
                        <div style="${styles.content}">
                            <h2>Vendor Account Update</h2>
                            <p>We regret to inform you that your vendor account application was not approved.</p>
                        </div>
                        <div style="${styles.footer}"><p>© ${styles.year} ShopNest. All rights reserved.</p></div>
                    </div>`
            },
        };
        return templates[type]!;
    }

    async sendOtpEmail(email: string, type: OtpType, otp: string): Promise<void> {
        try {
            const template = this.getOtpTemplate(type, otp);
            const mailOptions = this.createMailOptions(email, template);
            const info = await this.transporter.sendMail(mailOptions);
            console.log('OTP Email sent:', info.messageId);
        } catch (error: any) {
            console.error('Failed to send OTP email:', error);
            throw new Error(`Failed to send OTP email: ${error.message}`);
        }
    }

    async sendProductStatusEmail(email: string, type: OtpType, productName: string): Promise<void> {
        try {
            const template = this.getProductTemplate(type, productName);
            const mailOptions = this.createMailOptions(email, template);
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Product Status Email sent:', info.messageId);
        } catch (error: any) {
            console.error('Failed to send product status email:', error);
            throw new Error(`Failed to send product status email: ${error.message}`);
        }
    }

    async sendVendorApprovalEmail(email: string, type: OtpType): Promise<void> {
        try {
            const template = this.getVendorTemplate(type);
            console.log("getting template", template)
            const mailOptions = this.createMailOptions(email, template);
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Vendor Approval Email sent:', info.messageId);
        } catch (error: any) {
            throw new Error(`Failed to send vendor approval email: ${error.message}`);
        }
    }

    private createMailOptions(email: string, template: { subject: string; html: string }) {
        return {
            from: { name: 'ShopNest', address: this.fromEmail },
            to: email,
            subject: template.subject,
            html: template.html,
            headers: {
                'Precedence': 'Bulk',
                'X-Auto-Response-Suppress': 'OOF, AutoReply',
                'List-Unsubscribe': `<mailto:${this.fromEmail}?subject=unsubscribe>`
            }
        };
    }

    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('Email service is ready');
            return true;
        } catch (error) {
            console.error('Email service verification failed:', error);
            return false;
        }
    }
}