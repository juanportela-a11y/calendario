import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReporteVia, CorteProgramado, JornadaSaludEsterilizacion, RegistroAuditoria } from '../types';

export function exportViasToCSV(vias: ReporteVia[]) {
  const headers = ['ID', 'Titulo', 'Barrio', 'Direccion', 'Severidad', 'Tipo Daño', 'Estado', 'Cuadrilla Asignada', 'Costo Estimado COP', 'Fecha Reporte', 'Reportado Por'];
  const rows = vias.map(v => [
    v.id_via,
    `"${v.titulo.replace(/"/g, '""')}"`,
    `"${v.barrio}"`,
    `"${v.direccion.replace(/"/g, '""')}"`,
    v.severidad,
    `"${v.tipo_dano}"`,
    v.estado,
    `"${v.cuadrilla_asignada || 'Sin asignar'}"`,
    v.costo_estimado_cop || 0,
    v.fecha_reporte,
    `"${v.reportado_por}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `reporte_malla_vial_purificacion_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCortesToCSV(cortes: CorteProgramado[]) {
  const headers = ['ID', 'Servicio', 'Titulo', 'Sector / Barrios', 'Empresa', 'Estado', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Poblacion Afectada', 'Cuadrilla'];
  const rows = cortes.map(c => [
    c.id_corte,
    c.tipo.toUpperCase(),
    `"${c.titulo.replace(/"/g, '""')}"`,
    `"${c.sector_barrio.replace(/"/g, '""')}"`,
    `"${c.empresa_prestadora}"`,
    c.estado,
    c.fecha_inicio,
    c.hora_inicio,
    c.fecha_estimada_fin,
    c.hora_estimada_fin,
    c.poblacion_afectada_aprox || 0,
    `"${c.cuadrilla_responsable}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `cortes_servicios_purificacion_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAuditLogsToCSV(logs: RegistroAuditoria[]) {
  const headers = ['ID Log', 'Fecha/Hora', 'Funcionario', 'Rol', 'Modulo', 'Accion', 'Descripcion', 'Referencia'];
  const rows = logs.map(l => [
    l.id_log,
    l.timestamp,
    `"${l.funcionario_nombre}"`,
    `"${l.funcionario_rol}"`,
    l.modulo,
    l.accion,
    `"${l.descripcion.replace(/"/g, '""')}"`,
    l.id_referencia || ''
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `bitacora_auditoria_purificacion_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateMunicipalOpsPDF(vias: ReporteVia[], cortes: CorteProgramado[], jornadas: JornadaSaludEsterilizacion[]) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  // Header
  doc.setFillColor(13, 71, 161); // #0D47A1
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ALCALDÍA MUNICIPAL DE PURIFICACIÓN - TOLIMA', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Informe Operativo Territorial y Gestión Comunitaria | Generado: ${dateStr}`, 14, 23);

  // Section: Vías
  doc.setTextColor(13, 71, 161);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Estado de Malla Vial e Infraestructura Urbana', 14, 42);

  const viasTableData = vias.slice(0, 15).map(v => [
    `#${v.id_via}`,
    v.barrio,
    v.tipo_dano,
    v.severidad.toUpperCase(),
    v.estado.toUpperCase(),
    v.cuadrilla_asignada || 'Sin Cuadrilla'
  ]);

  autoTable(doc, {
    startY: 46,
    head: [['ID', 'Barrio', 'Daño', 'Severidad', 'Estado', 'Cuadrilla']],
    body: viasTableData,
    theme: 'striped',
    headStyles: { fillColor: [13, 71, 161] },
    styles: { fontSize: 8 }
  });

  // Section: Cortes
  let nextY = (doc as any).lastAutoTable.finalY + 12;
  if (nextY > 230) {
    doc.addPage();
    nextY = 20;
  }

  doc.setTextColor(13, 71, 161);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Cortes Programados de Servicios Públicos', 14, nextY);

  const cortesTableData = cortes.map(c => [
    `#${c.id_corte}`,
    c.tipo.toUpperCase(),
    c.sector_barrio,
    `${c.fecha_inicio} (${c.hora_inicio})`,
    c.estado.toUpperCase(),
    c.empresa_prestadora
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    head: [['ID', 'Servicio', 'Sector', 'Fecha / Hora', 'Estado', 'Empresa']],
    body: cortesTableData,
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11] }, // Amber
    styles: { fontSize: 8 }
  });

  // Section: Jornadas
  let nextY2 = (doc as any).lastAutoTable.finalY + 12;
  if (nextY2 > 230) {
    doc.addPage();
    nextY2 = 20;
  }

  doc.setTextColor(13, 71, 161);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Jornadas de Zoonosis y Salud Pública', 14, nextY2);

  const jornadasTableData = jornadas.map(j => [
    `#${j.id_jornada}`,
    j.titulo.slice(0, 30) + '...',
    j.barrio,
    j.fecha,
    `${j.cupos_ocupados}/${j.cupos_totales} Cupos`,
    j.estado.toUpperCase()
  ]);

  autoTable(doc, {
    startY: nextY2 + 4,
    head: [['ID', 'Jornada', 'Barrio', 'Fecha', 'Ocupación', 'Estado']],
    body: jornadasTableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald
    styles: { fontSize: 8 }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `PurifiCalendario - Centro de Operaciones Municipales | Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  doc.save(`informe_operativo_purificacion_${new Date().toISOString().slice(0, 10)}.pdf`);
}
