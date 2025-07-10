
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Sale } from '@/types';

// Déclaration pour TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateInvoicePDF = async (sale: Sale): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Couleurs
  const primaryColor = [147, 51, 234]; // Purple
  const secondaryColor = [99, 102, 241]; // Indigo
  const accentColor = [236, 72, 153]; // Pink

  // En-tête avec dégradé simulé
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo et nom de l'entreprise
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Riziky Beauté', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Votre spécialiste beauté à La Réunion', 20, 35);

  // Informations entreprise (côté droit)
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const companyInfo = [
    '10 Allée des Beryls Bleus',
    '97400 Saint-Denis',
    'La Réunion',
    'Tél: 0692 19 87 01'
  ];
  
  let yPos = 15;
  companyInfo.forEach(line => {
    doc.text(line, pageWidth - 20, yPos, { align: 'right' });
    yPos += 5;
  });

  // Titre FACTURE
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 55, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth / 2, 65, { align: 'center' });

  // Numéro de facture et date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const invoiceNumber = `RB-${sale.id}`;
  const invoiceDate = new Date(sale.date).toLocaleDateString('fr-FR');
  
  doc.text(`N° Facture: ${invoiceNumber}`, 20, 85);
  doc.text(`Date: ${invoiceDate}`, pageWidth - 20, 85, { align: 'right' });

  // Informations client avec encadré moderne
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 100, pageWidth - 40, 45, 'F');
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setLineWidth(1);
  doc.rect(20, 100, pageWidth - 40, 45);

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À:', 25, 115);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(sale.customerName || 'Client', 25, 125);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (sale.customerAddress) {
    doc.text(sale.customerAddress, 25, 133);
  }
  if (sale.customerPhone) {
    doc.text(`Tél: ${sale.customerPhone}`, 25, 140);
  }

  // Tableau des produits
  const tableStartY = 160;
  
  // En-tête du tableau avec style moderne
  doc.autoTable({
    startY: tableStartY,
    head: [['Description', 'Quantité', 'Prix unitaire', 'Total']],
    body: [[
      sale.description,
      sale.quantitySold.toString(),
      `${(sale.sellingPrice / (sale.quantitySold || 1)).toFixed(2)} €`,
      `${sale.sellingPrice.toFixed(2)} €`
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [secondaryColor[0], secondaryColor[1], secondaryColor[2]],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: { top: 8, right: 5, bottom: 8, left: 5 }
    },
    columnStyles: {
      0: { cellWidth: 80, halign: 'left' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });

  // Calcul de la position après le tableau
  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // Section totaux avec design premium
  const totalsStartY = Math.max(finalY, 220);
  
  // Encadré pour les totaux
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(pageWidth - 90, totalsStartY, 70, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL À PAYER', pageWidth - 55, totalsStartY + 10, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(`${sale.sellingPrice.toFixed(2)} €`, pageWidth - 55, totalsStartY + 20, { align: 'center' });

  // Conditions de paiement
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const paymentTerms = [
    'Conditions de paiement: Payable à réception',
    'Merci pour votre confiance !',
    'Cette facture est générée automatiquement.'
  ];
  
  let termsY = totalsStartY + 40;
  paymentTerms.forEach(term => {
    doc.text(term, 20, termsY);
    termsY += 6;
  });

  // Pied de page avec style
  const footerY = pageHeight - 20;
  doc.setFillColor(240, 240, 240);
  doc.rect(0, footerY - 10, pageWidth, 20, 'F');
  
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.text(
    'Riziky Beauté - Votre partenaire beauté de confiance à La Réunion',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Ajout d'éléments décoratifs
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(2);
  doc.line(20, 75, pageWidth - 20, 75);

  // Sauvegarde du PDF
  const fileName = `Facture_${invoiceNumber}_${sale.customerName?.replace(/\s+/g, '_') || 'Client'}.pdf`;
  doc.save(fileName);
};
