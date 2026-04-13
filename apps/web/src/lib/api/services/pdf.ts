import { EventInformation } from '../../../types/index';

interface AutoTableDoc {
  lastAutoTable?: { finalY: number };
}

// App design tokens (from globals.css :root)
const C = {
  background: [255, 255, 255] as [number, number, number], // #ffffff
  foreground: [9, 9, 11] as [number, number, number], // #09090b
  primary: [24, 24, 27] as [number, number, number], // #18181b
  muted: [244, 244, 245] as [number, number, number], // #f4f4f5
  mutedFg: [113, 113, 122] as [number, number, number], // #71717a
  border: [228, 228, 231] as [number, number, number], // #e4e4e7
};

export const downloadEventPDF = async (
  event: EventInformation,
  companyName: string
): Promise<void> => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const ml = 16; // margin left/right
  const cw = pageW - ml * 2; // content width
  const footerH = 12;
  const bodyBottom = pageH - footerH;

  let y = 16;

  // ─── Helpers ──────────────────────────────────────────────────

  const newPage = () => {
    addFooter();
    doc.addPage();
    y = 16;
  };

  const checkY = (needed: number) => {
    if (y + needed > bodyBottom) newPage();
  };

  const addFooter = () => {
    const p = (doc as unknown as { getNumberOfPages?: () => number }).getNumberOfPages?.() ?? 1;
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(ml, pageH - footerH, pageW - ml, pageH - footerH);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.mutedFg);
    doc.text('Escuela Segura · Informe de Evento', ml, pageH - 4.5);
    doc.text(`Página ${p}`, pageW - ml, pageH - 4.5, { align: 'right' });
  };

  // ─── Document header ──────────────────────────────────────────

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...C.primary);
  doc.text('Informe de Evento', ml, y);
  y += 9;

  // Company + date row
  const [yr, mo, da] = event.date.split('T')[0].split('-').map(Number);
  const dateStr = `${String(da).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${yr}`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.mutedFg);
  doc.text(companyName, ml, y);
  doc.text(`${dateStr}  ·  ${event.time} hs`, pageW - ml, y, { align: 'right' });
  y += 8;

  // Header divider
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.4);
  doc.line(ml, y, pageW - ml, y);
  y += 10;

  // ─── Section helpers ──────────────────────────────────────────

  const sectionTitle = (title: string) => {
    checkY(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.primary);
    doc.text(title, ml, y);
    y += 6;
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(ml, y, pageW - ml, y);
    y += 5;
  };

  const bodyText = (text: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...C.foreground);
    const lines = doc.splitTextToSize(text, cw);
    const h = lines.length * 5.5;
    checkY(h);
    doc.text(lines, ml, y);
    y += h;
  };

  const spacer = () => {
    y += 8;
  };

  // ─── Content ──────────────────────────────────────────────────

  sectionTitle('Descripción Detallada');
  bodyText(event.description);
  spacer();

  sectionTitle('Acciones Correctivas Propuestas');
  bodyText(event.correctiveActions);

  if (event.physicalEvidenceDescription?.trim()) {
    spacer();
    sectionTitle('Evidencias Físicas Disponibles');
    bodyText(event.physicalEvidenceDescription);
  }

  const validTestimonials = event.testimonials?.filter((t) => t?.trim()) ?? [];
  if (validTestimonials.length > 0) {
    spacer();
    sectionTitle('Testimonios');
    checkY(30);
    autoTable(doc, {
      startY: y,
      head: [['#', 'Testimonio']],
      body: validTestimonials.map((t, i) => [i + 1, t]),
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        textColor: C.foreground,
        lineColor: C.border,
        lineWidth: 0.3,
        cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      },
      headStyles: {
        fillColor: C.muted,
        textColor: C.primary,
        fontStyle: 'bold',
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', textColor: C.mutedFg },
        1: { cellWidth: cw - 10 },
      },
      margin: { left: ml, right: ml },
    });
    y = ((doc as unknown as AutoTableDoc).lastAutoTable?.finalY ?? y) + 8;
  }

  const validObservations = event.observations?.filter((o) => o?.trim()) ?? [];
  if (validObservations.length > 0) {
    spacer();
    sectionTitle('Observaciones');
    checkY(30);
    autoTable(doc, {
      startY: y,
      head: [['#', 'Observación']],
      body: validObservations.map((o, i) => [i + 1, o]),
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        textColor: C.foreground,
        lineColor: C.border,
        lineWidth: 0.3,
        cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      },
      headStyles: {
        fillColor: C.muted,
        textColor: C.primary,
        fontStyle: 'bold',
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', textColor: C.mutedFg },
        1: { cellWidth: cw - 10 },
      },
      margin: { left: ml, right: ml },
    });
    y = ((doc as unknown as AutoTableDoc).lastAutoTable?.finalY ?? y) + 8;
  }

  const finalCheckItems = [
    { key: 'usoMatafuegos', label: 'Uso de matafuegos y otros elementos de extinción.' },
    {
      key: 'requerimientosServicios',
      label:
        'Requerimientos de servicios médicos privados, SAME, bomberos, Defensa Civil, Guardia de auxilio y Policía.',
    },
    { key: 'danoPersonas', label: 'Daño a personas.' },
    { key: 'danosEdilicios', label: 'Daños edilicios.' },
    { key: 'evacuacion', label: 'Evacuación parcial o total del edificio.' },
  ];
  const checkedItems = finalCheckItems.filter((item) => event.finalChecks?.[item.key]);

  if (checkedItems.length > 0) {
    spacer();
    sectionTitle('Verificaciones Finales');
    checkedItems.forEach((item) => {
      const lines = doc.splitTextToSize(item.label, cw - 8);
      const h = lines.length * 5.5 + 2;
      checkY(h);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...C.mutedFg);
      doc.text('✓', ml, y);
      doc.setTextColor(...C.foreground);
      doc.text(lines, ml + 6, y);
      y += h;
    });
  }

  // Footer on last page
  addFooter();

  doc.save(`informe-evento-${event.date}.pdf`);
};
