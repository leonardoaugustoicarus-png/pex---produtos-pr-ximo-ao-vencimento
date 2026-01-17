
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, SoldProduct } from '../types';

export const generatePDF = (products: Product[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(200, 0, 0);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 0);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PEX - RELATÓRIO DE VALIDADE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(255, 165, 0);
  doc.text(`GERADO EM: ${new Date().toLocaleString('pt-BR')}`, 105, 30, { align: 'center' });

  const tableRows = products.map(p => [
    p.barcode,
    p.name.toUpperCase(),
    p.quantity.toString(),
    new Date(p.expiryDate).toLocaleDateString('pt-BR'),
    p.daysToExpiry.toString(),
    p.status.toUpperCase(),
    p.registeredBy || '-'
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['CÓDIGO', 'PRODUTO', 'QTD', 'VALIDADE', 'DIAS', 'STATUS', 'MATRÍCULA']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [150, 0, 0], textColor: [255, 255, 0] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 5) {
        const status = data.cell.raw as string;
        if (status.includes('VENCIDO')) {
          doc.setTextColor(255, 0, 0);
          doc.setFont('helvetica', 'bold');
        } else if (status.includes('CRÍTICO')) {
          doc.setTextColor(255, 140, 0);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setTextColor(0, 128, 0);
        }
      }
    },
    styles: { fontSize: 7, cellPadding: 2 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de itens monitorados: ${products.length}`, 14, finalY);

  window.open(doc.output('bloburl'), '_blank');
};

export const generateProductCatalogPDF = (products: Product[]) => {
  const doc = new jsPDF();
  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

  // Header - Cor Azul para "Produtos"
  doc.setFillColor(30, 58, 138); // Blue 900
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PEX - RELATÓRIO DE PRODUTOS', 105, 18, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254);
  doc.text('POWERED BY WANGLER SOFTWARE PARTNER', 105, 26, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`CONSULTA EAN/NOME | GERADO EM: ${new Date().toLocaleString('pt-BR')}`, 105, 34, { align: 'center' });

  // Mapeamento apenas para Código e Nome conforme solicitado
  const tableRows = sortedProducts.map(p => [
    p.barcode || 'S/ CÓDIGO',
    p.name.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['CÓDIGO DE BARRAS (EAN)', 'NOME DO PRODUTO']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    },
    styles: { fontSize: 10, cellPadding: 5 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Total de produtos listados: ${products.length}`, 14, finalY);

  window.open(doc.output('bloburl'), '_blank');
};

export const generateSalesReportPDF = (sales: SoldProduct[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(34, 197, 94); // Green 500
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PEX - RELATÓRIO DE VENDAS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`HISTÓRICO DE SAÍDAS | GERADO EM: ${new Date().toLocaleString('pt-BR')}`, 105, 30, { align: 'center' });

  const tableRows = sales.map(s => [
    new Date(s.saleDate).toLocaleString('pt-BR'),
    s.productName.toUpperCase(),
    s.batch || 'N/A',
    s.quantity.toString(),
    s.sellerId.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['DATA/HORA', 'PRODUTO', 'LOTE', 'QTD', 'MATRÍCULA VENDEDOR']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [21, 128, 61], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 8 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de vendas registradas: ${sales.length}`, 14, finalY);

  window.open(doc.output('bloburl'), '_blank');
};
