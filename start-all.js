const { spawn } = require("node:child_process");

const procs = [];
let shuttingDown = false;
let firstExitCode = 0;

const tasks = [
  { name: "api", cmd: "npm", args: ["run", "start:api"] },
  { name: "worker", cmd: "npm", args: ["run", "start:worker"] },
  { name: "web", cmd: "npm", args: ["run", "start:web"] },
];

function pipeWithPrefix(stream, label, dest) {
  stream.on("data", (chunk) => {
    dest.write(`[${label}] ${chunk.toString()}`);
  });
}

function killProc(p) {
  try {
    // Kill the entire process group (npm + children like nest/ng)
    process.kill(-p.proc.pid, "SIGTERM");
  } catch {
    try {
      p.proc.kill("SIGTERM");
    } catch {
      // ignore
    }
  }
}

function forceKillProc(p) {
  try {
    process.kill(-p.proc.pid, "SIGKILL");
  } catch {
    try {
      p.proc.kill("SIGKILL");
    } catch {
      // ignore
    }
  }
}

function shutdown(reason) {
  if (shuttingDown) return;
  shuttingDown = true;

  process.stderr.write(`\n[orchestrator] shutdown (${reason})\n`);

  for (const p of procs) {
    killProc(p);
  }

  // If any process is still alive after 3s, force kill with SIGKILL
  const forceTimer = setTimeout(() => {
    for (const p of procs) {
      forceKillProc(p);
    }
    process.exit(firstExitCode || 0);
  }, 3000);

  forceTimer.unref();

  // Exit once all child processes have confirmed termination.
  // Check exitCode first in case a process already exited before shutdown was called.
  const exitPromises = procs.map((p) => {
    if (p.proc.exitCode !== null) return Promise.resolve();
    return new Promise((resolve) => p.proc.once("exit", resolve));
  });

  Promise.all(exitPromises).then(() => {
    clearTimeout(forceTimer);
    process.exit(firstExitCode || 0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

for (const t of tasks) {
  const proc = spawn(t.cmd, t.args, {
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
    // detached: true allows killing the entire process group via -pid
    detached: true,
  });

  procs.push({ name: t.name, proc });

  pipeWithPrefix(proc.stdout, t.name, process.stdout);
  pipeWithPrefix(proc.stderr, t.name, process.stderr);

  proc.on("exit", (code) => {
    if (shuttingDown) return;
    firstExitCode = typeof code === "number" ? code : 1;
    shutdown(`process ${t.name} exited`);
  });

  proc.on("error", (err) => {
    if (shuttingDown) return;
    firstExitCode = 1;
    process.stderr.write(`[${t.name}] spawn error: ${err?.message ?? String(err)}\n`);
    shutdown(`spawn error (${t.name})`);
  });
}
