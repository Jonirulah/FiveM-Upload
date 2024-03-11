### FiveM-Media-Uploader
Created for storing media in our server as discord recent changes to attachments storage policy affects FiveM servers. I have seen other servers using solutions like Imgur and FiveManage (managed) which for me arent reliable enough.

- Uploads media/images/audio to the cache server and get them deleted after time.
- Works like a webhook so there is no need for reworking old webhook methods.

No SSL is provided within this server (very easy to implement) due that we use it with nginx proxy to Cloudflare as it is more secure in that way.

You can use pm2 or nodemon in case your server crashes somehow and auto-restart it.

40MB is the limit for files even tho you can extend this limit for file extensions.

## Installation
-	Requires NodeJS installed in your server and writing/reading permissions in the upload directory
```shell
npm install
npm start app.js
```
## Usage
Server has two basic endpoints, you could create one for uploads that you dont want them to expire or whatever needs you have. (MDT or other scripts, requires coding)

#### POST /upload (this is where you upload)
Requires multipart requests (by default in FiveM), accepts binary data.

#### GET /uploads/:filename (where you retrieve stored files)
Only requires the image name to be stored in client.

So in very basic terms you would upload to http://127.0.0.1:3000/upload

And retrieve them from http://127.0.0.1:3000/uploads/delete-this.txt being delete-this.txt your stored file.

## OPTIONAL (setup with nginx and cloudflare):

If you need help setting up nginx and cloudflare, i will link you one guide:

[(docs.nginx.com): Create a Reverse-Proxy using nginx](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/ "Create a reverse-proxy using nginx")

[(rackspace.com): Increase Nginx max file size policy](https://docs.rackspace.com/docs/limit-file-upload-size-in-nginx "Increase NGINX max-file-size")
&nbsp;

You have to create your **A** register on your domain provider, we use cloudflare, so we have it like this.
[![Cloudflare setup](https://i.imgur.com/HfwUgRs.png "Cloudflare setup")](https://i.imgur.com/HfwUgRs.png "Cloudflare setup")

Here is what my config looks like in nginx. You still need to create the **A** register in your domain.
[![Creating nginx proxy](https://i.imgur.com/h4o6Fgy.png "Creating nginx proxy")](https://i.imgur.com/h4o6Fgy.png "Creating nginx proxy")

You have to append your domain name in server_name

``server_name api.jonirulah.net;``

And then edit the existing code to send the correct links to your storage 

http://127.0.0.1:3000/upload to https://api.jonirulah.net/upload (example)
