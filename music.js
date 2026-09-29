(() => {
  const audio = document.getElementById('wedding-music');
  const button = document.getElementById('music-toggle');
  let attempted = false;
  let pending = false;
  function render() {
    const playing = !audio.paused;
    button.textContent = playing ? '♫ 暂停音乐' : '♫ 播放音乐';
    button.setAttribute('aria-pressed', String(playing));
  }
  async function play() {
    if (pending) return;
    pending = true;
    button.textContent = '♫ 音乐加载中';
    try { await audio.play(); } catch (_) { /* User can retry the play button. */ }
    finally { pending = false; render(); }
  }
  button.addEventListener('click', () => {
    attempted = true;
    if (pending) { audio.pause(); return; }
    if (audio.paused) play(); else audio.pause();
  });
  document.addEventListener('click', event => {
    if (attempted || button.contains(event.target)) return;
    attempted = true;
    play();
  });
  audio.addEventListener('play', render);
  audio.addEventListener('pause', render);
  audio.addEventListener('error', () => { button.textContent = '♫ 点击重试音乐'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) audio.pause(); });
  window.addEventListener('pagehide', () => audio.pause());
})();
