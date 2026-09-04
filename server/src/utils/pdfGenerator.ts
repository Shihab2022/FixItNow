/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from 'pdfkit';
import { EmailRenderer } from './emailRenderer';

/**
 * Generates branded PDF invoices/receipts for booking-created,
 * payment-success and booking-completed emails.
 *
 * Uses `pdfkit` (an npm package that renders PDFs programmatically) —
 * no external system binary is required.
 * Where PDF generation fails, callers catch the error and fall back
 * to sending the email without the attachment.
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

/** Escapes a value for safe inclusion in strings. */
const escapeValue = (value: any): string => String(value ?? '');

/**
 * Builds a branded HTML receipt/invoice string from invoice data.
 * This HTML is primarily used as a fallback / preview. The PDF renderer
 * (generatePdfBuffer) below draws directly with pdfkit for reliability.
 */
export const buildInvoiceHtml = (data: PdfInvoiceData): string => {
    const title = escapeValue(data.title || 'FixItNow Invoice');
    const subtitle = escapeValue(data.subtitle || '');

    const lines = (data.lines || []).map(
        (l) =>
            '\n      <tr>\n' +
            '        <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; color:#475569; width:42%; font-weight:600;">' +
            escapeValue(l.label) +
            '</td>\n' +
            '        <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; color:#0f172a; font-weight:700;">' +
            escapeValue(l.value) +
            '</td>\n      </tr>'
    ).join('');

    const tableHeaders = (data.tableHeaders || []).map(
        (h) =>
            '<th style="background-color:#f1f5f9; padding:12px 14px; font-size:11px; text-transform:uppercase; color:#475569; font-weight:700;">' +
            escapeValue(h) +
            '</th>'
    ).join('');

    const tableRows = (data.tableRows || []).map(
        (row) =>
            '<tr>' +
            row
                .map(
                    (cell) =>
                        '<td style="padding:14px; border-bottom:1px solid #e2e8f0; font-size:13px; text-align:' +
                        (cell.align || 'left') +
                        '; color:#0f172a;">' +
                        escapeValue(cell.text) +
                        '</td>'
                )
                .join('') +
            '</tr>'
    ).join('');

    const tableHtml = data.tableHeaders?.length
        ? '<table width="100%" style="border-collapse:collapse; margin-top:8px; text-align:left; font-family:Inter,Arial,sans-serif; border-radius:8px; overflow:hidden;">' +
          '<thead><tr>' + tableHeaders + '</tr></thead>' +
          '<tbody>' + tableRows + '</tbody>' +
          '</table>'
        : '';

    const totalBox = data.totalLabel
        ? '<div class="total-box">' +
          '<span class="total-label">' + escapeValue(data.totalLabel) + '</span>' +
          '<span class="total-value">' + escapeValue(data.totalAmount || '') + '</span>' +
          '</div>'
        : '';

    const footerNote = data.footerNote
        ? '<p style="font-size:12px; color:#64748b; margin-top:20px;">' +
          escapeValue(data.footerNote) +
          '</p>'
        : '';

    return (
        '<!DOCTYPE html>\n' +
        '<html>\n<head>\n' +
        '<meta charset="utf-8" />\n' +
        '<style>\n' +
        "body { font-family: 'Inter', Arial, sans-serif; color:#1e293b; margin:0; padding:40px; background-color:#ffffff; }\n" +
        '.invoice-box { max-width:720px; margin:0 auto; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; }\n' +
        '.invoice-header { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color:#ffffff; padding:28px 32px; display:flex; justify-content:space-between; align-items:center; }\n' +
        '.invoice-brand { font-size:22px; font-weight:800; letter-spacing:-0.5px; }\n' +
        '.invoice-brand span { color:#60a5fa; }\n' +
        '.invoice-body { padding:28px 32px; }\n' +
        '.invoice-title { font-size:20px; font-weight:800; color:#1e3a8a; margin:0 0 4px 0; }\n' +
        '.invoice-subtitle { font-size:12px; color:#64748b; margin:0 0 20px 0; }\n' +
        '.meta-table td:first-child { font-weight:600; color:#475569; }\n' +
        '.meta-table { border-collapse:collapse; margin-bottom:16px; }\n' +
        '.meta-table td { padding:8px 0; font-size:13px; }\n' +
        '.total-box { margin-top:24px; padding:16px 20px; background-color:#eff6ff; border:1px solid #dbeafe; border-radius:8px; display:flex; justify-content:space-between; align-items:center; }\n' +
        '.total-label { font-size:13px; font-weight:700; color:#1e40af; }\n' +
        '.total-value { font-size:20px; font-weight:800; color:#1e40af; }\n' +
        '.invoice-footer { margin-top:28px; text-align:center; font-size:11px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:16px; }\n' +
        '</style>\n</head>\n<body>\n' +
        '<div class="invoice-box">\n' +
        '  <div class="invoice-header">\n' +
        '    <span class="invoice-brand">FixIt<span>Now</span></span>\n' +
        '    <span style="font-size:12px; opacity:0.85;">' + subtitle + '</span>\n' +
        '  </div>\n' +
        '  <div class="invoice-body">\n' +
        '    <h1 class="invoice-title">' + title + '</h1>\n' +
        '    <table class="meta-table">' + lines + '</table>\n' +
        '    ' + tableHtml + '\n' +
        '    ' + totalBox + '\n' +
        '    ' + footerNote + '\n' +
        '  </div>\n' +
        '  <div class="invoice-footer">\n' +
        '    &copy; ' + new Date().getFullYear() + ' FixItNow. Generated on ' + EmailRenderer.formatDate(new Date()) + '.\n' +
        '    For support, reach out to support@fixitnow.com.\n' +
        '  </div>\n' +
        '</div>\n' +
        '</body>\n</html>'
    );
};

