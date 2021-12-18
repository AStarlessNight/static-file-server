#!/usr/bin/env node

const filesize = require("filesize")
const fs = require("fs")
const path = require("path")
const moment = require("moment")
const pug = require("pug")



const compiledFunction = pug.compileFile(path.join(__dirname, "index.pug"))



async function render(entries, parentDir, url, port) {
    if (url !== "/") {
        entries.unshift({ name: "..", isFile: () => false })
    }
    await Promise.all(entries.map((entry, idx) => {
        return fs.promises.stat(path.join(parentDir, entry.name)).then((stat) => {
            entry.isFile() && (entry.size = filesize(stat.size))
            entry.ctime = moment(stat.ctime).format("YYYY-MM-DD HH:mm")
            entry.href = encodeURIComponent(entry.name) + (entry.isFile() ? "" : "/")
        })
    }))
    return compiledFunction({ entries, parentDir, url, filesize, port })
} 


module.exports = render