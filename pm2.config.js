module.exports = {
    apps: [
        {
            name: "ecommerce-app",
            script: "./src/index.ts",
            interpreter: 'node',
            interpreter_args: "-r ts-node/register",
            instances: "max",
            exec_mode: "cluster",
            watch: true,
            ignore_watch: ["node_modules", "logs"],
            env: {
                NODE_ENV: "development",
                DB_URL: process.env.DATABASE_URL,
                FRONT_URL: process.env.FRONT_URL,
            },
            env_production: {
                NODE_ENV: "production",
            },
            daemon_mode: false,
        },
    ],
};