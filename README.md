# ProjectYAT Frontend

## API Integration

The frontend reads the backend URL from `VITE_API_BASE_URL`.

1. Local development:
	- Copy `.env.example` to `.env`
	- Set `VITE_API_BASE_URL` (example: `http://localhost:8080/api`)

2. Netlify production:
	- In Netlify site settings, add environment variable `VITE_API_BASE_URL`
	- Set it to your deployed backend API root (example: `https://your-backend-domain/api`)
	- Trigger a redeploy

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```
