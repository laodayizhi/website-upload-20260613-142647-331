(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function playVideo(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function setup(wrapper) {
    var video = wrapper.querySelector('video[data-stream-url]');
    var button = wrapper.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    function prepare() {
      var url = video.getAttribute('data-stream-url');
      if (!url) {
        return;
      }
      button.classList.add('hidden');
      if (video.getAttribute('data-ready') === '1') {
        playVideo(video);
        return;
      }
      video.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function () {
          playVideo(video);
        }, { once: true });
        video.load();
        playVideo(video);
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video);
        });
        wrapper.hlsInstance = hls;
        return;
      }
      video.src = url;
      video.load();
      playVideo(video);
    }
    button.addEventListener('click', prepare);
    video.addEventListener('click', function () {
      if (video.paused) {
        prepare();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('hidden');
    });
  }

  ready(function () {
    document.querySelectorAll('.movie-player').forEach(setup);
  });
})();
