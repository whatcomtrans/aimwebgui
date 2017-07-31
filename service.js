//Set any default arguments
var config = {
	maxRestarts: 3
};
// Define required input flags
var i = false;
var n = false;
var d = false;
var s = false;
var u = false;
var p = false;

console.log(process.argv);
console.log(process.argv.length);

//Show help dialog if less than 2 arguments passed
if (process.argv.length <= 2) {
  console.log('Use this utility to install or uninstall a nodejs script as a windows service. Options include:\n\n');
  console.log('install: --install, -i. Required. Valid values are "add" and "delete"');
  console.log('name: --name, -n. Required. Specify the name of the windows service.');
  console.log('description: --description, -d. Required for add. Specify a description for the windows service.');
  console.log('script: --script, -s. Required. Specify the absolute path to the script to be used.');
  console.log('user: --user, -u. Required for add. Specify the user account to be used.');
  console.log('password: --password, -p. Required for add. Specify the password for the user account to be used.');
  console.log('max restarts: --maxrestarts, -m. Optional. Defaults to 3. The number of times the windows service will try to restart per minute upon failure.');
  process.exit(0);
}

//Parse arguments
for (var o = 2; o < process.argv.length; o++) {
  console.log(o);
  var arg = process.argv[o];
  console.log(arg);
  var keyValue = arg.split('=');  
  var key = keyValue[0], value = keyValue[1];
  if (key === '--help' || key === '-h' || key === '?' || key === '-?') {
  	console.log('Use this utility to install or uninstall a nodejs script as a windows service. Options include:\n\n');
  	console.log('install: --install, -i. Required. Valid values are "add" and "delete"');
  	console.log('name: --name, -n. Required. Specify the name of the windows service.');
  	console.log('description: --description, -d. Required for add. Specify a description for the windows service.');
  	console.log('script: --script, -s. Required. Specify the absolute path to the script to be used.');
  	console.log('user: --user, -u. Required for add. Specify the user account to be used.');
  	console.log('password: --password, -p. Required for add. Specify the password for the user account to be used.');
  	console.log('max restarts: --maxrestarts, -m. Optional. Defaults to 3. The number of times the windows service will try to restart per minute upon failure.');
  	process.exit(0);
  }
  if (key === '--install' || key === '-i') {
  	  i = true;
      console.log(value);
      if (value === 'add') {
      	config.change = 'add';
      } else if (value === 'delete') {
      	config.change = 'delete';
      } else {
      	console.log('Please specify add or delete with the --install or -i option.')
      	process.exit(1); //failure code
      }
  }
  if (key === '--name' || key === '-n')  {
      config.name = value;
      n = true;
  }
  if (key === '--description' || key === '-d')  {
      config.description = value;
  	  d = true;
  }
  if (key === '--script' || key === '-s')  {
      config.path = value;
  	  s = true;
  }
  if (key === '--user' || key === '-u')  {
      config.user = value;
      u = true;
  }
  if (key === '--password' || key === '-p')  {
      config.password = value;
      p = true;
  }
  if (key == '--maxRestarts' || key === '-m')  {
      config.maxRestarts = parseInt(value);
  }
}

console.log(config);
checkConfig(config);

function checkConfig(config) {
  //Make sure all required options are specified
  if (config.change==='add') {
    if (i&&n&&d&&s&&u&&p) {
      processService(config);
    } else {
      console.log('Please specify all required options. Use -h for instructions.');
      process.exit(1);
    }
  } else if (config.change==='delete') {
    if (i&&n&&s) {
      processService(config);
    } else {
      console.log('Please specify all required options. Use -h for instructions.');
      process.exit(1);
    }
  } else {
    console.log('Please specify if the service is being added or delete with the -i option. Use -h for help.');
    process.exit(1);
  }
}

function processService(config) {
	var Service = require('node-windows').Service;

	if (config.change === 'add') {
		// Create a new service object
		var svc = new Service({
		  name: config.name,
		  description: config.description,
		  script: config.path,
		  maxRestarts: config.maxRestarts
		});

		// Set the service's user permissions
		svc.user.domain = 'whatcomtrans.net';
		svc.user.account = config.user;
		svc.user.password = config.password;

		svc.on('install',function(){
		  svc.start();
		  console.log(config.name + ' has been installed and started.');
		});
		
		svc.install();
	} else if (config.change === 'delete') {
		// Create a new service object
		var svc = new Service({
		  name: config.name,
		  script: config.path
		});

		svc.on('uninstall',function(){
		  console.log('Uninstall of ' + config.name+ ' has completed successfully.');
		});
		 
		// Uninstall the service. 
		svc.uninstall();
	} else {
		console.log('Please specify if the service is being added or delete with the -i option. Use -h for help.');
		process.exit(1);
	}
}