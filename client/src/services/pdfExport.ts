import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EventFullDetail } from '../types';

interface AutoTableDoc extends jsPDF {
  lastAutoTable?: { finalY: number };
}

export function exportEventToPDF(event: EventFullDetail) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = event.currency || 'INR';

  // 1. Header Banner
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENTPILOT AI', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('GenAI-Powered Event Planning Portfolio & Master Itinerary', 14, 24);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 160, 24);

  // 2. Event Overview Card
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(event.title, 14, 44);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  const leftCol = 14;
  const midCol = 80;
  const rightCol = 145;
  let currentY = 52;

  doc.text(`Event Type: ${event.event_type.toUpperCase()}`, leftCol, currentY);
  doc.text(`Date: ${event.event_date} ${event.start_time ? `(${event.start_time})` : ''}`, midCol, currentY);
  doc.text(`Guest Count: ${event.guest_count} attendees`, rightCol, currentY);

  currentY += 6;
  doc.text(`Location: ${event.location} (${event.indoor_outdoor})`, leftCol, currentY);
  doc.text(`Total Budget: ${currency} ${Number(event.budget).toLocaleString()}`, midCol, currentY);
  doc.text(`Total Estimated: ${currency} ${event.metrics.totalEstimated.toLocaleString()}`, rightCol, currentY);

  currentY += 10;
  if (event.ai_summary) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, currentY, 182, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text('AI EXECUTIVE STRATEGY SUMMARY', 18, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(event.ai_summary, 174);
    doc.text(splitSummary.slice(0, 2), 18, currentY + 11);

    currentY += 24;
  }

  // 3. Itemized Budget Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('1. ITEMIZED BUDGET BREAKDOWN', 14, currentY);

  const budgetRows = event.budget_items.map(b => [
    b.category,
    b.name,
    `${currency} ${Number(b.estimated_cost).toLocaleString()}`,
    `${currency} ${Number(b.actual_cost).toLocaleString()}`,
    b.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Category', 'Description / Item', 'Estimated', 'Actual', 'Status']],
    body: budgetRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 70 },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 24, halign: 'center' },
    },
    foot: [[
      'Total',
      `${event.budget_items.length} items`,
      `${currency} ${event.metrics.totalEstimated.toLocaleString()}`,
      `${currency} ${event.metrics.totalActual.toLocaleString()}`,
      `Bal: ${currency} ${event.metrics.remainingBalance.toLocaleString()}`
    ]],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
  });

  // 4. Timeline & Tasks Table
  const finalY1 = ((doc as AutoTableDoc).lastAutoTable?.finalY ?? 30) + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('2. PREPARATION TIMELINE & TASK CHECKLIST', 14, finalY1);

  const taskRows = event.tasks.map(t => [
    t.due_date || (t.days_before_event !== undefined ? `T-${t.days_before_event} days` : 'TBD'),
    t.title,
    t.category,
    t.priority.toUpperCase(),
    t.status === 'completed' ? 'DONE [X]' : t.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: finalY1 + 4,
    head: [['Target Date', 'Milestone / Action Item', 'Category', 'Priority', 'Status']],
    body: taskRows,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 78 },
      2: { cellWidth: 28 },
      3: { cellWidth: 24, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
    },
  });

  // 5. Vendor Checklist Table
  if (event.vendors && event.vendors.length > 0) {
    const finalY2 = ((doc as AutoTableDoc).lastAutoTable?.finalY ?? 30) + 10;
    if (finalY2 > 240) {
      doc.addPage();
    }
    const currentY2 = finalY2 > 240 ? 20 : finalY2;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('3. VENDOR QUOTATION & CONTACT DIRECTORY', 14, currentY2);

    const vendorRows = event.vendors.map(v => [
      v.category,
      v.name,
      v.contact_phone || v.contact_name || 'N/A',
      `${currency} ${Number(v.quoted_amount > 0 ? v.quoted_amount : v.estimated_budget).toLocaleString()}`,
      v.booking_status.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: currentY2 + 4,
      head: [['Category', 'Vendor Name', 'Contact', 'Quote/Budget', 'Booking Status']],
      body: vendorRows,
      theme: 'striped',
      headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 62 },
        2: { cellWidth: 40 },
        3: { cellWidth: 26, halign: 'right' },
        4: { cellWidth: 22, halign: 'center' },
      },
    });
  }

  // 6. Themes & Recommendations on new page if needed
  if (event.ideas && event.ideas.length > 0) {
    const finalY3 = ((doc as AutoTableDoc).lastAutoTable?.finalY ?? 30) + 10;
    let currentY3 = finalY3;
    if (finalY3 > 220) {
      doc.addPage();
      currentY3 = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('4. PERSONALIZED THEMES, MENUS & RECOMMENDATIONS', 14, currentY3);

    const ideaRows = event.ideas.map(i => [
      i.type.toUpperCase(),
      i.title,
      i.description,
    ]);

    autoTable(doc, {
      startY: currentY3 + 4,
      head: [['Type', 'Concept Title', 'Details & Notes']],
      body: ideaRows,
      theme: 'plain',
      headStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 50, fontStyle: 'bold' },
        2: { cellWidth: 102 },
      },
    });
  }

  // Save the PDF file
  const filename = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_EventPilot_Plan.pdf`;
  doc.save(filename);
}
