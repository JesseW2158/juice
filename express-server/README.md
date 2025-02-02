# Juice Express Server

This is the Express.js server component of the Juice application, responsible for handling video uploads and other API functionality.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your actual configuration values.

## Development

Run the server in development mode with hot reloading:
```bash
npm run dev
```

## Production

Start the server in production mode:
```bash
npm start
```

## API Endpoints

### Video Upload
- **POST** `/api/video/upload`
  - Multipart form data with fields:
    - `video`: Video file
    - `token`: User authentication token
    - `description`: Video description
    - `stretchId`: Associated juice stretch ID
    - `stopTime`: Time when the stretch ended

## Environment Variables

- `PORT`: Server port (default: 3001)
- `AWS_ACCESS_KEY_ID`: AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region
- `AWS_S3_BUCKET`: S3 bucket name
- `AIRTABLE_API_KEY`: Airtable API key
- `AIRTABLE_BASE_ID`: Airtable base ID
- `AIRTABLE_TABLE_NAME`: Airtable table name 