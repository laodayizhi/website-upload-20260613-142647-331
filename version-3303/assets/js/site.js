(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (slides.length > 1) {
            if (prev) {
                prev.addEventListener('click', function () {
                    showSlide(current - 1);
                    startTimer();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    showSlide(current + 1);
                    startTimer();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    showSlide(index);
                    startTimer();
                });
            });
            startTimer();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilter(panel) {
        var scope = panel.closest('.page-shell') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var category = panel.querySelector('[data-filter-category]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var emptyState = scope.querySelector('[data-empty-state]');
        var query = new URLSearchParams(window.location.search).get('q');

        if (query && keyword) {
            keyword.value = query;
        }

        function applyFilter() {
            var keywordValue = normalize(keyword && keyword.value);
            var categoryValue = normalize(category && category.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matched = true;

                if (keywordValue && haystack.indexOf(keywordValue) === -1) {
                    matched = false;
                }
                if (categoryValue && normalize(card.getAttribute('data-category')) !== categoryValue) {
                    matched = false;
                }
                if (typeValue && normalize(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
                    matched = false;
                }
                if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [keyword, category, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(setupFilter);

    function startPlayer(stage) {
        if (!stage || stage.classList.contains('is-playing')) {
            return;
        }

        var video = stage.querySelector('video');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-video-url');

        if (!source) {
            return;
        }

        stage.classList.add('is-playing');
        video.setAttribute('controls', 'controls');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            stage.hlsInstance = hls;
            return;
        }

        video.src = source;
        video.play().catch(function () {});
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (stage) {
        var button = stage.querySelector('[data-player-start]');
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayer(stage);
            });
        }
        stage.addEventListener('click', function (event) {
            if (!stage.classList.contains('is-playing')) {
                event.preventDefault();
                startPlayer(stage);
            }
        });
    });
})();
