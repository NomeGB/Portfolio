// ─────────────────────────────────────────────────────────────
// json
const DATA_URL = '/pages/data-3d.json'; 
// ─────────────────────────────────────────────────────────────

let PAGE_CONFIG = null;

// ─── general load ──────────────────────────────────────────────────────────
fetch(DATA_URL)
    .then(r => r.json())
    .then(data => {
        PAGE_CONFIG = data;
        init();
    })
    .catch(err => {
        console.error('Error cargando JSON:', err);
        document.getElementById('loadingScreen').innerHTML = '<span>Error loading data</span>';
    });

function init() {
    document.title = `Portfolio — ${PAGE_CONFIG.title}`;
    document.getElementById('heroTitle').textContent    = PAGE_CONFIG.title;
    document.getElementById('heroSubtitle').textContent = PAGE_CONFIG.subtitle;
    document.getElementById('stickyTitle').textContent  = PAGE_CONFIG.title;

    buildFilters();
    buildTiles();

    const loading = document.getElementById('loadingScreen');
    loading.classList.add('done');
    setTimeout(() => loading.remove(), 400);

    const circle = document.getElementById('irisCircle');
    circle.setAttribute('r', 0);
    const maxR  = Math.hypot(window.innerWidth, window.innerHeight);
    const start = performance.now();

    function animateIris(now) {
        const t = Math.min((now - start) / 1000, 1);
        const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
        circle.setAttribute('r', e * maxR);
        if (t < 1) requestAnimationFrame(animateIris);
        else document.getElementById('introTransition').remove();
    }
    requestAnimationFrame(animateIris);

    animateChars('#heroTitle', 0.2);

    setTimeout(() => {
        const sub = document.getElementById('heroSubtitle');
        sub.style.transition = 'opacity 1s ease, transform 1s ease';
        sub.style.opacity = '1';
        sub.style.transform = 'translateY(0)';
    }, 600);

    window.addEventListener('scroll', onScroll);
}

function animateChars(sel, delay) {
    const el = document.querySelector(sel);
    if (!el) return;
    const text = el.textContent;
    el.textContent = '';
    text.split('').forEach((c, i) => {
        const s = document.createElement('span');
        s.textContent = c === ' ' ? '\u00A0' : c;
        s.style.cssText = `opacity:0;display:inline-block;animation:charFadeIn 0.3s ease ${delay + i*0.045}s forwards`;
        el.appendChild(s);
    });
}

// ─── scroll ──────────────────────────────────────────────────────────
const heroTitle    = document.getElementById('heroTitle');
const heroSubtitle = document.getElementById('heroSubtitle');
const stickyHdr    = document.getElementById('stickyHeader');
const filterBar    = document.getElementById('filterBar');
let tilesRevealed  = false;

function onScroll() {
    const scrollY = window.scrollY;
    const vh      = window.innerHeight;
    const p       = Math.min(scrollY / vh, 1);
    const upP = Math.max(0, Math.min((p - 0.62) / 0.38, 1));

    heroSubtitle.style.opacity   = String(Math.max(0, 1 - upP * 2.5));
    heroSubtitle.style.transform = `translateY(${-upP * 40}px)`;

    heroTitle.style.transform = `translateY(${-upP * vh * 0.41}px) scale(${1 - upP * 0.87})`;
    heroTitle.style.opacity   = String(1 - upP * 0.35);

    stickyHdr.classList.toggle('visible', p > 0.55);
    filterBar.classList.toggle('visible', scrollY > vh * 0.5);
    if (scrollY > vh * 0.5 && !tilesRevealed) revealTiles();
}

// ─── filters ──────────────────────────────────────────────────────────
function buildFilters() {
    const bar = document.getElementById('filterBar');
    bar.innerHTML = '';
    PAGE_CONFIG.tags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className   = 'filterBtn' + (tag === 'All' ? ' active' : '');
        btn.textContent = tag;
        btn.addEventListener('click', () => {
            bar.querySelectorAll('.filterBtn').forEach(b =>
                b.classList.toggle('active', b.textContent === tag)
            );
            document.querySelectorAll('.tile').forEach(tile => {
                const match = tag === 'All' || tile.dataset.tags.split(',').includes(tag);
                tile.classList.toggle('filtered', !match);
            });
        });
        bar.appendChild(btn);
    });
}

