const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

function buildUserManualPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;
  const contentWidth = 174; // 210 - 36

  // Paleta institucional Purificación
  const primaryColor = [13, 71, 161];    // #0D47A1 Azul Institucional
  const secondaryColor = [37, 99, 235];  // #2563EB Azul Purificación
  const accentGold = [217, 119, 6];      // #D97706 Ámbar / Dorado
  const bgLight = [248, 250, 252];       // Slate 50
  const textDark = [30, 41, 59];         // Slate 800
  const textMuted = [100, 116, 139];     // Slate 500
  const borderColor = [226, 232, 240];   // Slate 200

  // Helper para tablas seguras
  function safeTable(options) {
    const opts = {
      margin: { left: marginX, right: marginX },
      tableWidth: contentWidth,
      styles: {
        fontSize: 8.5,
        cellPadding: 2.8,
        overflow: 'linebreak',
        textColor: textDark,
        ...(options.styles || {})
      },
      ...options
    };
    autoTable(doc, opts);
  }

  // ==========================================
  // PÁGINA 1: PORTADA OFICIAL
  // ==========================================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 115, 'F');

  doc.setFillColor(...accentGold);
  doc.rect(0, 115, pageWidth, 5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('REPÚBLICA DE COLOMBIA • DEPARTAMENTO DEL TOLIMA', pageWidth / 2, 25, { align: 'center' });
  doc.setFontSize(14);
  doc.text('ALCALDÍA MUNICIPAL DE PURIFICACIÓN', pageWidth / 2, 33, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(224, 242, 254);
  doc.text('Secretaría General y de Gobierno • Oficina de Tecnologías y Participación Cívica', pageWidth / 2, 40, { align: 'center' });

  // Emblema circular institucional
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.circle(pageWidth / 2, 63, 13, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('P', pageWidth / 2, 67.5, { align: 'center' });
  doc.setFontSize(7);
  doc.text('TOLIMA', pageWidth / 2, 72.5, { align: 'center' });

  // Título del aplicativo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('PURIFICALENDARIO', pageWidth / 2, 92, { align: 'center' });
  doc.setFontSize(11.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(254, 243, 199);
  doc.text('Plataforma Integral de Agenda Digital y Gestión Ciudadana', pageWidth / 2, 100, { align: 'center' });

  // Título del Manual
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('MANUAL DE USUARIO OFICIAL', pageWidth / 2, 142, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...textDark);
  doc.text('Guía Integral de Consulta, Reporte de Servicios Públicos y Participación Comunitaria', pageWidth / 2, 150, { align: 'center' });

  // Ficha técnica en portada
  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(marginX, 168, contentWidth, 68, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('FICHA TÉCNICA DEL DOCUMENTO', marginX + 8, 178);

  const metaItems = [
    ['Código de Referencia:', 'MAN-PURIFI-2026-V1.0', 'Fecha de Publicación:', 'Año 2026'],
    ['Entidad Responsable:', 'Alcaldía de Purificación', 'Estado Documental:', 'Oficial / Vigente'],
    ['Población Objetivo:', 'Comunidad Urbana, Veredal y Turistas', 'Modalidad:', 'Web Responsive & PWA Móvil'],
    ['Servicios Integrados:', 'Agenda, Reporte de Fallas, PurifiPuntos, Alertas y Emergencias']
  ];

  let metaY = 186;
  doc.setFontSize(8.5);
  metaItems.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.text(row[0], marginX + 8, metaY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text(row[1], marginX + 48, metaY);

    if (row[2]) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textDark);
      doc.text(row[2], marginX + 96, metaY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(row[3], marginX + 134, metaY);
    }
    metaY += 9;
  });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...textMuted);
  doc.text('Purificación, Tolima — "Tierra de Esperanza, Tradición y Futuro Digital"', pageWidth / 2, 268, { align: 'center' });
  doc.text('Este documento es de libre consulta y distribución para toda la ciudadanía.', pageWidth / 2, 273, { align: 'center' });


  // ==========================================
  // PÁGINA 2: TABLA DE CONTENIDOS Y PRESENTACIÓN
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'TABLA DE CONTENIDOS & PRESENTACIÓN');

  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(marginX, 26, contentWidth, 36, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('Mensaje Institucional a la Comunidad Purifiquense', marginX + 6, 33);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(...textDark);
  const welcomeText = 'PurifiCalendario es la herramienta tecnológica oficial concebida para acercar la administración municipal a las familias y barrios de Purificación. A través de este portal, cada ciudadano puede consultar la agenda cultural, alertar fallas de servicios en tiempo real, acumular PurifiPuntos cívicos y mantenerse a salvo ante situaciones de emergencia. Este manual está diseñado con un enfoque práctico y amigable para que cualquier habitante pueda aprovechar cada beneficio.';
  const splitWelcome = doc.splitTextToSize(welcomeText, contentWidth - 12);
  doc.text(splitWelcome, marginX + 6, 39);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Estructura Modular del Manual', marginX, 70);

  const tocData = [
    ['Sesión 1', 'Introducción, Registro y Configuración de Perfil Ciudadano', 'Pág. 3'],
    ['Sesión 2', 'Agenda Cultural, Directorio de Eventos y Turismo Local', 'Pág. 4'],
    ['Sesión 3', 'Sistema de Reporte de Fallas e Incidencias en Servicios Públicos', 'Pág. 5'],
    ['Sesión 4', 'Programa Cívico "PurifiPuntos" y Gamificación Comunitaria', 'Pág. 6'],
    ['Sesión 5', 'Muro de Avisos Oficiales y Centro de Notificaciones en Vivo', 'Pág. 7'],
    ['Sesión 6', 'Herramientas de Bolsillo: Asistente IA, Emergencias y Modo Offline', 'Pág. 8'],
    ['Sesión 7', 'Módulos Avanzados: Organizadores y Administración Municipal', 'Pág. 9'],
    ['Sección 8', 'Guía Práctica de Solución de Problemas Comunes (FAQ)', 'Pág. 10'],
    ['Sección 9', 'Conclusiones, Directorio de Contacto e Índice Temático Alfabético', 'Pág. 11']
  ];

  safeTable({
    startY: 74,
    head: [['Módulo', 'Descripción Temática de la Sesión', 'Ubicación']],
    body: tocData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold', textColor: primaryColor },
      1: { cellWidth: 128 },
      2: { cellWidth: 24, halign: 'right', fontStyle: 'bold', textColor: accentGold }
    },
    styles: { fontSize: 8, cellPadding: 2.8 }
  });

  let legendY = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('Convenciones e Iconografía Empleada en esta Guía', marginX, legendY);

  const conventions = [
    ['[Paso a Paso]', 'Instrucciones ordenadas de forma secuencial que debe ejecutar el usuario.'],
    ['[Ejemplo Real]', 'Casos prácticos de la vida cotidiana en barrios y veredas de Purificación.'],
    ['[Importante]', 'Advertencias o consideraciones clave para garantizar el éxito de su solicitud.'],
    ['[PurifiPuntos]', 'Acciones ciudadanas que le permiten acumular recompensas y reconocimientos.']
  ];

  safeTable({
    startY: legendY + 4,
    body: conventions,
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold', textColor: secondaryColor },
      1: { cellWidth: 142, textColor: textDark }
    },
    styles: { fontSize: 7.8, cellPadding: 1.8 }
  });


  // ==========================================
  // PÁGINA 3: SESIÓN 1 - INDUCCIÓN, REGISTRO Y PERFIL
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'SESIÓN 1: INDUCCIÓN, REGISTRO Y PERFIL CIUDADANO');

  renderSectionIntro(
    doc,
    '1. Introducción y Acceso a la Plataforma',
    'El objetivo de esta primera sesión es que todo habitante de Purificación aprenda a ingresar a la plataforma, cree su cuenta personal de forma segura y configure su perfil para interactuar con la administración municipal.',
    25
  );

  let curY = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('1.1 ¿Qué es PurifiCalendario y cómo acceder?', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'PurifiCalendario es una aplicación web progresiva (PWA) accesible desde cualquier teléfono celular, tableta o computador con conexión a internet. No requiere descargas pesadas desde tiendas de aplicaciones y puede añadirse directamente a la pantalla de inicio de su dispositivo.', curY);

  curY += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('1.2 Paso a paso para Iniciar Sesión o Registrarse', marginX, curY);

  const stepsLogin = [
    ['Paso 1', 'Ubique en la esquina superior derecha del portal el botón "Iniciar Sesión".'],
    ['Paso 2', 'Seleccione su método preferido: Iniciar con cuenta de Google (rápido en un solo clic) o con Correo Electrónico y Contraseña.'],
    ['Paso 3', 'Si es su primera vez, el sistema creará automáticamente su perfil ciudadano y le asignará su primer saldo de bienvenida en PurifiPuntos.'],
    ['Paso 4', 'Para fines demostrativos o de capacitación comunitaria, dispone de botones de Acceso Rápido para alternar entre Habitante, Organizador y Administrador.']
  ];

  safeTable({
    startY: curY + 3.5,
    body: stepsLogin,
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold', textColor: secondaryColor },
      1: { cellWidth: 154, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2.6 }
  });

  curY = doc.lastAutoTable.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('1.3 Gestión y Consulta de "Mi Perfil"', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'Al hacer clic en su nombre o avatar en la barra superior, accederá a la pantalla de Mi Perfil. En este apartado podrá consultar su historial de reportes comunitarios radicados, sus eventos favoritos agendados, su rol actual en el sistema y su saldo sincronizado de PurifiPuntos.', curY);

  curY += 16;
  renderExampleBox(
    doc,
    'Ejemplo Práctico: Don Carlos configura su perfil',
    'Don Carlos, habitante del barrio Las Palmas, ingresa desde su teléfono móvil usando su cuenta de Google. Al entrar a "Mi Perfil", verifica que su rol es "Habitante", recibe 10 PurifiPuntos de bienvenida y activa el modo oscuro para facilitar la lectura nocturna sin cansar la vista.',
    curY,
    contentWidth
  );


  // ==========================================
  // PÁGINA 4: SESIÓN 2 - AGENDA, EVENTOS Y TURISMO
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'SESIÓN 2: AGENDA, EVENTOS Y TURISMO LOCAL');

  renderSectionIntro(
    doc,
    '2. Exploración de la Agenda y Atractivos Turísticos',
    'Aprenda a consultar el calendario oficial de actividades de Purificación, programar recordatorios de eventos municipales y descubrir los destinos turísticos, gastronómicos y culturales más representativos de la Villa de las Palmas.',
    25
  );

  curY = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('2.1 Vistas y Modalidades del Calendario', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'La plataforma le ofrece diversas modalidades para explorar las actividades de acuerdo con su tiempo e interés:', curY);

  const viewTypes = [
    ['Vista Cuadrícula / Mensual', 'Muestra el mes completo con marcadores de colores según la categoría (Cultura, Deporte, Ferias, Salud).'],
    ['Vista Lista / Agenda', 'Presenta las actividades de forma cronológica con tarjetas informativas que detallan fecha, horario, dirección y cupos.'],
    ['Buscador Inteligente', 'Permite escribir palabras como "Concierto", "Fútbol", "Vacunación" o "Malecón" para hallar actividades al instante.']
  ];

  safeTable({
    startY: curY + 6,
    body: viewTypes,
    theme: 'striped',
    columnStyles: {
      0: { cellWidth: 48, fontStyle: 'bold', textColor: primaryColor },
      1: { cellWidth: 126, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2.6 }
  });

  curY = doc.lastAutoTable.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('2.2 Agendamiento y Eventos Favoritos', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'Al hacer clic en cualquier tarjeta de evento, se abrirá la ventana con el detalle completo. Toque el ícono de estrella "Guardar en Favoritos" para recibir alertas automáticas en su Centro de Notificaciones antes del inicio del evento y sincronizar la cita con Google Calendar o iCal.', curY);

  curY += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('2.3 Sección de Turismo y Comercio Tradicional', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'Desde el menú en "Turismo & Comercio", tanto residentes como turistas pueden ubicar atractivos como el Malecón del Río Magdalena, la Parroquia Nuestra Señora de la Candelaria, balnearios sobre quebradas cristalinas y el directorio de gastronomía tradicional (lechona tolimense, tamales y achiras).', curY);

  curY += 16;
  renderExampleBox(
    doc,
    'Ejemplo Práctico: Familia Rodríguez planifica sus fiestas',
    'La familia desea asistir al Festival Folclórico y Reinado Municipal. Aplican el filtro de categoría "Cultura", encuentran el horario del desfile de carrozas en el Malecón, hacen clic en "Guardar en Favoritos" y programan una alerta en su celular.',
    curY,
    contentWidth
  );


  // ==========================================
  // PÁGINA 5: SESIÓN 3 - REPORTE DE FALLAS
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'SESIÓN 3: REPORTE DE FALLAS Y SERVICIOS PÚBLICOS');

  renderSectionIntro(
    doc,
    '3. Sistema de Reporte Ciudadano de Incidencias',
    'Conozca cómo radicar oportunamente daños en el alumbrado público, roturas de tuberías de acueducto, fallas en la recolección de aseo y deterioro de la malla vial para su rápida atención por cuadrillas de la administración.',
    25
  );

  curY = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('3.1 Servicios Públicos e Incidencias Atendidas', marginX, curY);

  const failureCategories = [
    ['Acueducto & Agua Potable', 'Fugas en vías públicas, tuberías rotas, desabastecimiento, baja presión o agua turbia.'],
    ['Alumbrado Público', 'Luminarias apagadas de noche, focos intermitentes, cables sueltos o postes averiados.'],
    ['Aseo Urbano (EMPOPUR)', 'Retrasos en la ruta recolectora de basura, botaderos clandestinos o acumulación de podas.'],
    ['Malla Vial e Infraestructura', 'Huecos peligrosos en calles y carreras, alcantarillas sin tapa o vías terciarias taponadas.']
  ];

  safeTable({
    startY: curY + 3.5,
    body: failureCategories,
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', textColor: primaryColor },
      1: { cellWidth: 124, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2.5 }
  });

  curY = doc.lastAutoTable.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('3.2 Paso a paso para Radicar una Solicitud Oficial', marginX, curY);

  const reportSteps = [
    ['1. Abrir Formulario', 'Presione "Reportar Falla" en el menú superior o toque el botón flotante con el megáfono.'],
    ['2. Seleccionar Barrio', 'Indique su sector (Centro, Ospina Pérez, Triana, Las Palmas, Santa Bárbara o Vereda).'],
    ['3. Dirección y Detalle', 'Escriba la dirección exacta o punto de referencia (ej: frente al polideportivo) y detalle el daño.'],
    ['4. Foto Evidencia', 'Adjunte una foto tomada con la cámara de su celular para constatar la gravedad de la situación.'],
    ['5. Nivel de Urgencia', 'Marque si la severidad es Baja, Media, Alta o Urgente (según el riesgo comunitario).'],
    ['6. Envío y Radicado', 'Haga clic en "Enviar Reporte". Obtendrá su número de radicado (ej: RAD-2026-0814) y +30 PurifiPuntos.']
  ];

  safeTable({
    startY: curY + 3.5,
    body: reportSteps,
    theme: 'striped',
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold', textColor: secondaryColor },
      1: { cellWidth: 132, textColor: textDark }
    },
    styles: { fontSize: 7.8, cellPadding: 2.2 }
  });

  curY = doc.lastAutoTable.finalY + 6;
  renderExampleBox(
    doc,
    'Ejemplo Práctico: Doña Martha reporta una luminaria fundida',
    'Doña Martha nota que la farola frente a su casa en el barrio Ospina Pérez no enciende. Abre PurifiCalendario, elige "Alumbrado Público", sube una foto nocturna y envía el formulario. Al instante recibe el radicado RAD-2026-0814 y +30 PurifiPuntos en su perfil.',
    curY,
    contentWidth
  );


  // ==========================================
  // PÁGINA 6: SESIÓN 4 - PURIFIPUNTOS Y GAMIFICACIÓN
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'SESIÓN 4: PURIFIPUNTOS Y PARTICIPACIÓN CÍVICA');

  renderSectionIntro(
    doc,
    '4. Programa de Reconocimiento Cívico "PurifiPuntos"',
    'Premie su compromiso con Purificación. Los PurifiPuntos recompensan a los ciudadanos activos que reportan incidencias verídicas, responden encuestas municipales y participan en brigadas ambientales comunitarias.',
    25
  );

  curY = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('4.1 ¿Cómo se obtienen los PurifiPuntos?', marginX, curY);

  const pointsTable = [
    ['Radicación de Reporte de Falla', '+30 Puntos', 'Se acredita inmediatamente tras enviar un reporte verificado con foto.'],
    ['Participación en Encuestas Ciudadanas', '+15 Puntos', 'Al emitir opinión sobre proyectos en la página principal.'],
    ['Asistencia a Jornadas de Aseo / Vacunación', '+25 Puntos', 'Al registrarse presencialmente en brigadas de salud animal o ambiente.'],
    ['Validación de Reparación Exitosa', '+10 Puntos', 'Al confirmar que la cuadrilla reparó satisfactoriamente la falla.']
  ];

  safeTable({
    startY: curY + 3.5,
    head: [['Actividad Ciudadana', 'Bonificación', 'Condición y Acreditación']],
    body: pointsTable,
    theme: 'grid',
    headStyles: { fillColor: accentGold, textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 62, fontStyle: 'bold' },
      1: { cellWidth: 26, fontStyle: 'bold', textColor: [16, 185, 129], halign: 'center' },
      2: { cellWidth: 86, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2.6 }
  });

  curY = doc.lastAutoTable.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('4.2 Sincronización en la Nube y Niveles Cívicos', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'Su saldo de PurifiPuntos está sincronizado bidireccionalmente con la base de datos central en la nube (Firestore). Esto asegura que sus puntos no se pierdan al cambiar de navegador o dispositivo móvil. Al sumar puntos, asciende en la escala cívica municipal:', curY);

  const civicLevels = [
    ['Nivel Bronce: "Vecino Vigilante"', '0 a 99 Puntos', 'Acceso a consulta de agenda, alertas y radicación de fallas estándar.'],
    ['Nivel Plata: "Líder Comunitario"', '100 a 299 Puntos', 'Prioridad en la fila de asignación técnica y reconocimiento institucional.'],
    ['Nivel Oro: "Guardián de Purificación"', '300+ Puntos', 'Acceso a bonos en comercios locales aliados y pases preferenciales en festividades.']
  ];

  safeTable({
    startY: curY + 11,
    body: civicLevels,
    theme: 'striped',
    columnStyles: {
      0: { cellWidth: 58, fontStyle: 'bold', textColor: primaryColor },
      1: { cellWidth: 28, fontStyle: 'bold', textColor: secondaryColor },
      2: { cellWidth: 88, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2.5 }
  });

  curY = doc.lastAutoTable.finalY + 6;
  renderExampleBox(
    doc,
    'Ejemplo Práctico: Canje de PurifiPuntos en comercio aliado',
    'Santiago acumula 180 PurifiPuntos tras reportar tres fugas de agua y responder dos encuestas de planeación urbana. Desde "Mi Perfil", visualiza su insignia de "Líder Comunitario" y accede al convenio con la red de panaderías y papelerías aliadas de Purificación.',
    curY,
    contentWidth
  );


  // ==========================================
  // PÁGINA 7: SESIÓN 5 - AVISOS Y NOTIFICACIONES
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'SESIÓN 5: AVISOS OFICIALES Y NOTIFICACIONES EN VIVO');

  renderSectionIntro(
    doc,
    '5. Comunicación Municipal y Seguimiento en Tiempo Real',
    'Manténgase enterado de cortes de acueducto, crecientes del Río Magdalena, obras viales y reciba alertas automáticas cada vez que una cuadrilla municipal actualice el estado de sus radicados.',
    25
  );

  curY = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('5.1 Muro de Avisos y Alertas Rojas Institucionales', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'El módulo de "Avisos" y la marquesina superior transmiten alertas emitidas por la Unidad de Gestión del Riesgo y las empresas de servicios públicos domiciliarios. Se catalogan por códigos visuales:', curY);

  const noticeTypes = [
    ['Alerta Roja / Urgente', 'Crecientes súbitas del Río Magdalena, racionamiento severo de agua o cierres viales totales.'],
    ['Aviso Preventivo (Ámbar)', 'Mantenimiento de redes de energía, lavado de tanques del acueducto o desvíos temporales.'],
    ['Boletín Informativo (Azul)', 'Jornadas de vacunación, brigadas del Sisbén, convocatorias de empleo o reuniones de JAC.']
  ];

  safeTable({
    startY: curY + 11,
    body: noticeTypes,
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 48, fontStyle: 'bold', textColor: primaryColor },
      1: { cellWidth: 126, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2.6 }
  });

  curY = doc.lastAutoTable.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('5.2 Centro de Notificaciones en Vivo (NotificationCenter)', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'El ícono de campana en la barra superior muestra una burbuja con las novedades pendientes. Mediante tecnología de escucha en tiempo real (Firestore Realtime Listener), usted recibe avisos inmediatos sin tener que refrescar la pantalla:', curY);

  const notifScenarios = [
    ['• Asignación de Cuadrilla:', 'Nombre del equipo técnico municipal que asumió la inspección del daño.'],
    ['• Estado "En Reparación":', 'Confirmación de que los operarios ya se encuentran trabajando en el lugar.'],
    ['• Solución Oficial:', 'Notificación con el reporte de solución de la cuadrilla y cierre formal del radicado.'],
    ['• Recordatorio de Evento:', 'Aviso programado antes del inicio de actividades guardadas en sus favoritos.']
  ];

  safeTable({
    startY: curY + 10,
    body: notifScenarios,
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold', textColor: secondaryColor },
      1: { cellWidth: 128, textColor: textDark }
    },
    styles: { fontSize: 7.8, cellPadding: 1.8 }
  });

  curY = doc.lastAutoTable.finalY + 6;
  renderExampleBox(
    doc,
    'Ejemplo Práctico: Notificación de fuga resuelta',
    'Pedro radicó una rotura de tubo en el barrio Modelo. Dos horas después, suena su teléfono y ve una notificación: "Su reporte RAD-2026-0792 ha sido SOLUCIONADO por la cuadrilla de EMPOPUR. Se cambió la unión de 3 pulgadas". Pedro abre la campana y marca el aviso como leído.',
    curY,
    contentWidth
  );


  // ==========================================
  // PÁGINA 8: SESIÓN 6 - HERRAMIENTAS Y MODO OFFLINE
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'SESIÓN 6: HERRAMIENTAS Y MODO FUERA DE LÍNEA');

  renderSectionIntro(
    doc,
    '6. Asistente Inteligente, Teléfonos Útiles y Modo Offline',
    'Aproveche los recursos de apoyo diario creados para habitantes urbanos y veredales: asistente virtual para despejar dudas de trámites, directorio de emergencias y funcionamiento continuo sin señal celular.',
    25
  );

  curY = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('6.1 Asistente Ciudadano "PurifiGuía IA"', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'Al pulsar el botón del asistente municipal, podrá formular preguntas en lenguaje cotidiano y obtener respuestas institucionales al instante. Ejemplos de uso común:', curY);

  const aiQueries = [
    ['"¿Qué días pasa el carro recolector por el barrio Triana?"', 'Informa las frecuencias y horarios de recolección de EMPOPUR.'],
    ['"¿Cuáles son los requisitos para sacar el Sisbén?"', 'Explica documentos requeridos, ventanilla de atención y horario.'],
    ['"¿Qué actividades hay hoy para niños en el municipio?"', 'Consulta la agenda en tiempo real y lista talleres, cine al parque y torneos.']
  ];

  safeTable({
    startY: curY + 7,
    body: aiQueries,
    theme: 'striped',
    columnStyles: {
      0: { cellWidth: 68, fontStyle: 'italic', textColor: primaryColor },
      1: { cellWidth: 106, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2.5 }
  });

  curY = doc.lastAutoTable.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('6.2 Directorio Telefónico de Urgencias y Emergencias', marginX, curY);

  const emergencyPhones = [
    ['Hospital La Candelaria (Urgencias)', '(608) 228-2121 / Cel: 310-555-0123'],
    ['Cuerpo de Bomberos Voluntarios', '(608) 228-2020 / Línea 119'],
    ['Estación de Policía Purificación', '(608) 228-2333 / Línea 123'],
    ['Defensa Civil y Cruz Roja', 'Cel: 313-890-4411']
  ];

  safeTable({
    startY: curY + 3.5,
    head: [['Institución de Auxilio Municipal', 'Líneas Telefónicas de Atención']],
    body: emergencyPhones,
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 84, fontStyle: 'bold' },
      1: { cellWidth: 90, fontStyle: 'bold', textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2.5 }
  });

  curY = doc.lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('6.3 Operación en Modo Fuera de Línea (Offline Storage)', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'PurifiCalendario almacena en caché la agenda de eventos y los comunicados recientes. Si viaja a una vereda sin cobertura celular, podrá seguir consultando la información sin interrupciones. Un indicador visual le informará "Modo Fuera de Línea" y reanudará la sincronización al volver a conectarse.', curY);


  // ==========================================
  // PÁGINA 9: SESIÓN 7 - ADMINISTRACIÓN Y ROLES
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'SESIÓN 7: ORGANIZADORES Y GESTIÓN MUNICIPAL');

  renderSectionIntro(
    doc,
    '7. Paneles de Gestión para Organizadores y Funcionarios',
    'Esta sesión está orientada a gestores de eventos comunitarios, secretarios de despacho y supervisores de cuadrillas municipales para la publicación de contenidos y atención técnica de solicitudes.',
    25
  );

  curY = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('7.1 Panel del Organizador de Eventos', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'Los usuarios acreditados con rol "Organizador" disponen de una consola para registrar torneos deportivos, ferias campesinas o actividades culturales. Las funciones abarcan:', curY);

  const orgFeatures = [
    ['• Registro y Edición:', 'Publicación de título, fechas, horarios, lugar georreferenciado y banner fotográfico.'],
    ['• Control de Cupos:', 'Fijación de aforos máximos para actividades en recintos cerrados o inscripciones previas.'],
    ['• Cancelación o Aplazamiento:', 'Emisión automática de notificaciones a todos los ciudadanos suscritos al evento.']
  ];

  safeTable({
    startY: curY + 7,
    body: orgFeatures,
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 44, fontStyle: 'bold', textColor: primaryColor },
      1: { cellWidth: 130, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2 }
  });

  curY = doc.lastAutoTable.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('7.2 Centro de Operaciones Municipales y Despacho de Cuadrillas', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'El tablero operativo permite a las cuadrillas de EMPOPUR, Infraestructura y Alumbrado coordinar la respuesta técnica a las fallas reportadas:', curY);

  const opsWorkflow = [
    ['1. Recibido', 'Validación del reporte ciudadano, comprobación de la fotografía y asignación de prioridad.'],
    ['2. Cuadrilla Asignada', 'Delegación de la orden de trabajo a la cuadrilla correspondiente (ej: Cuadrilla Vías 1).'],
    ['3. En Reparación', 'Inicio formal de las labores de campo en la dirección indicada por el usuario.'],
    ['4. Solucionado', 'Redacción de la respuesta oficial de cierre y notificación automática al ciudadano.']
  ];

  safeTable({
    startY: curY + 7,
    body: opsWorkflow,
    theme: 'striped',
    columnStyles: {
      0: { cellWidth: 44, fontStyle: 'bold', textColor: secondaryColor },
      1: { cellWidth: 130, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2.4 }
  });

  curY = doc.lastAutoTable.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('7.3 Exportación de Balances Operativos en Formato PDF y CSV', marginX, curY);

  curY += 4.5;
  renderParagraph(doc, 'Los funcionarios pueden descargar en tiempo real balances consolidados de malla vial, estado de cortes programados y bitácoras de auditoría en tablas CSV (compatibles con Excel) o en informes ejecutivos en formato PDF para rendición de cuentas públicas.', curY);


  // ==========================================
  // PÁGINA 10: SECCIÓN 8 - SOLUCIÓN DE PROBLEMAS (FAQ)
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'SECCIÓN 8: GUÍA DE SOLUCIÓN DE PROBLEMAS (FAQ)');

  renderSectionIntro(
    doc,
    '8. Respuestas a Preguntas Frecuentes e Incidencias Técnicas',
    'Consulte esta sección ante cualquier duda o comportamiento inesperado durante el uso de la plataforma. La mayoría de situaciones se resuelven fácilmente sin requerir asistencia técnica especializada.',
    25
  );

  const faqItems = [
    [
      'P1. No veo reflejados mis PurifiPuntos inmediatamente.',
      'Solución: Verifique que cuenta con conexión activa a internet. La sincronización con Firestore ocurre en pocos segundos. Si persiste, entre a "Mi Perfil" y toque el ícono de recargar o cierre y reabra su sesión.'
    ],
    [
      'P2. No puedo subir la fotografía del daño en el reporte.',
      'Solución: Cerciórese de conceder permisos de acceso a la cámara y fotos en su navegador móvil. Si la foto es muy pesada, intente capturarla con menor resolución o acérquese más al foco del daño.'
    ],
    [
      'P3. No me llegan las notificaciones de la aplicación.',
      'Solución: Revise que las notificaciones no estén bloqueadas en los ajustes de su navegador web (Chrome, Safari o Edge) y verifique haber iniciado sesión en su cuenta.'
    ],
    [
      'P4. La aplicación indica "Modo Fuera de Línea".',
      'Solución: Indica interrupción temporal de señal Wi-Fi o datos móviles. Puede continuar leyendo el contenido en memoria; al recuperar señal, el sistema sincronizará los datos pendientes automáticamente.'
    ],
    [
      'P5. ¿Cómo instalo PurifiCalendario como app en mi celular?',
      'Solución: En Android (Chrome), toque los 3 puntos superiores y seleccione "Instalar aplicación". En iPhone (Safari), toque el botón Compartir y elija "Añadir a pantalla de inicio".'
    ]
  ];

  safeTable({
    startY: 50,
    body: faqItems,
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 52, fontStyle: 'bold', textColor: primaryColor },
      1: { cellWidth: 122, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  curY = doc.lastAutoTable.finalY + 10;
  renderExampleBox(
    doc,
    'Consejo para Presidentes de Juntas de Acción Comunal (JAC)',
    'Si en su vereda o barrio residen adultos mayores que no manejan teléfonos inteligentes, el presidente de la JAC o un líder comunitario puede radicar el reporte a nombre de ellos especificando la dirección y nombre del afectado en las observaciones.',
    curY,
    contentWidth
  );


  // ==========================================
  // PÁGINA 11: CONCLUSIÓN E ÍNDICE TEMÁTICO
  // ==========================================
  doc.addPage();
  renderHeader(doc, 'CONCLUSIÓN, DIRECTORIO E ÍNDICE TEMÁTICO');

  renderSectionIntro(
    doc,
    '9. Directorio Institucional y Conclusiones',
    'PurifiCalendario representa un avance determinante en modernización y cercanía ciudadana para Purificación, Tolima. La participación activa de cada habitante permite mantener nuestras vías iluminadas, servicios eficientes y una comunidad informada y unida.',
    25
  );

  curY = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('9.1 Canales Oficiales de la Alcaldía de Purificación', marginX, curY);

  const contactInfo = [
    ['Sede Administrativa Principal:', 'Palacio Municipal, Carrera 5 N° 6-24, Parque Principal'],
    ['Horario de Atención Presencial:', 'Lunes a Viernes de 7:30 a.m. a 12:00 m. y de 2:00 p.m. a 5:30 p.m.'],
    ['Línea Telefónica Conmutador:', '(608) 228-2000 / Fax: (608) 228-2001'],
    ['Correo Institucional PQRSD:', 'contactenos@purificacion-tolima.gov.co'],
    ['Portal Web Municipal Oficial:', 'www.purificacion-tolima.gov.co']
  ];

  safeTable({
    startY: curY + 3.5,
    body: contactInfo,
    theme: 'striped',
    columnStyles: {
      0: { cellWidth: 56, fontStyle: 'bold', textColor: primaryColor },
      1: { cellWidth: 118, textColor: textDark }
    },
    styles: { fontSize: 8, cellPadding: 2.2 }
  });

  curY = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  doc.text('ÍNDICE TEMÁTICO ALFABÉTICO', marginX, curY);

  const indexEntries = [
    ['Acueducto y tuberías rotas', 'Págs. 5, 7'],
    ['Alarmas de emergencia', 'Págs. 7, 8'],
    ['Alumbrado público', 'Pág. 5'],
    ['Asistente PurifiGuía IA', 'Pág. 8'],
    ['AvisosTicker y marquesina', 'Pág. 7'],
    ['Bomberos de Purificación', 'Pág. 8'],
    ['Calendario de eventos', 'Pág. 4'],
    ['Cortes programados', 'Págs. 7, 9'],
    ['Cuadrillas de servicios', 'Págs. 5, 9'],
    ['Directorio de emergencias', 'Pág. 8'],
    ['EMPOPUR (Aseo y recolección)', 'Págs. 5, 8'],
    ['Encuestas de opinión cívica', 'Pág. 6'],
    ['Eventos favoritos', 'Pág. 4'],
    ['Exportar a PDF y CSV', 'Pág. 9'],
    ['Hospital La Candelaria', 'Pág. 8'],
    ['Modo Fuera de Línea (Offline)', 'Págs. 8, 10'],
    ['Niveles cívicos (Oro, Plata)', 'Pág. 6'],
    ['NotificationCenter (Campana)', 'Págs. 5, 7'],
    ['Panel de Organizadores', 'Pág. 9'],
    ['PurifiPuntos (Sincronización)', 'Págs. 5, 6'],
    ['Radicado de reporte (RAD-)', 'Págs. 5, 7'],
    ['Registro y Google Login', 'Pág. 3'],
    ['Solución de problemas (FAQ)', 'Pág. 10'],
    ['Turismo y Gastronomía típica', 'Pág. 4']
  ];

  safeTable({
    startY: curY + 3.5,
    body: indexEntries,
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 140, textColor: textDark },
      1: { cellWidth: 34, halign: 'right', fontStyle: 'bold', textColor: primaryColor }
    },
    styles: { fontSize: 7.8, cellPadding: 1.3 }
  });


  // ==========================================
  // PIE DE PÁGINA Y NUMERACIÓN GLOBAL
  // ==========================================
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text('Alcaldía Municipal de Purificación, Tolima • PurifiCalendario 2026', marginX, pageHeight - 9);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginX, pageHeight - 9, { align: 'right' });
  }

  return doc;

  // --- Funciones auxiliares de renderizado ---
  function renderHeader(pdfDoc, title) {
    pdfDoc.setFillColor(...primaryColor);
    pdfDoc.rect(0, 0, pageWidth, 16, 'F');

    pdfDoc.setFillColor(...accentGold);
    pdfDoc.rect(0, 16, pageWidth, 1.5, 'F');

    pdfDoc.setTextColor(255, 255, 255);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(8.5);
    pdfDoc.text('PURIFICALENDARIO • MANUAL DE USUARIO OFICIAL', marginX, 10.5);

    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(7.5);
    pdfDoc.text(title, pageWidth - marginX, 10.5, { align: 'right' });
  }

  function renderSectionIntro(pdfDoc, sectionTitle, introText, startY) {
    pdfDoc.setTextColor(...primaryColor);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(12);
    pdfDoc.text(sectionTitle, marginX, startY);

    pdfDoc.setDrawColor(...accentGold);
    pdfDoc.setLineWidth(0.8);
    pdfDoc.line(marginX, startY + 2.5, marginX + 36, startY + 2.5);

    pdfDoc.setTextColor(...textDark);
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(8.2);
    const splitIntro = pdfDoc.splitTextToSize(introText, contentWidth);
    pdfDoc.text(splitIntro, marginX, startY + 7);
  }

  function renderParagraph(pdfDoc, text, yPos) {
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(8.2);
    pdfDoc.setTextColor(...textDark);
    const split = pdfDoc.splitTextToSize(text, contentWidth);
    pdfDoc.text(split, marginX, yPos);
  }

  function renderExampleBox(pdfDoc, title, text, yPos, boxWidth) {
    const boxHeight = 22;
    pdfDoc.setFillColor(240, 253, 244);
    pdfDoc.setDrawColor(187, 247, 208);
    pdfDoc.roundedRect(marginX, yPos, boxWidth, boxHeight, 2.5, 2.5, 'FD');

    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(8.2);
    pdfDoc.setTextColor(22, 101, 52);
    pdfDoc.text(`[Ejemplo Práctico] ${title}`, marginX + 5, yPos + 5.5);

    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(7.5);
    pdfDoc.setTextColor(20, 83, 45);
    const split = pdfDoc.splitTextToSize(text, boxWidth - 10);
    pdfDoc.text(split, marginX + 5, yPos + 11);
  }
}

// Generar y guardar en public/
const outputDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const doc = buildUserManualPDF();
const outputPath = path.join(outputDir, 'manual_de_usuario_purificalendario.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log(`PDF generado con éxito en: ${outputPath}`);
console.log(`Tamaño: ${fs.statSync(outputPath).size} bytes`);
