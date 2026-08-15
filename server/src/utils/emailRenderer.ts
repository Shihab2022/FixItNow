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
        const rawLocale = config.smtp?.currency_locale || 'en-BD';
        const rawCurrency = config.smtp?.currency_code || 'BDT';

        // Sanitize string values from .env (strips stray quotes or commas)
        const locale = rawLocale.replace(/['",]/g, '').trim();
        const currency = rawCurrency.replace(/['",]/g, '').trim();

        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
            }).format(amount || 0);
        } catch (error) {
            console.warn(`[EmailRenderer] Invalid locale/currency (${locale}/${currency}). Falling back to 'en-BD'/'BDT'.`);

            // Safe fallback attempt
            try {
                return new Intl.NumberFormat('en-BD', {
                    style: 'currency',
                    currency: 'BDT',
                }).format(amount || 0);
            } catch {
                return `BDT ${(amount || 0).toFixed(2)}`;
            }
        }
    }

    public static formatDate(date: Date | string | number): string {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return 'Invalid Date';
        }

        const rawLocale = config.smtp?.currency_locale || 'en-BD';
        const rawTimeZone = config.smtp?.timezone || process.env.TIMEZONE || 'Asia/Dhaka';

        // Sanitize inputs
        const locale = rawLocale.replace(/['",]/g, '').trim();
        let timeZone = rawTimeZone.replace(/['",]/g, '').trim();

        // Convert invalid offsets (e.g., GMT+6 or UTC+6) to standard IANA timezone
        if (timeZone.includes('GMT') || timeZone.includes('UTC+6')) {
            timeZone = 'Asia/Dhaka';
        }

        try {
            return new Intl.DateTimeFormat(locale, {
                dateStyle: 'full',
                timeZone: timeZone,
            }).format(parsedDate);
        } catch (error) {
            console.warn(`[EmailRenderer] Invalid timezone/locale (${timeZone}/${locale}). Falling back to 'Asia/Dhaka'.`);

            // Safe fallback attempt
            try {
                return new Intl.DateTimeFormat('en-BD', {
                    dateStyle: 'full',
                    timeZone: 'Asia/Dhaka',
                }).format(parsedDate);
            } catch {
                return parsedDate.toDateString();
            }
        }
    }
}