import { Order, PrinterPaperSize } from '../types';
import { PurchaseOrder, BusinessConfig } from '../features/irm/types';
import { formatCurrency } from './formatters';

// --- CSS STYLES GENERATOR ---
const getPrintStyles = (paperSize: PrinterPaperSize) => {
  let widthCss = '';
  let fontSize = '12px';
  let bodyMargin = '0';
  let fontFamily = "'Roboto Mono', monospace"; // Default for thermal
  
  switch (paperSize) {
    case '58mm':
      widthCss = 'width: 58mm; max-width: 58mm;';
      fontSize = '10px';
      break;
    case '80mm':
      widthCss = 'width: 76mm; max-width: 80mm;'; // Slightly less to prevent overflow
      fontSize = '12px';
      break;
    case 'A4':
      widthCss = 'width: 210mm; max-width: 210mm; padding: 20px;';
      fontSize = '12pt';
      bodyMargin = '10mm';
      break;
    case 'DotMatrix-76mm':
        widthCss = 'width: 76mm; max-width: 76mm;';
        fontSize = '12px';
        fontFamily = "'Courier New', Courier, monospace"; // Impact printer font
        break;
    case 'DotMatrix-Continuous':
        widthCss = 'width: 216mm; max-width: 216mm; padding: 10px;'; // ~8.5 inches
        fontSize = '11pt';
        fontFamily = "'Courier New', Courier, monospace";
        bodyMargin = '5mm';
        break;
  }

  return `
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
    
    @page {
      margin: 0;
      size: auto;
    }
    
    body {
      font-family: ${fontFamily};
      margin: ${bodyMargin};
      padding: 0;
      background: white;
      color: black;
      font-size: ${fontSize};
      line-height: 1.2;
    }

    .container {
      ${widthCss}
      margin: 0 auto;
      background: white;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
    
    .divider {
      border-top: 1px dashed black;
      margin: 8px 0;
      width: 100%;
    }

    .divider-double {
      border-top: 1px double black;
      border-bottom: 1px double black;
      height: 3px;
      margin: 8px 0;
    }

    /* Flex helpers for items */
    .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .col-qty { width: 10%; text-align: left; }
    .col-item { width: 55%; text-align: left; }
    .col-price { width: 35%; text-align: right; }

    /* A4 & Dot Matrix Continuous Specifics */
    .a4-header {
       display: flex;
       justify-content: space-between;
       align-items: flex-start;
       border-bottom: 2px solid black;
       padding-bottom: 10px;
       margin-bottom: 20px;
    }
    
    .a4-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    .a4-table th {
        border-bottom: 1px solid black;
        text-align: left;
        padding: 8px;
    }
    .a4-table td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
    }
  `;
};

