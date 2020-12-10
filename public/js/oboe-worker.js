importScripts('/js/oboe-browser.min.js');

self.onmessage = (evt) => {
  const cmd = evt.data.cmd;
  const url = evt.data.url;
  switch (cmd) {
    case 'start':
      return start(url);
  }
};

const start = (url) => {
  console.log('worker started');
  let chunk = [];

  oboe(url)
    .node('![*]', (item) => {
      if (item) {
        chunk.push(item);
        if (chunk.length >= 1000) {
          self.postMessage({ cmd: 'chunk', chunk: chunk });
          chunk = [];
        }
      }
      return oboe.drop;
    })
    .done((_) => {
      self.postMessage({ cmd: 'done', chunk: chunk });
    })
    .fail((res) => {
      if (res.thrown) {
        console.error(res.thrown.stack);
        self.postMessage({ cmd: 'error', error: res.thrown.message });
      } else {
        console.error(res);
        self.postMessage({ cmd: 'error', error: 'network error' });
      }
    });
};
