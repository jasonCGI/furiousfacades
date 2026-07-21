# Furious Facades

Temporary website scaffold prepared for deployment on Railway.

## Run locally

```powershell
npm start
```

Open `http://localhost:3000` in a browser. The health check is available at
`http://localhost:3000/health`.

## Deploy on Railway

1. Push this directory to a GitHub repository.
2. In Railway, create a new project from that repository.
3. Deploy the service. No environment variables are required.
4. Generate a public domain in the service networking settings.

Railway detects the Node app and runs `npm start`. The server reads Railway's
`PORT` variable automatically.
