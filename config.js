var connectionString = process.env.DATABASE_URL || 'postgres://postgres:love@localhost:5432/evolutility';

module.exports = connectionString;