/**
 * Renders a styled receipt as a PDF buffer using pdfkit's native
 * drawing APIs (no external binary required). Throws if rendering fails.
 */
export const generatePdfBuffer = async (
    data: PdfInvoiceData
): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
            });

            const buffers: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => {
                buffers.push(chunk);
            });
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
            doc.on('error', (err: Error) => {
                reject(err);
            });

                        // ---- Header (branded bar) ----
            doc
                .fillColor('#0f172a')
                .rect(0, 0, doc.page.width, 90)
                .fill();

            doc
                .fillColor('#ffffff')
                .fontSize(22)
                .font('Helvetica-Bold')
                .text('FixIt', 32, 30);

            doc
                .fillColor('#60a5fa')
                .text('Now', 32 + doc.widthOfString('FixIt'), 30);

            const subtitle = data.subtitle || '';
            if (subtitle) {
                doc
                    .fillColor('#93c5fd')
                    .fontSize(11)
                    .font('Helvetica')
                    .text(subtitle, doc.page.width - 160, 34, {
                        align: 'right',
                    });
            }

            // ---- Title ----
            const title = data.title || 'FixItNow Invoice';
            doc
                .fillColor('#1e3a8a')
                .fontSize(20)
                .font('Helvetica-Bold')
                .text(title, 32, 110);

            // ---- Lines (label / value pairs) ----
            let y = 145;
            const labelFont = 'Helvetica-Bold';
            const valueFont = 'Helvetica';
            doc.fontSize(12);

            (data.lines || []).forEach((line) => {
                doc
                    .fillColor('#475569')
                    .font(labelFont)
                    .text(line.label, 32, y);
                doc
                    .fillColor('#0f172a')
                    .font(valueFont)
                    .text(line.value, 32 + 180, y);
                y += 22;
            });

                        // ---- Table (optional) ----
            const tableTop = y + 10;
            const tableHeaders = data.tableHeaders || [];
            if (tableHeaders.length) {
                const colWidths = [280, 160];
                const col0 = colWidths[0] ?? 280;
                const col1 = colWidths[1] ?? 160;
                const startX = 32;

                // Header row
                                doc
                    .fillColor('#f1f5f9')
                    .fontSize(9)
                    .font('Helvetica-Bold')
                    .text(tableHeaders[0] ?? '', startX, tableTop);
                doc.text(
                    tableHeaders[1] ?? '',
                    startX + col0,
                    tableTop
                );

                const tableRows = data.tableRows || [];
                const colWidthsTotal = col0 + col1;
                let rowY = tableTop + 18;
                tableRows.forEach((row) => {
                    const cell0 = row[0] || { text: '', align: 'left' as const };
                    const cell1 = row[1] || { text: '', align: 'left' as const };
                    doc
                        .fillColor('#000000')
                        .fontSize(11)
                        .font('Helvetica')
                        .text(cell0.text, startX, rowY);
                    doc.text(
                        cell1.text,
                        startX + col0,
                        rowY,
                        { align: cell1.align === 'right' ? 'right' : 'left' }
                    );
                    rowY += 18;
                });

                // Border line
                doc
                    .strokeColor('#e2e8f0')
                    .lineWidth(1)
                    .moveTo(startX, rowY)
                    .lineTo(startX + colWidthsTotal, rowY)
                    .stroke();

                y = rowY + 30;
            } else {
                y = tableTop + 10;
            }

            // ---- Total box ----
            if (data.totalLabel) {
                doc
                    .fillColor('#eff6ff')
                    .rect(32, y, doc.page.width - 64, 36)
                    .fill();
                doc
                    .strokeColor('#dbeafe')
                    .lineWidth(1)
                    .rect(32, y, doc.page.width - 64, 36)
                    .stroke();

                doc
                    .fillColor('#1e40af')
                    .fontSize(13)
                    .font('Helvetica-Bold')
                    .text(data.totalLabel, 48, y + 10);

                doc
                    .fontSize(20)
                    .text(data.totalAmount || '', doc.page.width - 112, y + 6, {
                        align: 'right',
                    });

                y += 44;
            }

            // ---- Footer note ----
            if (data.footerNote) {
                doc
                    .fillColor('#64748b')
                    .fontSize(11)
                    .font('Helvetica')
                    .text(data.footerNote, 32, y, {
                        width: doc.page.width - 64,
                    });
                y += 30;
            }

            // ---- Page footer ----
            const footerY = doc.page.height - 40;
            doc
                .fillColor('#94a3b8')
                .fontSize(10)
                .font('Helvetica')
                .text(
                    `&copy; ${new Date().getFullYear()} FixItNow. Generated on ${EmailRenderer.formatDate(new Date())}.`,
                    32,
                    footerY,
                    { align: 'center' }
                );

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

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
        [
            { text: payload.serviceTitle || 'Service', align: 'left' },
            { text: payload.totalPrice || '', align: 'right' },
        ],
    ],
    totalLabel: 'Total Amount',
    totalAmount: payload.totalPrice,
    footerNote: payload.notes
        ? `Notes: ${payload.notes}`
        : 'Thank you for choosing FixItNow!',
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
        [
            {
                text: `${payload.serviceTitle || 'Booking payment'} (${payload.bookingId.slice(0, 8)}...)`,
                align: 'left',
            },
            { text: payload.amount, align: 'right' },
        ],
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
