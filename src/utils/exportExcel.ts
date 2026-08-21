import { Product } from '../types/product';
import { formatDateBR, getExpirationCalculation, getDaysRemainingLabel } from './dateUtils';

/**
 * Generates and triggers download of an Excel-compatible spreadsheet file
 * containing:
 * - Nome do Produto
 * - Código
 * - Categoria
 * - Data de Validade
 * - Status
 * - Dias Restantes
 */
export function exportProductsToExcel(products: Product[], filename = 'AKI-TEM_Controle_de_Validade.csv'): void {
  // Use semicolon as delimiter for standard Brazilian Portuguese Excel compatibility
  const delimiter = ';';
  
  const headers = [
    'Nome do Produto',
    'Código',
    'Categoria',
    'Data de Validade',
    'Status',
    'Dias Restantes',
  ];

  const escapeCSV = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '""';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const rows = products.map((prod) => {
    const calc = getExpirationCalculation(prod.expirationDate);
    const formattedDate = formatDateBR(prod.expirationDate);
    const daysRemaining = getDaysRemainingLabel(calc.diffDays);
    
    return [
      escapeCSV(prod.name),
      escapeCSV(prod.code),
      escapeCSV(prod.category),
      escapeCSV(formattedDate),
      escapeCSV(calc.statusText),
      escapeCSV(daysRemaining),
    ].join(delimiter);
  });

  // UTF-8 BOM ensures Brazilian characters (ç, ã, é, etc.) display cleanly in Excel
  const csvContent = '\uFEFF' + [headers.join(delimiter), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * HTML Spreadsheet format (.xls) with visual styling and brand colors for Excel
 */
export function exportProductsToStyledXLS(products: Product[]): void {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  let tableRows = '';
  products.forEach((prod) => {
    const calc = getExpirationCalculation(prod.expirationDate);
    const formattedDate = formatDateBR(prod.expirationDate);
    const daysRemaining = getDaysRemainingLabel(calc.diffDays);

    let statusBg = '#ffffff';
    let statusTextColor = '#1e293b';

    if (calc.statusType === 'expired') {
      statusBg = '#fee2e2';
      statusTextColor = '#D93611';
    } else if (calc.statusType === 'today') {
      statusBg = '#ffe4e6';
      statusTextColor = '#F21D44';
    } else if (calc.statusType === 'week') {
      statusBg = '#ffedd5';
      statusTextColor = '#F27F1B';
    } else if (calc.statusType === 'month') {
      statusBg = '#fef9c3';
      statusTextColor = '#854d0e';
    } else {
      statusBg = '#dcfce7';
      statusTextColor = '#166534';
    }

    tableRows += `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 500;">${prod.name}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace;">${prod.code}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${prod.category}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${formattedDate}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; background-color: ${statusBg}; color: ${statusTextColor}; font-weight: 600;">${calc.statusText}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: 500;">${daysRemaining}</td>
      </tr>
    `;
  });

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Controle de Validade</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
        th { background-color: #F21D44; color: #ffffff; padding: 10px; font-weight: bold; text-align: left; border: 1px solid #c71233; }
        .title { font-size: 16pt; font-weight: bold; color: #F21D44; margin-bottom: 4px; }
        .subtitle { font-size: 10pt; color: #64748b; margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <div class="title">AKI-TEM Controle de Validade</div>
      <div class="subtitle">Relatório gerado em: ${currentDate} | BN Creative Digital - Bruno Alberto</div>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>Nome do Produto</th>
            <th>Código</th>
            <th>Categoria</th>
            <th style="text-align: center;">Data de Validade</th>
            <th>Status</th>
            <th style="text-align: center;">Dias Restantes</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `AKI-TEM_Validades_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
