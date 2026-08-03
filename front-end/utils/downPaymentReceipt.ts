/* eslint-disable @typescript-eslint/no-explicit-any */

export const handleDownloadReceipt = (item: any) => {
  console.log("handleDownloadReceipt called with item:", item); // Debugging line
  const isPaid = ["PAID", "COMPLETED"].includes(item.status?.toUpperCase());
  if (!isPaid) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to view and print receipt.");
    return;
  }

  // Clean HTML design without box-shadow, using website branding & logo
  const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${item.transactionId}</title>
          <style>
            @media print {
              body { padding: 0; }
              .receipt-box { border: none !important; }
            }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 40px; background-color: #ffffff; }
            .receipt-box { max-width: 750px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .logo-container { display: flex; align-items: center; gap: 10px; }
            .logo-img { height: 40px; width: auto; object-fit: contain; }
            .brand-name1 { font-size: 20px; font-weight: 800; color: #0f172a;  letter-spacing: -0.5px; }
            .brand-name2 { font-size: 20px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: -0.5px; }
            .receipt-title { font-size: 22px; font-weight: 800; color: #2563eb; text-align: right; }
            .receipt-id { font-size: 12px; font-mono: true; color: #64748b; margin-top: 4px; }
            .details-grid { margin-top: 28px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .detail-card { background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #f1f5f9; }
            .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
            .value { font-size: 14px; color: #0f172a; font-weight: 600; }
            .table-container { margin-top: 28px; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { background-color: #f1f5f9; padding: 12px 16px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; }
            td { padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .total-box { margin-top: 24px; padding: 16px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #dbeafe; display: flex; justify-content: space-between; align-items: center; }
            .total-title { font-size: 14px; font-weight: 700; color: #1e40af; }
            .total-amount { font-size: 20px; font-weight: 800; color: #1e40af; }
            .footer { margin-top: 36px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .status-badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: #dcfce7; color: #166534; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div class="logo-container">
                <!-- Replace src with your official website logo URL -->
                <img src="/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
               
                 <span class="brand-name1">
            FixIt<span class="brand-name2">Now</span>
          </span>
              </div>
              <div>
                <div class="receipt-title">PAYMENT RECEIPT</div>
                <div class="receipt-id">Txn: ${item.transactionId}</div>
              </div>
            </div>

            <div class="details-grid">
              <div class="detail-card">
                <div class="label">Date & Time</div>
                <div class="value">${
                  item.paidAt
                    ? new Date(item.paidAt).toLocaleString()
                    : new Date(item.createdAt).toLocaleString()
                }</div>
              </div>
              <div class="detail-card">
                <div class="label">Status</div>
                <div class="value"><span class="status-badge">${item.status}</span></div>
              </div>
              <div class="detail-card">
                <div class="label">Booking ID</div>
                <div class="value">${item.bookingId}</div>
              </div>
              <div class="detail-card">
                <div class="label">Payment Method</div>
                <div class="value">Online / Card Payment</div>
              </div>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Service Details</th>
                    <th>Location</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: #0f172a;">${
                        item.booking?.service?.title || "Service Request"
                      }</div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                        ${item.booking?.service?.description || ""}
                      </div>
                    </td>
                    <td style="color: #475569;">${
                      item.booking?.service?.location || "N/A"
                    }</td>
                    <td style="text-align: right; font-weight: 700; color: #0f172a;">
                      $${item.amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="total-box">
              <span class="total-title">Total Amount Paid</span>
              <span class="total-amount">$${item.amount.toFixed(2)}</span>
            </div>

            <div class="footer">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">Thank you for choosing FixItNow!</p>
              <p style="margin: 0;">For inquiries regarding this invoice, please reach out to support@fixitnow.com</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

  printWindow.document.write(receiptHtml);
  printWindow.document.close();
};
