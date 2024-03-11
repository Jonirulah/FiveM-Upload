// Libs
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up Multer for handling multipart/form-data
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const randomString = Math.random().toString(36).substring(2);
    const uniqueFilename = `${randomString}${path.extname(file.originalname)}`;

    cb(null, uniqueFilename);
  },
  fileFilter: (req, file, callback) => {
    // Check the file extension (adjust allowed extensions as needed)
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.ogg', '.webm', '.opus', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
  
    if (!allowedExtensions.includes(fileExtension)) {
      // File extension is not allowed
      return callback(new Error('File extension is not allowed'), false);
    }

    // File extension is allowed
    callback(null, true);
  },
  limits: {
    fileSize: 40 * 1024 * 1024, // 40 MB limit (adjust the value as needed)
    files: 1, 
  },
});

function cleanupFiles() {
  const uploadDir = './uploads';
  const maxFileAge = 30 * 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading upload directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = `${uploadDir}/${file}`;

      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          console.error(`Error getting file stats for ${filePath}:`, statErr);
          return;
        }

        const fileAge = Date.now() - stats.ctime.getTime();

        if (fileAge > maxFileAge) {
          // File has exceeded the maximum retention period, delete it
          fs.unlink(filePath, unlinkErr => {
            if (unlinkErr) {
              console.error(`Error deleting file ${filePath}:`, unlinkErr);
            } else {
              console.log(`File ${filePath} deleted successfully.`);
            }
          });
        }
      });
    });
  });
}

// Periodically check and delete old files every 1 hour (adjust as needed)
setInterval(cleanupFiles, 1 * 60 * 60 * 1000);
const upload = multer({ storage: storage });

// Listen and Start
app.listen(port, () => {
  console.log(`Server is listening on http://127.0.0.1:3000/`);
});

app.get('/', (req, res) => {
  return res.send(444);
});

// Route for handling file uploads
app.post('/upload', upload.array('files[]'), (req, res) => {
  const uploadedFiles = req.files;
  const attachments = uploadedFiles.map(file => {
    const fileSizeInBytes = fs.statSync(file.path).size;
    return {
      proxy_url: `http://127.0.0.1:3000/uploads/${file.filename}`,
      url: `http://127.0.0.1:3000/uploads/${file.filename}`,
      id: Math.floor(Math.random() * (90000000000000 - 10000000000000 + 1)) + 10000000000000,
      width: '1920', // Random metadata send by discord, we hardcode it since we don't care,  some scripts use it to display info,
      height: '1080', // Random metadata send by discord, we hardcode it since we don't care,  some scripts use it to display info,
      size: fileSizeInBytes // Random metadata send by discord, some scripts use it to display info,
    }
  });
  const data = {"attachments": attachments}
  console.log("Upload request")
  res.send(data)
});

app.get('/uploads/:filename', (req, res) => {
  const requestedFilename = req.params.filename;

  // Ensure the filename does not contain directory traversal attempts
  if (requestedFilename.includes('..')) {
    res.status(400).send('Invalid filename');
    return;
  }

  const filePath = path.join(__dirname, 'uploads', requestedFilename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send('Not available');
    } else {
      // Serve the file
      res.sendFile(filePath);
    }
  });
});