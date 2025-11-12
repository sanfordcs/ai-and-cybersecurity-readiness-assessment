# AI & Cybersecurity Readiness Assessment

A comprehensive React application for evaluating organizational readiness for AI adoption and cybersecurity posture.

## Features

- Multi-step survey with 24 questions across 6 categories
- Real-time scoring and risk assessment
- Personalized recommendations
- PDF report generation
- Email notifications via Netlify serverless function with EmailIt SMTP

## ✅ Email Configuration (Netlify + EmailIt SMTP)

**This application uses a Netlify serverless function with EmailIt SMTP via Nodemailer.**

### Required Configuration

1. **Set up Netlify environment variable:**
   - Go to your Netlify site settings
   - Navigate to "Environment variables"
   - Add: `EMAILIT_API_KEY` with your EmailIt API key

2. **EmailIt SMTP Settings:**
   ```
   Host: smtp.emailit.com
   Port: 587
   Secure: false (STARTTLS)
   Auth User: emailit
   Auth Pass: [Your EmailIt API Key]
   ```

### Email Settings

```
From: hello@datasolved.com
Admin: ssanford@datasolved.com
Reply-To: [User's email address]
```

### How It Works

The application sends form data to `/.netlify/functions/sendEmail` which:

1. **Validates** the request data
2. **Connects** to EmailIt SMTP using Nodemailer
3. **Sends two emails:**
   - **Admin Notification** → `ssanford@datasolved.com`
     - Contains full assessment details
     - Includes contact information
     - Shows all section scores
     - Reply-to is set to the user's email
   - **User Confirmation** → User's email address
     - Contains personalized results
     - Includes recommendations
     - Call-to-action for consultation booking
4. **Returns** JSON response with success/error status

### Local Development

For local testing with Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Create .env file with your EmailIt API key
echo "EMAILIT_API_KEY=your_api_key_here" > .env

# Run dev server with Netlify functions
netlify dev
```

### Testing Email Functionality

1. Open the Results page after completing an assessment
2. Click the debug icon (🐛) in the top-right corner
3. Click "Run Configuration Test" to verify function connectivity
4. Click "Test Send Email" to send a test email
5. Check the debug logs for detailed information

### Troubleshooting

#### Emails Not Sending

1. **Check Environment Variable**: Verify `EMAILIT_API_KEY` is set in Netlify
2. **Check Function Logs**: View Netlify function logs for errors
3. **Check Console**: Open browser DevTools and look for error messages
4. **Use Debug Panel**: Click the debug icon to see detailed logs
5. **Verify Recipients**: Ensure email addresses are valid

#### Common Errors

- **"Method not allowed"**: Ensure POST request is being sent
- **"Missing required fields"**: Check all required data is included
- **"SMTP connection failed"**: Verify EmailIt credentials
- **"Network Error"**: Check Netlify function deployment status

## Installation

```bash
npm install
```

## Development

```bash
# Standard Vite dev server (without functions)
npm run dev

# With Netlify functions (recommended for testing emails)
netlify dev
```

## Building

```bash
npm run build
```

## Deployment

Deploy to Netlify:

1. Connect your Git repository to Netlify
2. Set the environment variable: `EMAILIT_API_KEY`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Functions directory: `netlify/functions` (auto-detected)

## Environment Variables

**Required for production:**
- `EMAILIT_API_KEY` - Your EmailIt SMTP API key

## Email Template Customization

Email templates are defined in `netlify/functions/sendEmail.js`:
- `generateAdminEmailHTML()` - Admin notification template
- `generateUserConfirmationHTML()` - User confirmation template
- `generateAdminEmailText()` - Plain text version for admin
- `generateUserConfirmationText()` - Plain text version for user

## Support

For issues or questions, contact: hello@datasolved.com

## Architecture Notes

- **Frontend**: React + Vite (runs in browser)
- **Backend**: Netlify serverless functions (Node.js)
- **Email**: EmailIt SMTP via Nodemailer
- **PDF**: jsPDF (runs in browser)

## Security Notes

- API key is stored as Netlify environment variable
- Email sending happens server-side via Netlify function
- SMTP credentials never exposed to the browser
- All email sending happens through EmailIt's secure SMTP server