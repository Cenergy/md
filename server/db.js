const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

async function initDB() {
    db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            name TEXT,
            avatar TEXT,
            status INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT,
            owner_id INTEGER,
            hero TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(owner_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS menus (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            name TEXT,
            link TEXT,
            sort_order INTEGER,
            FOREIGN KEY(project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS sliders (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            menu_link TEXT,
            name TEXT,
            link TEXT,
            is_group BOOLEAN,
            parent_id TEXT,
            sort_order INTEGER,
            content TEXT,
            FOREIGN KEY(project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS project_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT,
            user_id INTEGER,
            email TEXT,
            FOREIGN KEY(project_id) REFERENCES projects(id)
        );

        CREATE TABLE IF NOT EXISTS verify_codes (
            email TEXT PRIMARY KEY,
            code TEXT,
            expires_at DATETIME
        );
    `);

    // Insert default admin user if not exists
    try {
        await db.run(`
            INSERT OR IGNORE INTO users (email, password, name) 
            VALUES ('admin@qq.com', '123456', 'admin')
        `);
        console.log('Default admin user check/creation completed');
    } catch (error) {
        console.error('Error creating default admin user:', error);
    }

    console.log('Database initialized');
    return db;
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}

module.exports = {
    initDB,
    getDB
};
