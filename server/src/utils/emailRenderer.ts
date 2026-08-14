import ejs from 'ejs';
import path from 'path';
import config from '../config';

export class EmailRenderer {
    private static templatesDir = path.join(process.cwd(), 'src', 'templates');

    public static async render(templateName: string, data: Record<string, any>): Promise<string> {
        const filePath = path.join(this.templatesDir, `${templateName}.ejs`);
        const payload = {
            ...data,
            baseUrl: config.front_end_base_url,
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
        return new Intl.NumberFormat(config.smtp.currency_locale, {
            style: 'currency',
            currency: config.smtp.currency_code,
        }).format(amount);
    }

    public static formatDate(date: Date): string {
        return new Intl.DateTimeFormat(config.smtp.currency_locale, {
            dateStyle: 'full',
            timeZone: config.smtp.timezone,
        }).format(new Date(date));
    }
}