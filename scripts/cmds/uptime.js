const os = require("os");
const fs = require("fs");
const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "up",
    version: "7.0-ultra-machine",
    author: "custom ultra rare",
    cooldowns: 5,
    role: 0,
    shortDescription: "Ultra rare animated system monitor",
    longDescription: "Radar overview + side per-core CPU bars + neon cyber style",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const W = 1400, H = 700;
    const encoder = new GIFEncoder(W, H);
    const outPath = `${__dirname}/up_ultra_machine.gif`;

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(120);
    encoder.setQuality(20);

    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);

    const totalMem = os.totalmem() / 1024 / 1024;
    const usedMem = (os.totalmem() - os.freemem()) / 1024 / 1024;
    const ramPct = (usedMem / totalMem) * 100;

    const load = os.loadavg()[0];
    const cpu = os.cpus()[0].model;
    const cores = os.cpus().length;
    const perCore = os.cpus().map(c => {
      const total = c.times.user + c.times.sys + c.times.idle;
      return 100 - (c.times.idle / total) * 100;
    });

    const platform = os.platform();
    const arch = os.arch();
    const node = process.version;
    const host = os.hostname();

    for (let f = 0; f < 12; f++) {
      const sweepAngle = ((Date.now() + f * 80) % 6000) / 6000 * Math.PI * 2;

      // Background
      ctx.fillStyle = "#05070a";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "#0c1f2a";
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }
      for (let i = 0; i < H; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
      }

      drawRadar(ctx, 260, 260, 120, ramPct, "#00ffaa", "RAM", sweepAngle);
      drawRadar(ctx, 260, 470, 120, Math.min(load * 20, 100), "#ffaa00", "LOAD", sweepAngle + 0.5);

      ctx.font = "bold 50px Arial";
      const grad = ctx.createLinearGradient(450, 0, 1000, 0);
      grad.addColorStop(0, "#00ffaa");
      grad.addColorStop(1, "#ffaa00");
      ctx.fillStyle = grad;
      ctx.fillText("SYSTEM CORE ULTRA", 450, 80);

      ctx.font = "26px Arial";
      ctx.fillStyle = "#d0faff";
      const info = [
        `⏱ Uptime    : ${d}d ${h}h ${m}m`,
        `💽 RAM      : ${usedMem.toFixed(0)} / ${totalMem.toFixed(0)} MB`,
        `🧠 CPU      : ${cpu}`,
        `🧠 Cores    : ${cores}`,
        `🐧 Platform : ${platform} (${arch})`,
        `📈 Load Avg : ${load.toFixed(2)}`,
        `⚙️ Node     : ${node}`,
        `🔖 Host     : ${host}`
      ];
      let iy = 160;
      info.forEach(t => { ctx.fillText(t, 450, iy); iy += 45; });

      const cpuX = 950;
      const cpuY = 150;
      const bw = 350;
      const bh = 22;

      ctx.font = "bold 28px Arial";
      ctx.fillStyle = "#ff66ff";
      ctx.fillText("CPU CORES", cpuX, cpuY - 30);

      perCore.forEach((p, i) => {
        const py = cpuY + i * (bh + 14);
        const pulse = p + Math.sin(f / 2 + i) * 5;
        const color = `hsl(${(i / perCore.length) * 360},100%,60%)`;
        drawBar(ctx, cpuX, py, bw, bh, pulse, color, `Core ${i}`);
      });

      ctx.strokeStyle = "#00ffaa";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(420, 120);
      ctx.lineTo(420, 580);
      ctx.stroke();

      encoder.addFrame(ctx);
    }

    encoder.finish();
    fs.writeFileSync(outPath, encoder.out.getData());

    message.reply({
      body: "🧬 ULTRA RARE ANIMATED SYSTEM STATUS",
      attachment: fs.createReadStream(outPath)
    });
  }
};

// ---------- Helpers ----------

function drawRadar(ctx, x, y, r, percent, color, label, sweep) {
  ctx.strokeStyle = "#1b2b33";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * percent) / 100);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = color + "33";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r + 10, sweep - 0.05, sweep);
  ctx.stroke();

  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(label, x - 30, y + r + 35);

  ctx.font = "bold 32px Arial";
  ctx.fillStyle = "#00ffaa";
  ctx.fillText(percent.toFixed(1) + "%", x - 40, y + 8);
}

function drawBar(ctx, x, y, w, h, percent, color, label) {
  ctx.fillStyle = "#1a2a3a";
  roundRect(ctx, x, y, w, h, 10, true);

  ctx.fillStyle = color;
  roundRect(ctx, x, y, Math.max(0, Math.min(w, (percent / 100) * w)), h, 10, true);

  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${label}: ${percent.toFixed(1)}%`, x + 10, y + 16);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
}
