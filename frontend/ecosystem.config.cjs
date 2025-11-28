/**
 * PM2 Configuration for VS AI ERP Frontend
 */
module.exports = {
  apps: [
    {
      name: 'vs-erp-frontend',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
