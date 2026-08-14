import ejs from 'ejs';
import path from 'path';
import { env } from '../config/env.config';

export class EmailRenderer {
    private static templatesDir = path.join(process.cwd(), 'src', 'templates');

    public static async render(templateName: string, data: Record<string, any>): Promise<string> {
        const filePath = path.join(this.templatesDir, `${templateName}.ejs`);
        const payload = {
            ...data,
            baseUrl: env.FRONTEND_URL,
        };

        return new Promise((resolve, reject) => {
            ejs.renderFile(filePath, payload, { root: this.templatesDir }, (err, str) => {
                if (err) {
                    return reject(err);
                }
                resolve(str);
            });
        });
    }

    public static formatCurrency(amount: number): string {
        return new Intl.NumberFormat(env.CURRENCY_LOCALE, {
            style: 'currency',
            currency: env.CURRENCY_CODE,
        }).format(amount);
    }

    public static formatDate(date: Date): string {
        return new Intl.DateTimeFormat(env.CURRENCY_LOCALE, {
            dateStyle: 'full',
            timeZone: env.TIMEZONE,
        }).format(new Date(date));
    }
}