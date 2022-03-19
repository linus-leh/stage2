# stage2
A very simple backend for synchronizing frames from the [Watson](https://github.com/TailorDev/Watson/) CLI time-tracker across multiple devices.

(This project is still in the early stages of development.)

## Setup
Use
```
npm install
npm run start
```
to launch the server.  
To start synchronizing with Watson, type in the following commands on your local machine:
```
watson config backend.url http://<SERVER-IP>:<PORT>
watson config backend.token <YOUR TOKEN>
watson sync
```

The authentication tokens can be changed inside ``data.json``, which will automatically be generated if it doesn't exist. A server restart is required for the changes to take effect.

Example content of the ``data.json`` file:
```json
{
  "users": [
    {
      "name": "default",
      "token": "12345678",
      "frames": []
    }
  ]
}
```

## Configuration
By default the server runs on port 4242. This can be changed in the second to last line inside ``app.js`` (``const port = 4242``).
