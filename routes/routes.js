module.exports = function(app) {
	app.get('/', function(req, res) {
		res.resnder('index.ejs');
});
}
