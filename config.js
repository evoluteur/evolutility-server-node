
module.exports = {
	apiPath: '/api/v1/evolutility/',
	apiPort: 3000,
	connectionString: process.env.DATABASE_URL || 'postgres://evol:love@localhost:5432/Evolutility',
	schema: 'evol_demo',
	consoleLog: true
};
