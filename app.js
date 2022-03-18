import { Low, JSONFile } from 'lowdb' 
import express from 'express'

// setup Express
const app = express()
app.use(express.json())

const db = new Low(new JSONFile('data.json'))
await db.read()

db.data ||= { users: [{
    name: 'default',
    token: '12345678',
    frames: []
}]}

const { users } = db.data

// API Endpoints
app.get('/frames', (req, res) => {
    // No last synchronization timestamp sent, return Bad Request
    if (!req.query.last_sync) {
        res.sendStatus(400)
    }
    
    // Get auth token
    let token = req.headers.authorization.substring(6)
    let user = token ? users.find((u) => u.token == token) : null
    if (user) {
        // User authenticated
        console.log(`GET to /frames from user "${user.name}".`)
        
        // Check for new frames since last sync
        let newFrames = []
        user.frames.forEach((frame) => {
            if (Date.parse(frame.end_at) > Date.parse(req.query.last_sync) 
                || Date.parse(frame.last_update) > Date.parse(req.query.last_sync)) {
                newFrames.push(frame)
            }
        })
        
        console.log(`Sent ${newFrames.length} new frame(s).`)
        res.status(200).send(newFrames)
    } else {
        // User unauthenticated
        console.log(`Token "${token}" failed to authenticate.`)
        res.status(401).send('Invalid token.')
    }   
})

app.post('/frames/bulk', async (req, res) => {
    // Get auth token
    let token = req.headers.authorization.substring(6)
    let user = token ? users.find((u) => u.token == token) : null
    if (user) {
        // User authenticated
        console.log(`POST to /frames/bulk from user "${user.name}".`)
        // Add new frames or replace
        req.body.forEach((newFrame) => {
            let oldIndex = user.frames.map(frame => frame.id).indexOf(newFrame.id)
            if (oldIndex != -1) {
                user.frames[oldIndex] = newFrame
                user.frames[oldIndex].last_update = new Date()
            } else {
                newFrame.last_update = new Date()
                user.frames.push(newFrame)
            }
        })
        
        console.log(`Added ${req.body.length} new frame(s).`)
        await db.write()
        res.sendStatus(201)
    } else {
        // User unauthenticated
        console.log(`Token "${token}" failed to authenticate.`)
        res.status(401).send('Invalid token.')
    }
})

const port = 4242
app.listen(port, () => console.log(`stage2 is listening on port ${port}.`))