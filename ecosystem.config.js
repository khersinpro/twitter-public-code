module.exports = {
  apps : [{
    name: "twitter",
    script: './bin/www',
    instances: "max",
    autorestart: true,
    watch: true,
    ignore_watch: "public",
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }],
};
