const { google } = require('googleapis')
require('dotenv').config()

// Change over to OAuth or service accounts, because API key auth can only
// access files which are publicly accessible.
let API_KEY = process.env.GOOGLE_API_KEY

const sheets = google.sheets({version: 'v4', auth: `${API_KEY}`})

module.exports = sheets
