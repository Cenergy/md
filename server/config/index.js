require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'SECRET_KEY'];
const missingVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    } else {
        console.warn(`[WARNING] Missing environment variables: ${missingVars.join(', ')}. Using defaults where possible.`);
    }
}

const config = {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.SECRET_KEY || 'md-test-secret-key',
    isProduction: process.env.NODE_ENV === 'production',
    
    // Email Config
    email: {
        host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.qq.com',
        port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 465,
        user: process.env.EMAIL_USER || process.env.SMTP_USER || '',
        pass: process.env.EMAIL_PASS || process.env.SMTP_PASSWORD || '',
    },
    
    // File Upload Config
    upload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        dir: 'uploads'
    }
};

module.exports = config;
