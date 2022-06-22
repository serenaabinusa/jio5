const { promisify } = require("util");
const pm2 = require("pm2");

const DIR = process.cwd();
const LOG_FOLDER = DIR + "/src/log/pm2";
const FILE_NAME = "app.js";

const getStartOptions = (filename) => {
  const alias = filename.replace(".js", "");

  return {
    script: `${DIR}/${filename}`,
    name: filename,
    log_date_format: "YYYY-MM-DD HH:mm Z",
    output: `${LOG_FOLDER}/${alias}.stdout.log`,
    error: `${LOG_FOLDER}/${alias}.stderr.log`,
    exec_mode: "fork",
  };
};

const startProcess = async (filename) => {
  const proc = getStartOptions(filename);

  return promisify(pm2.start).call(pm2, proc);
};
const disconnectProcess = async () => {
  return promisify(pm2.disconnect);
};

const restartProcess = async (filename) => {
  return promisify(pm2.restart).call(pm2, filename);
};

const stopProcess = async (filename) => {
  return promisify(pm2.stop).call(pm2, filename);
};

const getProcesses = async (filename) => {
  const processes = [];

  const [proc] = await promisify(pm2.describe).call(pm2, filename);

  if (proc) {
    processes.push(proc);
  } else {
    processes.push({
      name: app,
      pm2_env: {
        status: "stopped",
      },
    });
  }

  return processes;
};

module.exports = {
  startProcess,
  disconnectProcess,
  restartProcess,
  stopProcess,
  getProcesses,
};
