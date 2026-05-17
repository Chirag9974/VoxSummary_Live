const { execFile } = require("child_process");
const path = require("path");
const { stderr } = require("process");

const transcribeWithPython = (audioPath)=>{
    return new Promise((resolve,reject)=>{
        const scriptPath = path.join(__dirname, "../python/transcribe.py");

        execFile("python",
            [scriptPath,audioPath],
            (error,stdout,stderr)=>{
                if(error){
                    console.error("Python error:", stderr);
                    return reject(error);
                }
                resolve(stdout.trim());
            }
        )
    })
}

module.exports = transcribeWithPython;