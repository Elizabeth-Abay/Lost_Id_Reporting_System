const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { pool } = require('./model/connect');
const path = require('path');


// Import routes
const mainRoutes = require('./routes/mainRoutes');
const { accessTokenGenerator } = require('./routes/generatingTokens')

// Import services
const {notificationService} = require('./service/notificationService');

const app = express();
const PORT =  3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

app.use('/token' , accessTokenGenerator )

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
// const corsOptions = {
//     origin: function (origin, callback) {
//         // Allow requests with no origin (like mobile apps or curl requests)
//         if (!origin) return callback(null, true);
        
//         // In development, allow all origins
//         if (process.env.NODE_ENV === 'development') {
//             return callback(null, true);
//         }
        
//         // In production, specify allowed origins
//         const allowedOrigins = '*'
        
//         if (allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     optionsSuccessStatus: 200
// };
app.use(cors({
    origin : '*',
    credentials : true
}));

// Compression middleware
app.use(compression());

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        const dbCheck = await pool.query('SELECT NOW()');
        
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'Connected',
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'Disconnected',
            error: error.message
        });
    }
});

// Static file serving for frontend
app.use(express.static('../frontend', {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true
}));

// API routes
app.use('/user', mainRoutes);
app.use('/api', mainRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: error.details
        });
    }

    if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        });
    }

    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error response
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});


const gracefulShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
    
    try {
        // Stop notification service
        if (notificationService) {
            await notificationService.stopListening();
            console.log('Notification service stopped');
        }
        
        // Close database connections
        await pool.end();
        console.log('Database connections closed');
        
        // Close server
        app.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
        
        // Force close after 30 seconds
        setTimeout(() => {
            console.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 30000);
        
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

// Start server
const server = app.listen(PORT, async () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    
    try {
        // Initialize notification service
        // notificationService = new NotificationService();
        await notificationService.startListening();
        console.log(' Notification service started');
        
        // Test database connection
        const testQuery = await pool.query('SELECT NOW()');
        console.log(' Database connected successfully');
        
    } catch (error) {
        console.error(' Failed to initialize services:', error);
        process.exit(1);
    }
});

// Export for testing
module.exports = { app, server };