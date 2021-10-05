module.exports = {
    apps: [
        {
            "args": "node ./dist/main.js",
            "exec_mode": "cluster",
            "instances": "max",
            "interpreter": "bash",
            "name": "api",
            "script": "yarn",
            "time": true
        }
    ]
}