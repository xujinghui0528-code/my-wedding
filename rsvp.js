(() => {
  const endpoint = 'https://script.google.com/macros/s/AKfycbxqzhp2Niumno2XKmkafaJ-ruoO8n1VgxRIy8NU10gUliBln2Keivk8OL1a5u2mrewlXQ/exec';
  const form = document.getElementById('rsvp-form');
  const message = document.getElementById('form-message');
  const submit = form.querySelector('button[type="submit"]');
  let sending = false;
  let lastSaved = '';
  function values() {
    const data = new FormData(form);
    const reply = Object.fromEntries(data.entries());
    reply.stay = data.getAll('stay').join('、') || '未选择';
    reply.submittedAt = new Date().toLocaleString('zh-CN', { timeZone:'Asia/Shanghai' });
    return reply;
  }
  function show(text, error = false) {
    message.className = error ? 'form-message error' : 'form-message';
    message.textContent = text;
    message.style.display = 'block';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const reply = values();
    const fingerprint = JSON.stringify({ ...reply, submittedAt: '' });
    if (fingerprint === lastSaved) {
      show('这份回信已保存成功，无需重复寄送。');
      return;
    }
    sending = true;
    submit.disabled = true;
    submit.textContent = '回信寄送中…';
    show('正在寄送，请稍候。');
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timer;
    try {
      const request = fetch(endpoint, {
        method:'POST', mode:'cors', credentials:'omit', redirect:'follow',
        headers:{'Content-Type':'text/plain;charset=UTF-8'},
        body:JSON.stringify(reply),
        ...(controller ? {signal:controller.signal} : {})
      }).then(async response => {
        if (!response.ok || response.type === 'opaque') throw new Error('server');
        const result = (await response.text()).trim();
        if (result !== 'success') throw new Error('not-saved');
        return true;
      });
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('timeout'));
          if (controller) controller.abort();
        }, 20000);
      });
      await Promise.race([request, timeout]);
      lastSaved = fingerprint;
      show('回信已保存成功，期待在山谷与你相见。');
    } catch (error) {
      show(error.message === 'not-saved'
        ? '回信服务未能确认保存，请稍后再试。填写内容已保留。'
        : '暂时无法连接回信服务或确认保存结果，填写内容已保留，请勿连续重复提交。', true);
    } finally {
      clearTimeout(timer);
      sending = false;
      submit.disabled = false;
      submit.textContent = '寄 出 回 信';
    }
  });
})();