// --- SALES RECEIPT GENERATOR ---
export const printReceipt = (
  order: Order, 
  businessConfig: BusinessConfig
) => {
  const paperSize = businessConfig.printerPaperSize || '58mm';
  
  // Determine layout based on paper type
  const isLargeFormat = paperSize === 'A4' || paperSize === 'DotMatrix-Continuous';

  let contentHtml = '';

  if (!isLargeFormat) {
      // --- THERMAL & SMALL IMPACT LAYOUT ---
      contentHtml = `
        <div class="container">
          <div class="text-center">
            <div class="font-bold" style="font-size: 1.2em">${businessConfig.name}</div>
            <div>${businessConfig.address || 'Alamat Outlet'}</div>
            <div>${businessConfig.phone || 'Telp'}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="row">
             <span>${new Date(order.timestamp).toLocaleString()}</span>
             <span>${order.staffName || 'Kasir'}</span>
          </div>
          <div class="row">
             <span>Order: #${order.id.slice(-6)}</span>
             <span>${order.type.toUpperCase()}</span>
          </div>
          ${order.tableNumber ? `<div class="text-left font-bold">Meja: ${order.tableNumber}</div>` : ''}
          ${order.customerName ? `<div class="text-left">Cust: ${order.customerName}</div>` : ''}

          <div class="divider-double"></div>

          ${order.items.map(item => `
            <div style="margin-bottom: 4px;">
               <div style="display:flex; justify-content:space-between;">
                  <span class="font-bold">${item.name}</span>
               </div>
               <div style="display:flex; justify-content:space-between; font-size: 0.9em; color: #333;">
                  <span>${item.quantity} x ${formatCurrency(item.price)}</span>
                  <span>${formatCurrency(item.price * item.quantity)}</span>
               </div>
               ${item.note ? `<div style="font-size:0.8em; font-style:italic;">* ${item.note}</div>` : ''}
            </div>
          `).join('')}

          <div class="divider"></div>

          <div class="row">
            <span>Subtotal</span>
            <span>${formatCurrency(order.total / 1.11)}</span> 
            <!-- Assuming tax included logic for simplicity -->
          </div>
          <div class="row">
            <span>Tax (11%)</span>
            <span>${formatCurrency(order.total - (order.total / 1.11))}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="row font-bold" style="font-size: 1.1em;">
             <span>TOTAL</span>
             <span>${formatCurrency(order.total)}</span>
          </div>

          <div class="divider"></div>
          
          <div class="row">
             <span>Bayar (${order.paymentMethod?.toUpperCase() || 'CASH'})</span>
             <span>${formatCurrency(order.total)}</span>
          </div>

          <div class="text-center" style="margin-top: 15px;">
            <div>${businessConfig.footerMessage || 'Terima Kasih atas Kunjungan Anda'}</div>
            <div style="margin-top:5px; font-size:0.8em;">Powered by SIBOS</div>
          </div>
        </div>
      `;
  } else {
      // --- A4 / DOT MATRIX CONTINUOUS LAYOUT ---
      contentHtml = `
        <div class="container">
           <div class="a4-header">
               <div>
                  <h1 style="margin:0;">INVOICE</h1>
                  <p>#${order.id}</p>
               </div>
               <div class="text-right">
                  <h2 style="margin:0;">${businessConfig.name}</h2>
                  <p>${businessConfig.address || ''}<br>${businessConfig.phone || ''}</p>
               </div>
           </div>

           <div class="row" style="margin-bottom: 20px;">
               <div>
                   <strong>Ditagihkan Kepada:</strong><br>
                   ${order.customerName || 'Walk-in Customer'}<br>
                   ${order.tableNumber ? `Meja: ${order.tableNumber}<br>` : ''}
                   ${new Date(order.timestamp).toLocaleString()}
               </div>
               <div class="text-right">
                   <strong>Status Pembayaran:</strong><br>
                   <span style="font-size:1.2em; font-weight:bold;">${order.paymentStatus?.toUpperCase()}</span><br>
                   Metode: ${order.paymentMethod?.toUpperCase()}
               </div>
           </div>

           <table class="a4-table">
               <thead>
                   <tr>
                       <th>Item</th>
                       <th class="text-center">Qty</th>
                       <th class="text-right">Harga Satuan</th>
                       <th class="text-right">Total</th>
                   </tr>
               </thead>
               <tbody>
                   ${order.items.map(item => `
                       <tr>
                           <td>
                               <strong>${item.name}</strong>
                               ${item.note ? `<br><small>Note: ${item.note}</small>` : ''}
                           </td>
                           <td class="text-center">${item.quantity}</td>
                           <td class="text-right">${formatCurrency(item.price)}</td>
                           <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
                       </tr>
                   `).join('')}
               </tbody>
               <tfoot>
                   <tr>
                       <td colspan="3" class="text-right"><strong>Subtotal</strong></td>
                       <td class="text-right">${formatCurrency(order.total / 1.11)}</td>
                   </tr>
                   <tr>
                       <td colspan="3" class="text-right"><strong>Pajak (11%)</strong></td>
                       <td class="text-right">${formatCurrency(order.total - (order.total / 1.11))}</td>
                   </tr>
                   <tr style="font-size: 1.2em;">
                       <td colspan="3" class="text-right"><strong>TOTAL</strong></td>
                       <td class="text-right"><strong>${formatCurrency(order.total)}</strong></td>
                   </tr>
               </tfoot>
           </table>

           <div style="margin-top: 40px; text-align: center; color: #666;">
               <p>${businessConfig.footerMessage || 'Terima kasih telah berbelanja di tempat kami.'}</p>
           </div>
        </div>
      `;
  }
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Struk</title>
          <style>${getPrintStyles(paperSize)}</style>
        </head>
        <body>${contentHtml}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // Use timeout to ensure content is rendered before printing
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
  }
};


