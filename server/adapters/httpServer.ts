import { Express, Request, Response } from 'express';
import { dbInstance, MYSQL_DDL_SCHEMA } from './database';
import { validateAviso, validateEvento } from '../../src/domain/validation';

export function setupApiRoutes(app: Express) {
  // 1. Health check & DDL Schema Inspector
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', app: 'PurifiCalendario', municipio: 'Purificación, Tolima' });
  });

  app.get('/api/ddl', (req: Request, res: Response) => {
    res.type('text/plain').send(MYSQL_DDL_SCHEMA);
  });

  // 2. Categories
  app.get('/api/categories', (req: Request, res: Response) => {
    res.json(dbInstance.getCategories());
  });

  // 3. Events
  app.get('/api/events', (req: Request, res: Response) => {
    let events = dbInstance.getAllEvents();

    const { categoriaId, searchQuery, month, year, organizerId } = req.query;

    if (categoriaId) {
      events = events.filter(e => e.id_categoria === Number(categoriaId));
    }

    if (organizerId) {
      events = events.filter(e => e.id_organizador === Number(organizerId));
    }

    if (searchQuery) {
      const q = String(searchQuery).toLowerCase();
      events = events.filter(e => 
        e.nombre.toLowerCase().includes(q) ||
        e.descripcion.toLowerCase().includes(q) ||
        e.lugar.toLowerCase().includes(q) ||
        (e.info_adicional && e.info_adicional.toLowerCase().includes(q))
      );
    }

    if (month !== undefined && year !== undefined) {
      events = events.filter(e => {
        const d = new Date(e.fecha + 'T00:00:00');
        return d.getMonth() === Number(month) && d.getFullYear() === Number(year);
      });
    }

    res.json(events);
  });

  app.get('/api/events/:id', (req: Request, res: Response) => {
    const event = dbInstance.getEventById(Number(req.params.id));
    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }
    res.json(event);
  });

  app.post('/api/events', (req: Request, res: Response) => {
    const validation = validateEvento(req.body);
    if (!validation.isValid) {
      res.status(400).json({ error: 'Datos no válidos', details: validation.errors });
      return;
    }

    const newEvent = dbInstance.createEvent(req.body);
    res.status(201).json(newEvent);
  });

  app.put('/api/events/:id', (req: Request, res: Response) => {
    const updated = dbInstance.updateEvent(Number(req.params.id), req.body);
    if (!updated) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/events/:id', (req: Request, res: Response) => {
    const success = dbInstance.deleteEvent(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }
    res.json({ success: true, message: 'Evento eliminado correctamente' });
  });

  // 4. Avisos (Public Notices)
  app.get('/api/notices', (req: Request, res: Response) => {
    res.json(dbInstance.getNotices());
  });

  app.post('/api/notices', (req: Request, res: Response) => {
    const validation = validateAviso(req.body);
    if (!validation.isValid) {
      res.status(400).json({ error: 'Datos no válidos', details: validation.errors });
      return;
    }

    const creatorId = req.body.id_usuario_creador ? Number(req.body.id_usuario_creador) : 3;
    const newNotice = dbInstance.createNotice(req.body, creatorId);
    res.status(201).json(newNotice);
  });

  app.delete('/api/notices/:id', (req: Request, res: Response) => {
    const success = dbInstance.deleteNotice(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Aviso no encontrado' });
      return;
    }
    res.json({ success: true });
  });

  // 5. Notifications
  app.get('/api/notifications/user/:userId', (req: Request, res: Response) => {
    res.json(dbInstance.getNotificationsByUser(Number(req.params.userId)));
  });

  app.post('/api/notifications', (req: Request, res: Response) => {
    const notif = dbInstance.createNotification(req.body);
    res.status(201).json(notif);
  });

  app.post('/api/notifications/broadcast', (req: Request, res: Response) => {
    const { titulo, mensaje, tipo_ref, id_ref } = req.body;
    const users = dbInstance.getUsers();
    const created: any[] = [];
    users.forEach(u => {
      const n = dbInstance.createNotification({
        id_usuario: u.id_usuario,
        titulo: titulo || 'Notificación Municipal',
        mensaje: mensaje || '',
        tipo_ref: tipo_ref || 'sistema',
        id_ref: id_ref || null
      });
      created.push(n);
    });
    res.status(201).json({ success: true, count: created.length });
  });

  app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
    const success = dbInstance.markNotificationAsRead(Number(req.params.id));
    res.json({ success });
  });

  app.post('/api/notifications/user/:userId/read-all', (req: Request, res: Response) => {
    const success = dbInstance.markAllNotificationsAsRead(Number(req.params.userId));
    res.json({ success });
  });

  // 6. User Event Bookmarks (M:N Relationship)
  app.get('/api/bookmarks/user/:userId', (req: Request, res: Response) => {
    res.json(dbInstance.getSavedEventsByUser(Number(req.params.userId)));
  });

  app.get('/api/bookmarks/check', (req: Request, res: Response) => {
    const { userId, eventId } = req.query;
    if (!userId || !eventId) {
      res.status(400).json({ error: 'Se requieren userId y eventId' });
      return;
    }
    const isSaved = dbInstance.isEventSaved(Number(userId), Number(eventId));
    res.json({ isSaved });
  });

  app.post('/api/bookmarks/toggle', (req: Request, res: Response) => {
    const { userId, eventId } = req.body;
    if (!userId || !eventId) {
      res.status(400).json({ error: 'Se requieren userId y eventId' });
      return;
    }
    const result = dbInstance.toggleSaveEvent(Number(userId), Number(eventId));
    res.json(result);
  });

  // 7. Users & Auth
  app.get('/api/users', (req: Request, res: Response) => {
    res.json(dbInstance.getUsers());
  });

  app.get('/api/users/:id', (req: Request, res: Response) => {
    const user = dbInstance.getUserById(Number(req.params.id));
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json(user);
  });

  // Login endpoint
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { login, password } = req.body;
    if (!login) {
      res.status(400).json({ error: 'Se requiere correo o nombre de usuario' });
      return;
    }

    const authenticated = dbInstance.authenticateUser(login, password);
    if (!authenticated) {
      res.status(401).json({ error: 'Credenciales inválidas o usuario no registrado en Purificación' });
      return;
    }

    res.json({
      success: true,
      user: authenticated,
      token: `purifi_token_${authenticated.id_usuario}_${Date.now()}`
    });
  });

  // Register endpoint
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { nombre_usuario, correo, contrasena } = req.body;
    if (!nombre_usuario || !correo) {
      res.status(400).json({ error: 'Nombre completo y correo son obligatorios' });
      return;
    }

    const existing = dbInstance.getUserByEmail(correo);
    if (existing) {
      res.status(409).json({ error: 'Ya existe una cuenta con este correo electrónico' });
      return;
    }

    const newUser = dbInstance.createUser(req.body);
    res.status(201).json({
      success: true,
      user: newUser,
      token: `purifi_token_${newUser.id_usuario}_${Date.now()}`
    });
  });

  // Google OAuth / One-Tap Login endpoint
  app.post('/api/auth/google', (req: Request, res: Response) => {
    const { email, name, photoUrl } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Correo de Google es requerido' });
      return;
    }

    const user = dbInstance.findOrCreateGoogleUser({ email, name, photoUrl });
    res.json({
      success: true,
      user,
      token: `purifi_google_${user.id_usuario}_${Date.now()}`
    });
  });

  app.post('/api/users', (req: Request, res: Response) => {
    const { correo } = req.body;
    const existing = dbInstance.getUserByEmail(correo);
    if (existing) {
      // If logging in
      res.json(existing);
      return;
    }
    const newUser = dbInstance.createUser(req.body);
    res.status(201).json(newUser);
  });

  app.put('/api/users/:id/preferences', (req: Request, res: Response) => {
    const { preferences } = req.body;
    const updated = dbInstance.updateUserPreferences(Number(req.params.id), preferences);
    if (!updated) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json(updated);
  });

  // 8. Organizers
  app.get('/api/organizers', (req: Request, res: Response) => {
    res.json(dbInstance.getOrganizers());
  });

  app.get('/api/organizers/user/:userId', (req: Request, res: Response) => {
    const org = dbInstance.getOrganizerByUserId(Number(req.params.userId));
    if (!org) {
      res.status(404).json({ error: 'Organizador no encontrado' });
      return;
    }
    res.json(org);
  });

  // 9. Admin Stats
  app.get('/api/admin/stats', (req: Request, res: Response) => {
    res.json(dbInstance.getStats());
  });
}
