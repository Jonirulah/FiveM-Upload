const fs = require('fs');

function cleanupFiles() {
    console.log("Cleaning up files")
    const uploadDir = './uploads';
    const maxFileAge = 30 * 24 * 60 * 60 * 1000; // 30 days to milliseconds
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
  };

// Periodically check and delete old files every 1 hour (adjust as needed)
setInterval(cleanupFiles, 1 * 60 * 60 * 1000);