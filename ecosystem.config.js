module.exports = {
  apps : [{
    name   : "app",
    script : "./dist/src/app.js",
    cwd: "/home/st111/backendWanderAI",
    env_production: {
      NODE_ENV: "production"
    }
  }]
}
