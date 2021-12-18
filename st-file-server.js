#!/usr/bin/env node
const fs = require("fs")
const path = require("path")
const http = require("http")  
const open = require("open")
const render = require("./render")
const { argv } = require('yargs')
const PORT = argv.p || 8080
const baseDir = path.resolve(argv._[0] || process.cwd() )


const server = http.createServer(async (req, res) => {
    const url = decodeURIComponent(req.url)
    const targetPath = path.join(baseDir, url)
    if (!targetPath.startsWith(baseDir)) {
        res.writeHead(401)
        res.end("401 Unauthorized")
        return
    }


    fs.stat(targetPath, (err, stat) => {
        if (err) {
            res.writeHead(404)
            res.end("404 File Not Found")
        } else {
            if (stat.isFile()) {
                fs.createReadStream(targetPath).pipe(res)
            } else if (stat.isDirectory()) {
                if (!req.url.endsWith("/")) {
                    res.writeHead(302, {
                        "Location": req.url + "/"
                    })
                    res.end()
                    return
                }
                const indexPath = path.join(targetPath, "index.html")
                fs.stat(indexPath, (err, stat) => {
                    if (err) {
                        res.writeHead(200, {
                            "Content-Type": "text/html; charset=UTF-8"
                        })
                        fs.readdir(targetPath, { withFileTypes: true }, async (err, entries) => {
                            const pageHtml = await render(entries, targetPath, url, PORT)
                            res.write(pageHtml)
                            res.end()
                        })
                    } else {
                        res.writeHead(200, {
                            "Content-Type": "text/html"
                        })
                        fs.createReadStream(indexPath).pipe(res)
                    }
                })
            }
        }
    })
})



server.listen(PORT, () => {
    console.log('server listening on port', PORT)
    open('http://localhost:' + PORT)
})


