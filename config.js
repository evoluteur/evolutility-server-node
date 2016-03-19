
module.exports = {
	apiPath: '/api/v1/evolutility/',
	connectionString: process.env.DATABASE_URL || 'postgres://evol:love@localhost:5432/evolutility',
	schema: 'evol_demo'
};
