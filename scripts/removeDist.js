/**
 * Created by zhongfan on 2017/12/5.
 */
const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');
const distDir = path.join(`${path.resolve('./')}/dist/${version}`);

const removeFolder = (folderPath) => {
    let files = []
    if (fs.existsSync(folderPath)) {
        files = fs.readdirSync(folderPath)
        files.forEach((file) => {
            console.log("remove file", file)
            const curPath = `${folderPath}/${file}`
            if (fs.statSync(curPath).isDirectory()) {
                removeFolder(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(folderPath)
    }
    console.log(folderPath)
}

removeFolder(distDir)