// ─── titles ──────────────────────────────────────────────────────────
function buildTiles() {
    const container = document.getElementById('tilesContainer');
    container.innerHTML = '';

    PAGE_CONFIG.items.forEach((item, idx) => {
        const tile = document.createElement('div');
        tile.className = 'tile' + (item.large ? ' large' : '');
        tile.dataset.index = idx;
        tile.dataset.tags  = item.tags.join(',');

        const firstMedia = item.content.find(b => b.type === 'image' || b.type === 'video');
        const thumbSrc   = item.thumb || (firstMedia ? firstMedia.src : '');

        if (thumbSrc.match(/\.(mp4|webm)$/i)) {
            const v = document.createElement('video');
            v.src = thumbSrc;
            v.muted = true;
            v.loop = true;
            v.autoplay = true;
            v.playsInline = true;
            tile.appendChild(v);
        } else {
            const img = document.createElement('img');
            img.src = thumbSrc;
            img.alt = item.name;
            img.onerror = () => {
                img.style.display='none';
                tile.style.background=`hsl(${260+idx*25},18%,16%)`;
            };
            tile.appendChild(img);
        }

        const overlay = document.createElement('div');
        overlay.className = 'tileOverlay';
        overlay.innerHTML = `<h3>${item.name}</h3>
            <div class="tileTags">
                ${item.tags.map(t=>`<span class="tileTag">${t}</span>`).join('')}
            </div>`;
        tile.appendChild(overlay);

        tile.addEventListener('click', () => openViewer(idx));
        container.appendChild(tile);
    });
}

function revealTiles() {
    tilesRevealed = true;
    document.querySelectorAll('.tile').forEach((t,i) =>
        setTimeout(() => t.classList.add('visible'), i*70)
    );
}

// ─── pages viewer ──────────────────────────────────────────────────────────
let currentIdx = 0;

function openViewer(idx) {
    currentIdx = idx;
    const item = PAGE_CONFIG.items[idx];

    const left  = document.getElementById('viewerLeft');
    const right = document.getElementById('viewerRight');

    // 🚀 Resetear scroll al abrir
    left.scrollTop  = 0;
    right.scrollTop = 0;

    left.innerHTML = '';
    item.content.forEach(block => {
        const el = document.createElement('div');
        el.className = 'vBlock';
        if (block.type === 'image') {
            el.classList.add('media-wrapper');
            el.innerHTML = `
                <div class="media-skeleton"></div>
                <img src="${block.src}" alt="" style="opacity:0" 
                    onload="this.previousElementSibling.remove(); this.style.opacity='1'">
            `;
        }
        else if (block.type === 'video') {
            el.classList.add('media-wrapper');
            el.innerHTML = `
                <div class="media-skeleton"></div>
                <video src="${block.src}" controls playsinline style="opacity:0"
                    onloadeddata="this.previousElementSibling.remove(); this.style.opacity='1'"></video>
            `;
        }
        else if (block.type === 'text')    { el.classList.add('text'); el.textContent = block.value; }
        else if (block.type === 'spacer')  el.classList.add(`spacer-${block.size||'md'}`);
        else if (block.type === 'divider') el.classList.add('divider');
        else if (block.type === 'yt') {
            const url = block.src;
            let videoId = '';
            if (url.includes('youtu.be/'))       videoId = url.split('youtu.be/')[1].split('?')[0];
            else if (url.includes('v='))         videoId = url.split('v=')[1].split('&')[0];
            else if (url.includes('embed/'))     videoId = url.split('embed/')[1].split('?')[0];

            el.classList.add('yt');
            el.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
        }
        left.appendChild(el);
    });

    document.getElementById('viewerTitle').textContent    = item.name;
    document.getElementById('viewerSubtitle').textContent = item.subtitle || '';
    document.getElementById('viewerTags').innerHTML       = item.tags.map(t=>`<span>${t}</span>`).join('');

    document.getElementById('viewer').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeViewer() {
    const viewer = document.getElementById('viewer');
    const right  = document.getElementById('viewerRight');

    viewer.classList.remove('open');
    right.classList.remove('open'); // ← importante para móvil

    document.querySelectorAll('#viewerLeft video').forEach(v => {
        v.pause();
        v.src = '';
    });

    document.body.style.overflow = '';
}

document.getElementById('viewerClose').addEventListener('click', closeViewer);
document.getElementById('viewerPrev').addEventListener('click', () =>
    openViewer((currentIdx - 1 + PAGE_CONFIG.items.length) % PAGE_CONFIG.items.length)
);
document.getElementById('viewerNext').addEventListener('click', () =>
    openViewer((currentIdx + 1) % PAGE_CONFIG.items.length)
);
document.addEventListener('keydown', e => {
    if (!document.getElementById('viewer').classList.contains('open')) return;
    if (e.key === 'Escape') closeViewer();
    if (e.key === 'ArrowRight') document.getElementById('viewerNext').click();
    if (e.key === 'ArrowLeft')  document.getElementById('viewerPrev').click();
});
document.getElementById('viewer').addEventListener('click', e => {
    if (e.target === document.getElementById('viewer')) closeViewer();
});

const viewerInfoToggle = document.getElementById('viewerInfoToggle');
const viewerRight      = document.getElementById('viewerRight');

viewerInfoToggle.addEventListener('click', () => {
    viewerRight.classList.toggle('open');
});