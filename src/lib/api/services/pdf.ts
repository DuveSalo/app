
import { EventInformation } from '../../../types/index';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const downloadEventPDF = async (event: EventInformation, companyName: string): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFont('helvetica');

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  const addWrappedText = (text: string, x: number, startY: number, maxWidth: number): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    let newY = startY;
    if (newY + (lines.length * 7) > pageHeight - margin) {
      doc.addPage();
      newY = margin;
    }
    doc.text(lines, x, newY);
    return newY + (lines.length * 7);
  };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Informe de Evento", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa: ${companyName}`, margin, y);
  y += 8;

  // Parse date as local time to avoid timezone issues
  const dateStr = event.date.includes('T') ? event.date : `${event.date}T00:00:00`;
  const eventDate = new Date(dateStr).toLocaleDateString('es-AR');
  doc.text(`Fecha y Hora: ${eventDate} - ${event.time}`, margin, y);
  y += 8;

  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const addSectionTitle = (title: string, startY: number): number => {
      let newY = startY;
      if (newY > pageHeight - 30) {
          doc.addPage();
          newY = margin;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, newY);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      return newY + 8;
  }

  y = addSectionTitle("Descripción Detallada", y);
  y = addWrappedText(event.description, margin, y, pageWidth - margin * 2);
  y += 5;

  y = addSectionTitle("Acciones Correctivas Propuestas", y);
  y = addWrappedText(event.correctiveActions, margin, y, pageWidth - margin * 2);
  y += 5;

  const validTestimonials = event.testimonials?.filter(t => t?.trim()) || [];
  if (validTestimonials.length > 0) {
    if (y > pageHeight - 40) { doc.addPage(); y = margin; }
    autoTable(doc, {
      startY: y,
      head: [['Testimonios']],
      body: validTestimonials.map(t => [t]),
      theme: 'grid',
      headStyles: { fillColor: '#4A90E2', textColor: 255 },
    });
    const table1 = (doc as typeof doc & { lastAutoTable?: { finalY: number } });
    y = (table1.lastAutoTable?.finalY ?? y) + 10;
  }

  const validObservations = event.observations?.filter(o => o?.trim()) || [];
  if (validObservations.length > 0) {
    if (y > pageHeight - 40) { doc.addPage(); y = margin; }
    autoTable(doc, {
      startY: y,
      head: [['Observaciones']],
      body: validObservations.map(o => [o]),
      theme: 'grid',
      headStyles: { fillColor: '#50E3C2', textColor: 255 },
    });
    const table2 = (doc as typeof doc & { lastAutoTable?: { finalY: number } });
    y = (table2.lastAutoTable?.finalY ?? y) + 10;
  }

  const finalCheckItems = [
    { key: 'usoMatafuegos', label: "Uso de matafuegos y otros elementos de extinción." },
    { key: 'requerimientosServicios', label: "Requerimientos de servicios médicos privados, SAME, bomberos, Defensa Civil, Guardia de auxilio y Policia." },
    { key: 'danoPersonas', label: "Daño a personas." },
    { key: 'danosEdilicios', label: "Daños edilicios." },
    { key: 'evacuacion', label: "Evacuación parcial o total del edificio." },
  ];
  const checkedItems = finalCheckItems.filter(item => event.finalChecks?.[item.key]);

  if (checkedItems.length > 0) {
      y = addSectionTitle("Verificaciones Finales", y);
      checkedItems.forEach(item => {
          y = addWrappedText(`• ${item.label}`, margin + 2, y, pageWidth - (margin * 2) - 2);
          y += 2;
      });
  }

  doc.save(`informe-evento-${event.date}.pdf`);
  return Promise.resolve();
};
