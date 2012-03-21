
/**
 * Module dependencies.
 */

var express   = require('express')
  , routes 	  = require('./routes')
  , mongoose  = require('mongoose')
  , fs		  = require('fs')
  , exec      = require('child_process').exec

var app = module.exports = express.createServer();

mongoose.connect('mongodb://nodejitsu:8075d5ee3975d71f608a622e6e04cb57@staff.mongohq.com:10053/nodejitsudb670671880480');

//Schema
var Submit = new mongoose.Schema({
	name:     String,
	languaje: String,
	date: { type: Date, default: Date.now }
});

var SubmitModel = mongoose.model('Submit', Submit);

app.use(express.bodyParser());
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


var exec_file;

// Routes

app.get('/', routes.index);

app.get('/uploads/new', function(req,res){
	res.render('uploads/new');
});

app.post('/uploads', function(req, res){
	var root = __dirname + '/static/uploads/';
	var rq = req.files;
	for(var f in rq){
		var data = fs.readFileSync(rq[f].path, 'utf8');
		fs.writeFileSync(root + rq[f].name, data, encoding='utf8')
	}

	//To see file extension
	var ext = rq.src.name.split('.');

	if(ext[1] == 'c'){ // Ansi C
		var src_file = root + rq.src.name
			, exec_file = root + ext[0]
			, command1 = 'gcc ' + src_file + ' -o ' + exec_file
			, command2 = exec_file + ' < ' + exec_file + '.in'

			, child = exec(command1, function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec compilation: ' + error);
				}
			});

			child.on('exit', function(code){
				console.log('exit -> '+code)
				
				child2 = exec(command2, function(error, stdout, stderr){
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (error !== null) {
						console.log('exec execution: ' + error);
					}
					fs.writeFileSync(exec_file + '.out', stdout, encoding='utf8');

					fs.readFile(exec_file + '.out', function(err, file_content){
						res.write('Ouput: \n' + file_content);
						res.end();
					});
				});
			});
			
	}
	else if(ext[1] == 'c++'){ // c++

	}

});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address(), app.settings.env);
