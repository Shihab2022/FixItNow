/* eslint-disable @typescript-eslint/no-explicit-any */
import pdf from 'pdfkit';
import { EmailRenderer } from './emailRenderer';

/**
 * Builds a branded HTML receipt/invoice that is rendered into a PDF
 * attachment for booking-created, payment-success and booking-completed emails.
 *
 * Uses `wkhtmltopdf` under the hood (bundled with the `pdfkit` npm package).
 * Where the system binary is unavailable, callers should catch the error
 * and fall back to sending the email without the attachment.
 */

export interface PdfInvoiceLine {
    label: string;
    value: string;
}

export interface PdfInvoiceData {
    title?: string;
    subtitle?: string;
    lines: PdfInvoiceLine[];
    tableHeaders?: string[];
    tableRows?: Array<Array<{ text: string; align?: 'left' | 'right' }>>;
    totalLabel?: string;
    totalAmount?: string;
    footerNote?: string;
}

const escapeHtml = (value: any): string =>

export const buildInvoiceHtml = (data: PdfInvoiceData): string => {
    const title = data.title || 'FixItNow Invoice';
    const subtitle = data.subtitle || '';
    const lines = (data.lines || []).map(
        (l) => `
            <tr>
                <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; color:#475569; width:42%; font-weight:600;">
                ${escapeHtml(l.label)}
                </td>
                <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; color:#0f172a; font-weight:700;">
                ${escapeHtml(l.value)}
                </td>
            </tr>`
    ).join('');

    const tableHeaders = (data.tableHeaders || []).map(
        (h) => `<th style="background-color:#f1f5f9; padding:12px 14px; font-size:11px; text-transform:uppercase; color:#475569; font-weight:700;">${escapeHtml(h)}</th>`
    ).join('');

    const tableRows = (data.tableRows || []).map(
        (row) => `<tr>${row.map((cell) => `<td style="padding:14px; border-bottom:1px solid #e2e8f0; font-size:13px; text-align:${cell.align || 'left'}; color:#0f172a;">${escapeHtml(cell.text)}</td>`
        ).join('')}</tr>`
    ).join('');

    const tableHtml =
        data.tableHeaders?.length
            ? `<table width="100%" style="border-collapse:collapse; margin-top:8px; text-align:left; font-family:'Inter',Arial,sans-serif; border-radius:8px; overflow:hidden;">
                <thead><tr>${tableHeaders}</tr></thead>
                <tbody>${tableRows}</tbody>
            </table>`
            : '';
return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <style>
                body { font-family: 'Inter', Arial, sans-serif; color:#1e293b; margin:0; padding:40px; background-color:#ffffff; }
                .invoice-box { max-width:720px; margin:0 auto; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; }
                .invoice-header { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color:#ffffff; padding:28px 32px; display:flex; justify-content:space-between; align-items:center; }
                .invoice-brand { font-size:22px; font-weight:800; letter-spacing:-0.5px; }
                .invoice-brand span { color:#60a5fa; }
                .invoice-body { padding:28px 32px; }
                .invoice-title { font-size:20px; font-weight:800; color:#1e3a8a; margin:0 0 4px 0; }
                .invoice-subtitle { font-size:12px; color:#64748b; margin:0 0 20px 0; }
                .meta-table td:first-child { font-weight:600; color:#475569; }
                .total-box { margin-top:24px; padding:16px 20px; background-color:#eff6ff; border:1px solid #dbeafe; border-radius:8px; display:flex; justify-content:space-between; align-items:center; }
                .total-label { font-size:13px; font-weight:700; color:#1e40af; }
                .total-value { font-size:20px; font-weight:800; color:#1e40af; }
                .invoice-footer { margin-top:28px; text-align:center; font-size:11px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:16px; }
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <div class="invoice-header">
                    <span class="invoice-brand">FixIt<span>Now</span></span>
                    <span style="font-size:12px; opacity:0.85;">${escapeHtml(subtitle)}</span>
                </div>
                <div class="invoice-body">
                    <h1 class="invoice-title">${escapeHtml(title)}</h1>
                    <table class="meta-table" style="border-collapse:collapse;">${lines}</table>
                    ${tableHtml}
                    ${data.totalLabel ? `
                        <div class="total-box">
                            <span class="total-label">${escapeHtml(data.totalLabel)}</span>
                            <span class="total-value">${escapeHtml(data.totalAmount || '')}</span>
                        </div>` : ''}
                    ${data.footerNote ? `<p style="font-size:12px; color:#64748b; margin-top:20px;">${escapeHtml(data.footerNote)}</p>` : ''}
                </div>
                <div class="invoice-footer">
                    &copy; ${new Date().getFullYear()} FixItNow. Generated on ${EmailRenderer.formatDate(new Date()}}.
                    For support, reach out to support@fixitnow.com.
                </div>
            </div>
        </body>
        </html>
    `;
};

/**
 * Renders a styled receipt as a PDF buffer. Throws when `wkhtmltopdf`
 * (the system binary used by the `pdfkit` npm package) is unavailable.
 */
export const generatePdfBuffer = async (
    data: PdfInvoiceData
): Promise<Buffer> => {
    const html = buildInvoiceHtml(data);
    const options = {
        encoding: 'UTF-8',
        pageSize: 'A4',
        marginTop: '20mm',
        marginRight: '20mm',
        marginBottom: '20mm',
        marginLeft: '20mm',
    };

    // pdfkit returns a Promise<Buffer> when no callback is provided
    const buffer = await pdf.fromHTML(html, options);
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as any);
/** Builds a booking details invoice (used for booking-created / completed emails) */
export const buildBookingInvoice = (payload: {
    bookingId: string;
    serviceTitle?: string;
    technicianName?: string;
    customerName?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    customerAddress?: string;
    totalPrice?: string;
    status?: string;
    notes?: string;
}): PdfInvoiceData => ({
    title: 'Booking Details',
    subtitle: 'Booking Confirmation',
    lines: [
        { label: 'Booking ID', value: payload.bookingId },
        { label: 'Service', value: payload.serviceTitle || 'N/A' },
        { label: 'Technician', value: payload.technicianName || 'N/A' },
        { label: 'Customer', value: payload.customerName || 'N/A' },
        { label: 'Scheduled Date', value: payload.scheduledDate || 'N/A' },
        { label: 'Scheduled Time', value: payload.scheduledTime || 'N/A' },
        { label: 'Address', value: payload.customerAddress || 'N/A' },
        { label: 'Status', value: payload.status || 'N/A' },
    ],
    tableHeaders: ['Item', 'Amount'],
    tableRows: [
        [{ text: payload.serviceTitle || 'Service', align: 'left' }, { text: payload.totalPrice || '', align: 'right' }],
    ],
    totalLabel: 'Total Amount',
    totalAmount: payload.totalPrice,
    footerNote: payload.notes ? `Notes: ${payload.notes}` : 'Thank you for choosing FixItNow!',
});

/** Builds a payment receipt invoice (used for payment-success emails) */
export const buildPaymentInvoice = (payload: {
    transactionId: string;
    bookingId: string;
    amount: string;
    serviceTitle?: string;
    technicianName?: string;
    scheduledDate?: string;
    status?: string;
}): PdfInvoiceData => ({
    title: 'Payment Receipt',
    subtitle: 'Paid',
    lines: [
        { label: 'Transaction ID', value: payload.transactionId },
        { label: 'Booking ID', value: payload.bookingId },
        { label: 'Service', value: payload.serviceTitle || 'N/A' },
        { label: 'Technician', value: payload.technicianName || 'N/A' },
        { label: 'Date', value: payload.scheduledDate || 'N/A' },
        { label: 'Status', value: payload.status || 'Successful' },
    ],
    tableHeaders: ['Description', 'Amount'],
    tableRows: [
        [{ text: `${payload.serviceTitle || 'Booking payment'} (${payload.bookingId.slice(0, 8)}...)`, align: 'left' }, { text: payload.amount, align: 'right' }],
    ],
    totalLabel: 'Total Amount Paid',
    totalAmount: payload.amount,
    footerNote: 'Thank you for your payment. Your booking has been confirmed.',
});

export const PdfGenerator = {
    generatePdfBuffer,
    buildBookingInvoice,
    buildPaymentInvoice,
    buildInvoiceHtml,
};
export default PdfGenerator;
};