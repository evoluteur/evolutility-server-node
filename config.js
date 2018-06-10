
module.exports = {

	// Path to REST API
	apiPath: '/api/v1/evolutility/',
	apiPort: 3000,

	// DB connection
	connectionString: process.env.DATABASE_URL || 'postgres://evol:love@localhost:5432/Evolutility',
	schema: 'evol_demo',

	// Pagination and maximum number of rows
	pageSize: 50,
	lovSize: 100,
	csvSize: 1000,
	csvHeader: 'label', // possible values: id, label

	// - Timestamp columns u_date and c_date w/ date of record creation and last update 
	wTimestamp: true,

	// - Comments & Ratings (community feature) 
	wComments: true,
	wRating: true,

	// Directory for uploaded files
	uploadPath: '../evolutility-ui-react/public/pix/',

	// Console log
	consoleLog: true,

};
