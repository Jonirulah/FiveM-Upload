// Libs
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// cleaning sub-process
const utils = require('./utils');
const config = require('../config');
require('./clearFiles');

Utils = new utils();
Config = new config();

if (Config.logging) {
	try {
		const winston = require("winston");
		const { combine, timestamp, json } = winston.format;

		global.logger = winston.createLogger({
			format: combine(timestamp(), json()),

			transports: [
				new winston.transports.File({
				filename: '../logs/log.log',
				}),
			new winston.transports.Console()],
		});
		Utils.logInfo('Enabled Winston for Logging');
	} catch {
		Utils.logInfo("Couldn't enable Winston for logging");
	}
};

if (Config.ssl) {
	try {
		const https = require('https');
		const privateKey = fs.readFileSync(Config.sslPrivateKey, 'utf8');
		const certificate = fs.readFileSync(Config.sslCertificate, 'utf8');
		const credentials = { key: privateKey, cert: certificate };
		const httpsServer = https.createServer(credentials, app);
		httpsServer.listen(Config.sslPort, () => {
			Utils.logInfo(`HTTPS Server is listening on ${Config.endPoint}`);
		});
	} catch (e) {
		console.log(e)
		Utils.logInfo(`HTTPS couldn't be enabled`);
	}
};

// Set up Multer for handling multipart/form-data
const storage = multer.diskStorage({
  	destination: (req, file, cb) => { cb(null, path.join(__dirname, '../uploads'))},
  	filename: (req, file, cb) => {
		const randomString = Math.random().toString(36).substring(2);
		const uniqueFilename = `${randomString}${path.extname(file.originalname)}`;
		cb(null, uniqueFilename);
  	},
  	fileFilter: (req, file, callback) => {
		// Check the file extension (adjust allowed extensions as needed)
		const fileExtension = path.extname(file.originalname).toLowerCase();
		if (!Config.allowedExtensions.includes(fileExtension)) {
		  return callback(new Error('File extension is not allowed'), false);
		}
		callback(null, true);
	},
	limits: {fileSize: 40 * 1024 * 1024, files: 1 },
});

const upload = multer({ storage: storage });

app.listen(Config.port, () => {
	Utils.logInfo(`Server is listening on ${Config.endPoint}`);
});

app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'];
    const route = req.originalUrl;
    const isHttps = req.secure ? 'HTTPS' : 'HTTP';
	if (Config.citizenFXonly) {
		const citizenFX = userAgent.includes('CitizenFX')
		Utils.logInfo(`${req.method} ${route} from ${userAgent} over ${isHttps} | isCitizen:${citizenFX}`);
		if (citizenFX) {next()} else {return res.status(444).send()};
	} else { next() };
});

// Do not send anything on GET "/"
app.get('/', (req, res) => {
	return res.status(444).send();
});

// Route for handling file uploads
app.post('/upload', upload.array('files[]'), (req, res) => {
	const uploadedFiles = req.files;
	const attachments = uploadedFiles.map(file => {
		const fileSizeInBytes = fs.statSync(file.path).size;
		return {
			proxy_url: `${Config.endPoint}${file.filename}`,
			url: `${Config.endPoint}${file.filename}`,
			id: Math.floor(Math.random() * (90000000000000 - 10000000000000 + 1)) + 10000000000000,
			width: '1920', // Metadata send by discord, some scripts use it to display info.
			height: '1080', // Metadata send by discord, some scripts use it to display info.
			size: fileSizeInBytes // Metadata send by discord, some scripts use it to display info.
		}
	});

	Utils.logInfo(`Upload complete {'url':'${attachments[0].proxy_url}', 'size':'${attachments[0].size}'}`);
	const data = {"attachments": attachments};
	res.send(data);
});

// Route for sending files
app.get('/uploads/:filename', (req, res) => {
	const requestedFilename = req.params.filename;

	// IMPORTANT!: Ensure the filename does not contain directory traversal attempts
	if (requestedFilename.includes('..')) {
		res.status(400).send('Invalid filename');
		return;
	}

// Check if the file in URL exists in our server
	const filePath = path.join(__dirname, '../uploads', requestedFilename);
	fs.access(filePath, fs.constants.F_OK, (err) => {
		if (err) {
		res.status(404).send('Not available');
		} else {
		res.sendFile(filePath);
		}
	});
});
	