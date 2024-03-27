class Config {
    constructor() {
        this.logging = true; // Enable logs of user requests
        this.port = 3000; // Port to listen
        this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.ogg', '.webm', '.opus', '.webp']; // Extension list of what files we accept
        this.endPoint = 'http://127.0.0.1:3000/uploads/'; // Change it to your domain if proxied/using DNS

        this.ssl = false; // Enable HTTPS for our server (not using Cloudflare/Nginx/Apache) or having (Cloudflare in Full enc mode)
        this.sslPrivateKey = ''; // HTTPS key
        this.sslCertificate = ''; // HTTPS cert
    }
}

module.exports = Config;
