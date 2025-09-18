const os = require('os');
const diskusage = require('diskusage');
const path = require('path');

class SystemMonitor {
    async getSystemStats() {
        const cpus = os.cpus();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();

        return {
            cpu: {
                cores: cpus.length,
                model: cpus[0].model,
                speed: cpus[0].speed,
                usage: process.cpuUsage()
            },
            memory: {
                total: totalMemory,
                free: freeMemory,
                used: totalMemory - freeMemory,
                usagePercent: ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2)
            },
            uptime: os.uptime(),
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname()
        };
    }

    async getStorageStatus() {
        try {
            const root = path.parse(process.cwd()).root;
            const info = await diskusage.check(root);

            return {
                total: info.total,
                free: info.free,
                used: info.total - info.free,
                usagePercent: ((info.total - info.free) / info.total * 100).toFixed(2)
            };
        } catch (err) {
            console.error('Error checking disk usage:', err);
            return {
                error: 'Unable to check disk usage',
                details: err.message
            };
        }
    }

    async getUsageStats() {
        const loadAvg = os.loadavg();
        const networkInterfaces = os.networkInterfaces();

        return {
            loadAverage: {
                '1min': loadAvg[0],
                '5min': loadAvg[1],
                '15min': loadAvg[2]
            },
            network: networkInterfaces,
            processMemoryUsage: process.memoryUsage(),
            systemMemoryUsage: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem()
            }
        };
    }
}

module.exports = new SystemMonitor();
