// Most of the code in this file was based on this guide:
// https://developers.google.com/sheets/api/quickstart/nodejs#step_3_set_up_the_sample

// While the file inside here use any env variables, other things
// using sheets will later on.
require('dotenv').config()

const fs = require('fs')
const readline = require('readline')
const {google} = require('googleapis')

const root = require('app-root-path')

const util = require('util')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const access = util.promisify(fs.access)

// If modifying these scopes, delete token.json.
const scopes = ['https://www.googleapis.com/auth/spreadsheets']

const credentialsPath = root + '/credentials/credentials.json'
const tokenPath = root + '/credentials/token.json'

const open = require('open')

// Code is stolen from here
// https://alexey.detr.us/en/posts/2019/2019-04-27-promise-and-async-await-mixing-errors-handling/
const fileExists = async path => {
  return access(path)
        .then(() => true)
        .catch(() => false)
}

// Gets a new oauth token by either reading it from file or
// asking the user to generate a new one if a cached one is not present.
const getCode = async oAuth2Client => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })

  console.log('Opening OAuth2 authentication page...')

  open(authUrl)

  console.log('If page did not open, open the following link in your browser:')
  console.log(authUrl, '\n')

  console.log('Enter the code from that page: ')

  // Make the console interactive so we can ask for the auth code.
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  let token

  // Reads input from the user
  for await (const code of rl) {
    try {
      response = await oAuth2Client.getToken(code)
      token = response.tokens

      // Store the token to disk for later executions
      await writeFile(root + '/credentials/token.json', JSON.stringify(token))
      console.log('Token stored to', tokenPath);

    } catch (err) {
      console.error('Error while retrieving token.', err)

    } finally {
      // Stop listening for input.
      rl.close()
    }

    return token
  }
}

// Creates an oauth client with a cached token or a new one.
const authorize = async _ => {
  // Load client secrets from a local file.
  const credentialsFile = await readFile(credentialsPath)
  const credentials = JSON.parse(credentialsFile)

  const {client_secret, client_id, redirect_uris} = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  let token

  if (await fileExists(tokenPath)) {
    const tokenFile = await readFile(tokenPath)
    token = JSON.parse(tokenFile)

  } else {
    token = await getCode(oAuth2Client)
  }

  oAuth2Client.setCredentials(token)

  return oAuth2Client
}

const getSheets = async _ => {
  const oAuth2Client = await authorize()
  return google.sheets({version: 'v4', auth: oAuth2Client})
}

module.exports = getSheets
