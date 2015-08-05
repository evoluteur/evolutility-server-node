var connectionString = process.env.DATABASE_URL || 'postgres://evol:love@localhost:5432/evolutility';

module.exports = connectionString;
