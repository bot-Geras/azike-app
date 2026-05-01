import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import { initializeCronJobs } from "./jobs/scheduled-jobs"
import mainRoute from './routes/index'


const app = express()
const PORT = process.env.PORT || 3000


app.use(helmet())
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:8081'],
  credentials: true}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(mainRoute)



app.get('/health',(req, res) => {

res.json({ status: 'OK', timestamp: new Date().toISOString() });

})

app.get('/v1/ping', (req, res) => {
  res.json({ 
    success: true, 
    message: 'pong',
    data: { timestamp: new Date().toISOString() }
  });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    errors: [{ field: 'url', message: `${req.method} ${req.path} does not exist` }]
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [{ field: 'server', message: err.message || 'Unknown error' }]
  });
});


initializeCronJobs();


app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 AZIKE Community API is running!                         ║
║                                                              ║
║   📍 Local:            http://localhost:${PORT}                 ║
║   📊 Health check:     http://localhost:${PORT}/health          ║
║   📝 API Base:         http://localhost:${PORT}/v1              ║
║                                                              ║
║   📋 Available Routes:                                        ║
║      POST   /v1/auth/register                                ║
║      POST   /v1/auth/login                                   ║
║      POST   /v1/auth/refresh                                 ║
║      GET    /v1/auth/me                                      ║
║      POST   /v1/auth/device-token                            ║
║      GET    /v1/membership/status                            ║
║      GET    /v1/membership/card                              ║
║      GET    /v1/membership/renewal-options                   ║
║      POST   /v1/membership/renew                             ║
║      POST   /v1/payments/mpesa/stkpush                       ║
║      POST   /v1/payments/mpesa/callback (webhook)            ║
║      GET    /v1/payments/transaction/:id/status              ║
║      GET    /v1/payments/transactions                        ║
║      GET    /v1/events                                       ║
║      GET    /v1/events/:id                                   ║
║      POST   /v1/tickets/events/:eventId/purchase             ║
║      GET    /v1/tickets/my                                   ║
║      POST   /v1/checkin/scan                                 ║
║      GET    /v1/announcements                                ║
║      GET    /v1/announcements/notifications                  ║
║      PATCH  /v1/announcements/notifications/:id/read         ║
║      PATCH  /v1/announcements/notifications/read-all         ║
║      GET    /v1/admin/dashboard/stats                        ║
║      GET    /v1/admin/events                                 ║
║      POST   /v1/admin/events                                 ║
║      PUT    /v1/admin/events/:id                             ║
║      DELETE /v1/admin/events/:id                             ║
║      GET    /v1/admin/announcements                          ║
║      POST   /v1/admin/announcements                          ║
║                                                              ║
║   ⏰ Cron Jobs Initialized:                                   ║
║      - Membership expiry (daily at midnight)                 ║
║      - Expiry reminders (daily at 9 AM)                      ║
║      - Event reminders (daily at 10 AM)                      ║
║      - Entitlement reset (Jan 1st)                           ║
║      - Stale transaction cleanup (every 15 min)              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `)
})