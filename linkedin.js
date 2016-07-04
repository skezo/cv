var fs = require('fs');
var https = require('https');
var url = require('url');
var path = require("path");
var osmosis = require('osmosis');
var auth = require('./auth.json');


function saveImage(context, data, selector) {
	var src = context.querySelector(selector).getAttribute('src');
	var filename = createFileName(data.object.fullName, getFileExt(src));
	var filepath = createFilePath('src/img/', filename)
	downloadFileFromUrl(src, filepath);
	return filename;
}

function saveAsJson(data) {
	fs.writeFile('data/linkedin.json', JSON.stringify(data, null, '\t'), function (err) {
		if (err) return console.log(err);
	});
}

function downloadFileFromUrl(url, dest) {
	var file = fs.createWriteStream(dest);
	https.get(url, function(response) {
		response.pipe(file);
	}).on('error', function(err) { // Handle errors
		console.log(err)
	});
}

function getFileExt(str) {
	return path.extname(url.parse(str).pathname);
}

function createFileName(filename, ext) {
	return filename.replace(/\s/g,"")+ext;
}

function createFilePath(dir, filename) {
	return path.join(dir, filename);
}


osmosis
.get(auth.url)
.follow('.sign-in-link@href')
.login(auth.username, auth.password)
.success('title:contains('+auth.successString+')')
.set('fullName', '#name .full-name')
.set('photo', function(context, data){
	return saveImage(context, data, '.profile-picture img');
})
.set({
	'publicProfile': '.public-profile a',
	'headline': '#headline .title',
	'location': '#location .locality a',
	'industry': '#location .industry a',
    'summary': 	'#summary-item .description',
    'experience': [
		osmosis
		.find('#background-experience > .section-item')
		.set({
			'role': 		'header > h4',
			'company': 		'header > h5:last-child',
			'location': 	'.locality',
			'startTime': 	'.experience-date-locale time[1]',
			'endTime': 		'.experience-date-locale time[2]',
			'description': 	'.description'
		})
    ],
    'education': [
    	osmosis
		.find('#background-education > .section-item')
		.set({
			'institute':	'header > h4',
    		'degree': 		'header > h5:last-child',
    		'startTime': 	'.education-date time[1]',
    		'endTime': 		'.education-date time[2]',
    		'description': 	'.notes',
		})
		.then(function(context, data){
			data.startTime = data.startTime.replace(/– /,'');
			data.endTime = data.endTime.replace(/– /,'');
		})
    ],
    'recommendations': [
    	osmosis
		.find('#endorsements .endorsement-full')
		.set({
    		'fullName': '.endorsement-info > hgroup h5',
    		'role': 	'.endorsement-info > hgroup h6',
    		'date': 	'.endorsement-date',
    		'quote': 	'blockquote.endorsement-quote p',
		})
		.set('photo', function(context, data){
			return saveImage(context, data, '.endorsement-picture img');
		})
    ],
    'awards': [
    	osmosis
		.find('#background-honors .section-item')
		.set({
    		'award':		'.honoraward > h4',
    		'organisation': '.honoraward > h5',
    		'time': 		'.honoraward > .honors-date',

		})
    ]
})
.set('interests', '#interests-view')
.data(function(profile) {
	saveAsJson(profile);
})
.log(console.log)
.error(console.log)
.debug(console.log);