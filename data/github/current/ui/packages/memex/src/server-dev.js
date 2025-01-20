// @ts-check
// Written with JS (not TS) to avoid introducing a new 'tsconfig.json' for a single file.

const path = require('path')
const express = require('express')

const SERVER_PORT = 9091

const app = express()

app.use(express.static(path.join(__dirname, 'memex-stories')))

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'memex-stories', 'index.html'))
})

app.listen(SERVER_PORT, () => console.log(`Server started at http://localhost:${SERVER_PORT}`))