// --- PURCHASE ORDER GENERATOR (Optimized for A4/Continuous) ---
export const printPurchaseOrder = (
    po: PurchaseOrder, 
    businessConfig: BusinessConfig
) => {
    const paperSize = businessConfig.printerPaperSize;
    // Assume PO uses Large format unless specifically small
    const isSmallFormat = paperSize === '58mm' || paperSize === 'DotMatrix-76mm';
    const finalPaperSize = isSmallFormat ? paperSize : (paperSize === 'DotMatrix-Continuous' ? 'DotMatrix-Continuous' : 'A4');
    
    let contentHtml = `
      <div class="container">
         <div class="a4-header" style="border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
             <div>
                <h1 style="margin:0;">PURCHASE ORDER</h1>
                <p style="font-size: 1.2em; font-weight: bold;">${po.id}</p>
                <p>Status: ${po.status.toUpperCase()}</p>
             </div>
             <div class="text-right">
                <h2 style="margin:0;">${businessConfig.name}</h2>
                <p>${businessConfig.address || 'Alamat Kantor'}<br>${businessConfig.phone || ''}</p>
             </div>
         </div>

         <div style="display:flex; justify-content:space-between; margin-bottom: 30px;">
             <div style="border: 1px solid #ccc; padding: 10px; width: 45%;">
                 <strong>KEPADA SUPPLIER:</strong><br>
                 <span style="font-size:1.1em; font-weight:bold;">${po.supplierName}</span><br>
                 ID: ${po.supplierId}
             </div>
             <div style="border: 1px solid #ccc; padding: 10px; width: 45%;">
                 <strong>DETAIL ORDER:</strong><br>
                 Tanggal: ${new Date(po.orderDate).toLocaleDateString()}<br>
                 Dibuat Oleh: ${po.createdBy || '-'}<br>
                 Tanggal Cetak: ${new Date().toLocaleDateString()}
             </div>
         </div>

         <table class="a4-table" style="width:100%; border-collapse:collapse;">
             <thead>
                 <tr style="background:#f0f0f0;">
                     <th style="padding:10px; border:1px solid #000;">No</th>
                     <th style="padding:10px; border:1px solid #000;">Nama Barang</th>
                     <th style="padding:10px; border:1px solid #000; text-align:center;">Qty</th>
                     <th style="padding:10px; border:1px solid #000; text-align:center;">Satuan</th>
                     <th style="padding:10px; border:1px solid #000; text-align:right;">Est. Harga</th>
                     <th style="padding:10px; border:1px solid #000; text-align:right;">Subtotal</th>
                 </tr>
             </thead>
             <tbody>
                 ${po.items.map((item, idx) => `
                     <tr>
                         <td style="padding:8px; border:1px solid #ccc; text-align:center;">${idx + 1}</td>
                         <td style="padding:8px; border:1px solid #ccc;">${item.ingredientName}</td>
                         <td style="padding:8px; border:1px solid #ccc; text-align:center;">${item.quantity}</td>
                         <td style="padding:8px; border:1px solid #ccc; text-align:center;">${item.unit}</td>
                         <td style="padding:8px; border:1px solid #ccc; text-align:right;">${formatCurrency(item.cost)}</td>
                         <td style="padding:8px; border:1px solid #ccc; text-align:right;">${formatCurrency(item.cost * item.quantity)}</td>
                     </tr>
                 `).join('')}
             </tbody>
             <tfoot>
                 <tr>
                     <td colspan="5" style="padding:10px; border:1px solid #000; text-align:right; font-weight:bold;">TOTAL ESTIMASI</td>
                     <td style="padding:10px; border:1px solid #000; text-align:right; font-weight:bold;">${formatCurrency(po.totalEstimated)}</td>
                 </tr>
             </tfoot>
         </table>

         <div style="margin-top: 50px; display: flex; justify-content: space-between;">
             <div style="text-align:center; width: 200px;">
                 <p>Disetujui Oleh,</p>
                 <br><br><br>
                 <p>( __________________ )</p>
                 <p>Manager</p>
             </div>
             <div style="text-align:center; width: 200px;">
                 <p>Dibuat Oleh,</p>
                 <br><br><br>
                 <p>( ${po.createdBy || '__________________'} )</p>
                 <p>Staff</p>
             </div>
         </div>
         
         <div style="margin-top: 30px; font-size: 0.8em; color: #666; text-align: center;">
             Dokumen ini dibuat secara otomatis oleh SIBOS.
         </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`<html><head><title>PO ${po.id}</title><style>${getPrintStyles(finalPaperSize)}</style></head><body>${contentHtml}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
};
