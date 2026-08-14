import ejs from 'ejs';
import path from 'path';

export const formatHtml = async (relativeTemplatePath: string, data: Record<string, any>): Promise<string> => {
    try {
        const fullPath = path.join(process.cwd(), relativeTemplatePath);
        const html = await ejs.renderFile(
            fullPath,
            data
        );

        return html;
    } catch (error) {
        console.error("Error rendering EJS template:", error);
        throw error;
    }
};