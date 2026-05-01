import express from 'express'
import authRoutes from '../modules/auth/auth.routes'
import membershipRoutes from '../modules/membership/membership.routes';
import paymentRoutes from '../modules/payments/payments.routes';
import eventRoutes from '../modules/events/events.routes';
import ticketRoutes from '../modules/tickets/tickets.routes';
import checkinRoutes from '../modules/checkin/checkin.routes';
import announcementRoutes from '../modules/announcements/announcements.routes';
import adminRoutes from '../modules/admin/admin.routes';
const app = express()

app.use('/api/v1/auth', authRoutes)
app.use('api/v1/membership', membershipRoutes);
app.use('api/v1/payments', paymentRoutes);
app.use('api/v1/events', eventRoutes);
app.use('api/v1/tickets', ticketRoutes);
app.use('api/v1/checkin', checkinRoutes);
app.use('/v1/announcements', announcementRoutes);
app.use('/v1/admin', adminRoutes);
export default app;