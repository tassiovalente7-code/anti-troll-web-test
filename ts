
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Anti-Troll Extreme Lab</title>
<style>
body {
  background: #101827;
  color: white;
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 30px 15px;
}
main {
  max-width: 500px;
  margin: auto;
  background: #1b293b;
  padding: 25px;
  border-radius: 18px;
}
button {
  padding: 15px 22px;
  margin: 8px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
#start { background: #65d6a4; }
#stop { background: #ffcf70; }
#status { margin-top: 20px; }
progress { width: 100%; }
</style>
</head>
<body>

<main>
<h1>Anti-Troll Extreme Lab</h1>
<p>Teste controlado de desempenho multiplataforma.</p>

<h3>Duração: 15 segundos</h3>

<button id="start">INICIAR TESTE</button>
<button id="stop" disabled>PARAR</button>

<p id="status">Aguardando início...</p>
<progress id="progress" value="0" max="15"></progress>

<p id="result"></p>
</main>

<script>
let workers = [];
let interval;
let startTime;
let running = false;

const start = document.getElementById("start");
const stop = document.getElementById("stop");
const status = document.getElementById("status");
const progress = document.getElementById("progress");
const result = document.getElementById("result");

function finish(message) {
  if (!running) return;

  running = false;
  clearInterval(interval);

  workers.forEach(worker => worker.terminate());
  workers = [];

  start.disabled = false;
  stop.disabled = true;

  status.textContent = message;
  result.textContent = "Teste finalizado com segurança.";
}

start.onclick = () => {
  if (running) return;

  running = true;
  start.disabled = true;
  stop.disabled = false;

  startTime = Date.now();
  status.textContent = "Teste em execução...";
  result.textContent = "";

  const code = `
    self.onmessage = () => {
      const end = Date.now() + 15000;
      let n = 0;

      function work() {
        const batchEnd = performance.now() + 15;

        while (performance.now() < batchEnd) {
          n++;
          Math.sqrt(n);
        }

        if (Date.now() < end) {
          setTimeout(work, 0);
        }
      }

      work();
    };
  `;

  const blob = new Blob([code], {
    type: "application/javascript"
  });

  const url = URL.createObjectURL(blob);

  const count = Math.min(
    2,
    Math.max(1, (navigator.hardwareConcurrency || 2) - 1)
  );

  for (let i = 0; i < count; i++) {
    const worker = new Worker(url);
    worker.postMessage("start");
    workers.push(worker);
  }

  interval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;

    progress.value = Math.min(elapsed, 15);

    if (elapsed >= 15) {
      finish("Teste concluído!");
      URL.revokeObjectURL(url);
    }
  }, 100);
};

stop.onclick = () => {
  finish("Teste interrompido manualmente.");
};
</script>

</body>
</html>
