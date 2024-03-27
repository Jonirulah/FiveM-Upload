class Config {
    constructor() {
        this.logging = true; // Enable logs of user requests
        this.port = 3000; // Port to listen
        this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.ogg', '.webm', '.opus', '.webp']; // Extension list of what files we accept
        this.endPoint = 'https://127.0.0.1:3000/uploads/'; // Change it to your domain if proxied/using DNS

        this.ssl = true; // Enable HTTPS for our server (not using Cloudflare/Nginx/Apache) or having (Cloudflare in Full enc mode)
        this.sslPort = 3001;
        this.sslEndpoint = 'https://127.0.0.1:3001/uploads/'
        this.sslPrivateKey = 'domain.key'; // HTTPS key
        this.sslCertificate = 'domain.crt'; // HTTPS cert

        this.citizenFXonly = true; // Accept only requests matching CitizenFX user-agent
    }
}

module.exports = Config;
