# AI & Cybersecurity Readiness Assessment

React application for evaluating organizational readiness for AI adoption and cybersecurity.

## Features

- Multi-step survey with 24 questions across six categories
- Real-time scoring and recommendations
- PDF report generation
- Customer and internal email reports through a Netlify Function and Resend

## Email configuration

The browser posts assessment data to `/.netlify/functions/sendEmail`. The Netlify Function validates the request and sends through Resend. Provider credentials are never exposed to the browser.

Required Netlify environment variable:

- `RESEND_API_KEY`: secret Resend API key

Optional Netlify environment variables:

- `EMAIL_FROM`: verified sender, defaults to `DataSolved <hello@datasolved.com>`
- `ADMIN_RECIPIENTS`: comma-separated internal recipients, defaults to `ssanford@datasolved.com,sales@datasolved.com`

The function sends a report to the assessment participant and an internal notification to the configured recipients. The internal message uses the participant's address as `Reply-To`.

## Local development

```bash
npm install
npm run dev
```

To test the Netlify Function locally, configure a private local environment file and use Netlify CLI. Never commit provider credentials.

## Validation

```bash
npm run lint:error
npm run test:email
npm run build
```

## Deployment

Netlify builds `main` with `npm run build`, publishes `dist`, and deploys functions from `netlify/functions`.
