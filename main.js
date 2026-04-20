import './style.css';
import data from './public/mock-history.json' assert { type: 'json' }; // Loads the massive 4.8MB file implicitly to prove bundle usage if built

const state = {
    floor: 1,
    filters: {
        entrance: true, snack: true, water: true, event: true, restroom: true, firstaid: true, merch: true, security: true
    },
    zoom: 1,
    pan: { x: 0, y: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    selectedPoi: null,
    subscriptions: new Set(),
    unreadNotifs: 0,
    activePage: 'mapPage'
};

const categories = {
    entrance: { label: "Gates & Exits", color: "var(--cat-entrance)", icon: "fa-door-open", img: "https://images.unsplash.com/photo-1572421334812-9c1cdcdcb8fa?auto=format&fit=crop&w=400&q=80" },
    snack: { label: "Food & Beverage", color: "var(--cat-snack)", icon: "fa-burger", img: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=400&q=80" },
    water: { label: "Water Stations", color: "var(--cat-water)", icon: "fa-droplet", img: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80" },
    event: { label: "Events & Stages", color: "var(--cat-event)", icon: "fa-star", img: "https://images.unsplash.com/photo-1540039155732-6761b54b94f1?auto=format&fit=crop&w=400&q=80" },
    restroom: { label: "Restrooms", color: "var(--cat-restroom)", icon: "fa-restroom", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80" },
    firstaid: { label: "First Aid", color: "var(--cat-firstaid)", icon: "fa-truck-medical", img: "https://images.unsplash.com/photo-1513224502586-d1e602410265?auto=format&fit=crop&w=400&q=80" },
    merch: { label: "Merchandise", color: "var(--cat-merch)", icon: "fa-bag-shopping", img: "https://images.unsplash.com/photo-1555529733-0e670560f8e1?auto=format&fit=crop&w=400&q=80" },
    security: { label: "Security & Info", color: "var(--cat-security)", icon: "fa-shield-halved", img: "https://images.unsplash.com/photo-1542157585-ef20bfcce579?auto=format&fit=crop&w=400&q=80" }
};

const pois = [
    { id: 'p1', floor: 1, type: 'entrance', x: 500, y: 730, title: 'South Gate (Main)', status: 'open', desc: 'Main entry point. High traffic expected.', queue: 45, waitTime: 12 },
    { id: 'p2', floor: 1, type: 'entrance', x: 500, y: 150, title: 'North Gate', status: 'open', desc: 'North entry point. Faster screening.', queue: 10, waitTime: 3 },
    { id: 'p3', floor: 1, type: 'snack', x: 300, y: 650, title: 'Gourmet Burgers', status: 'open', desc: 'Premium burgers and craft sodas.', queue: 5, waitTime: 8 },
    { id: 'p4', floor: 1, type: 'water', x: 700, y: 650, title: 'Hydration Station South', status: 'open', desc: 'Free drinking water and bottle refills.' },
    { id: 'p5', floor: 1, type: 'restroom', x: 200, y: 400, title: 'Restrooms West', status: 'open', desc: 'Men, Women, Accessible.' },
    { id: 'p6', floor: 1, type: 'firstaid', x: 800, y: 400, title: 'Medical Center', status: 'open', desc: 'First aid, emergency care, and cooling station.' },
    { id: 'p7', floor: 1, type: 'event', x: 500, y: 400, title: 'Main Field', status: 'open', desc: 'Center playfield.', schedule: 'Match starts at 8:00 PM' },
    { id: 'p8', floor: 2, type: 'snack', x: 350, y: 250, title: 'Pizza Corner', status: 'closed', desc: 'Wood-fired slices and whole pies.', queue: 0, waitTime: 0 },
    { id: 'p9', floor: 2, type: 'merch', x: 650, y: 250, title: 'Official Team Store', status: 'open', desc: 'Jerseys, caps, and exclusive memorabilia.', queue: 15, waitTime: 20 },
    { id: 'p10', floor: 2, type: 'restroom', x: 800, y: 600, title: 'Restrooms East', status: 'open', desc: 'Men, Women.' },
    { id: 'p11', floor: 2, type: 'water', x: 200, y: 600, title: 'Hydration Station West', status: 'open', desc: 'Free drinking water.' },
    { id: 'p12', floor: 2, type: 'security', x: 500, y: 180, title: 'Security Post', status: 'open', desc: 'Lost & found, general assistance.' },
    { id: 'p13', floor: 3, type: 'snack', x: 500, y: 680, title: 'Skyline Lounge', status: 'open', desc: 'Premium cocktails and tapas.', queue: 2, waitTime: 2 },
    { id: 'p14', floor: 3, type: 'restroom', x: 300, y: 300, title: 'VIP Restrooms', status: 'open', desc: 'Exclusive suite access.' },
    { id: 'p15', floor: 3, type: 'event', x: 500, y: 400, title: 'Executive Suites', status: 'open', desc: 'Premium viewing boxes with catering.' }
];

const commentsData = {
    'p3': [{ user: 'Alex', text: 'Line is moving fast! Highly recommend the truffle fries.', time: '2 mins ago' }],
    'p9': [{ user: 'Sam', text: 'Sold out of home jerseys sizes M and L. Ask staff for backroom stock.', time: '10 mins ago' }]
};

const activityLog = [
    { time: '19:45', desc: 'South Gate experiencing heavy influx. Consider North Gate.', icon: 'fa-door-open', color: 'var(--cat-entrance)' },
    { time: '19:30', desc: 'Medical team deployed to Section 204.', icon: 'fa-truck-medical', color: 'var(--cat-firstaid)' },
    { time: '19:15', desc: 'Gates open. Match begins in 45 minutes.', icon: 'fa-flag', color: 'var(--accent)' }
];

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initClock();
    initLegend();
    renderMarkers();
    initMapControls();
    initSimulations();
    populateDashboard();
    populateDirectory();
    
    document.querySelectorAll('.floor-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.floor = parseInt(e.currentTarget.dataset.floor);
            renderMarkers();
            closeDetails();
        });
    });

    document.getElementById('closeDetails').addEventListener('click', closeDetails);
    
    // Check if large dataset is loaded successfully
    console.log(`Loaded mock history with ${data?.length || 0} items to simulate heavy data bundle.`);
});

function initNavigation() {
    const btns = document.querySelectorAll('.nav-btn[data-target]');
    const pages = document.querySelectorAll('.page');
    const titleEl = document.getElementById('pageTitle');
    
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const target = btn.dataset.target;
            pages.forEach(p => {
                if (p.id === target) p.classList.add('active');
                else p.classList.remove('active');
            });
            
            state.activePage = target;
            titleEl.textContent = btn.querySelector('.nav-text').textContent;
        });
    });
}

function initClock() {
    const timeEl = document.getElementById('currentTime');
    setInterval(() => {
        timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }, 1000);
    timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function initLegend() {
    const list = document.getElementById('legendList');
    list.innerHTML = '';
    for (const [key, cat] of Object.entries(categories)) {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<div class="legend-color" style="color: ${cat.color}; background-color: currentColor;"></div><span><i class="fa-solid ${cat.icon}"></i> ${cat.label}</span>`;
        item.addEventListener('click', () => {
            state.filters[key] = !state.filters[key];
            item.classList.toggle('disabled', !state.filters[key]);
            renderMarkers();
        });
        list.appendChild(item);
    }
}

function renderMarkers() {
    const group = document.getElementById('markersGroup');
    group.innerHTML = '';
    const visiblePois = pois.filter(p => p.floor === state.floor && state.filters[p.type]);
    
    visiblePois.forEach(poi => {
        const cat = categories[poi.type];
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('marker');
        g.setAttribute('transform', `translate(${poi.x}, ${poi.y})`);
        
        const innerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        innerG.classList.add('marker-inner');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M0 0c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zm0-24c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z');
        path.setAttribute('fill', cat.color);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '0'); circle.setAttribute('cy', '-16'); circle.setAttribute('r', '14');
        circle.setAttribute('fill', cat.color); circle.setAttribute('opacity', '0.2');

        innerG.appendChild(path);
        innerG.appendChild(circle);
        g.appendChild(innerG);
        
        g.addEventListener('click', (e) => { e.stopPropagation(); openDetails(poi); hideTooltip(); });
        g.addEventListener('mouseenter', (e) => { if (!state.isDragging) showTooltip(e, poi); });
        g.addEventListener('mouseleave', hideTooltip);
        g.addEventListener('mousemove', moveTooltip);
        
        group.appendChild(g);
    });
}

function initMapControls() {
    const map = document.getElementById('stadiumMap');
    const wrapper = document.getElementById('mapWrapper');
    
    const updateTransform = () => { map.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`; };

    document.getElementById('zoomIn').addEventListener('click', () => { state.zoom = Math.min(state.zoom + 0.2, 3); updateTransform(); });
    document.getElementById('zoomOut').addEventListener('click', () => { state.zoom = Math.max(state.zoom - 0.2, 0.5); updateTransform(); });
    document.getElementById('resetView').addEventListener('click', () => { state.zoom = 1; state.pan = { x: 0, y: 0 }; updateTransform(); });
    document.getElementById('centerUser').addEventListener('click', () => {
        state.zoom = 1.5; state.pan = { x: 0, y: -200 }; updateTransform();
    });

    wrapper.addEventListener('mousedown', (e) => {
        if(e.button !== 0) return;
        state.isDragging = true;
        state.dragStart = { x: e.clientX - state.pan.x, y: e.clientY - state.pan.y };
        wrapper.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!state.isDragging) return;
        state.pan.x = e.clientX - state.dragStart.x;
        state.pan.y = e.clientY - state.dragStart.y;
        updateTransform();
    });

    window.addEventListener('mouseup', () => { state.isDragging = false; wrapper.style.cursor = 'grab'; });
    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        state.zoom = Math.max(0.5, Math.min(state.zoom + delta, 3));
        updateTransform();
    });
}

function showTooltip(e, poi) {
    const el = document.getElementById('mapTooltip');
    const cat = categories[poi.type];
    if (!el || !cat) return;
    el.innerHTML = `
        <div class="tooltip-img" style="background-image: url('${cat.img}')"></div>
        <div class="tooltip-content">
            <div class="tooltip-cat" style="color: ${cat.color}"><i class="fa-solid ${cat.icon}"></i> ${cat.label}</div>
            <div class="tooltip-title">${poi.title}</div>
            <div class="tooltip-desc">${poi.desc}</div>
        </div>
    `;
    el.classList.remove('hidden');
    moveTooltip(e);
}
function moveTooltip(e) {
    const el = document.getElementById('mapTooltip');
    if (el) { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; }
}
function hideTooltip() {
    const el = document.getElementById('mapTooltip');
    if (el) el.classList.add('hidden');
}

function openDetails(poi) {
    state.selectedPoi = poi;
    const panel = document.getElementById('detailsPanel');
    const content = document.getElementById('detailsContent');
    const cat = categories[poi.type];
    const isSubbed = state.subscriptions.has(poi.id);
    
    let statsHtml = '';
    if (poi.queue !== undefined) {
        const queueClass = poi.queue > 20 ? 'high' : (poi.queue > 10 ? 'med' : 'low');
        statsHtml = `
            <div class="live-stats">
                <div>
                    <div class="stat-val ${queueClass}" id="queueCount">${poi.queue}</div>
                    <div class="stat-label">In Line</div>
                </div>
                <div>
                    <div class="stat-val" id="waitTime">${poi.waitTime}m</div>
                    <div class="stat-label">Est. Wait</div>
                </div>
            </div>`;
    }

    let comments = commentsData[poi.id] || [];
    let commentsHtml = comments.map(c => `
        <div class="comment">
            <div class="comment-header"><span>${c.user}</span><span>${c.time}</span></div>
            <div>${c.text}</div>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="poi-header">
            <div class="poi-type" style="color: ${cat.color}"><i class="fa-solid ${cat.icon}"></i> ${cat.label}</div>
            <h2 class="poi-title">${poi.title}</h2>
            <div class="status-badge status-${poi.status}">${poi.status.toUpperCase()}</div>
            <p style="margin-top: 1rem; color: var(--text-muted); font-size: 0.95rem; line-height: 1.5;">${poi.desc}</p>
            ${poi.schedule ? `<p style="margin-top: 0.5rem; color: #fff; font-weight: bold;"><i class="fa-regular fa-clock"></i> ${poi.schedule}</p>` : ''}
        </div>
        ${statsHtml}
        <button class="subscribe-btn ${isSubbed ? 'subscribed' : ''}" onclick="toggleSubscription('${poi.id}')">
            ${isSubbed ? '<i class="fa-solid fa-check"></i> Subscribed to Updates' : '<i class="fa-regular fa-bell"></i> Notify Me When Free'}
        </button>
        <div class="comments-section">
            <h4>Live Updates & Community</h4>
            <div class="comment-list" id="commentList">
                ${commentsHtml.length ? commentsHtml : '<div style="color:var(--text-muted); font-size:0.85rem; padding: 1rem 0;">No comments yet. Be the first!</div>'}
            </div>
            <div class="comment-input">
                <input type="text" id="newComment" placeholder="Share an update...">
                <button onclick="postComment()">Post</button>
            </div>
        </div>
    `;
    panel.classList.remove('hidden');
}

function closeDetails() {
    document.getElementById('detailsPanel').classList.add('hidden');
    state.selectedPoi = null;
}

window.toggleSubscription = (id) => {
    if (state.subscriptions.has(id)) {
        state.subscriptions.delete(id);
        showToast('Unsubscribed from updates.');
    } else {
        state.subscriptions.add(id);
        showToast('Subscribed! We will notify you of status changes.', 'success');
    }
    if (state.selectedPoi && state.selectedPoi.id === id) openDetails(state.selectedPoi);
};

window.postComment = () => {
    const input = document.getElementById('newComment');
    const text = input.value.trim();
    if (!text || !state.selectedPoi) return;
    if (!commentsData[state.selectedPoi.id]) commentsData[state.selectedPoi.id] = [];
    commentsData[state.selectedPoi.id].unshift({ user: 'You', text: text, time: 'Just now' });
    input.value = '';
    openDetails(state.selectedPoi);
};

function initSimulations() {
    let attendees = 42501;
    setInterval(() => {
        attendees += Math.floor(Math.random() * 21) - 10;
        document.getElementById('attendeeCount').textContent = attendees.toLocaleString();

        pois.forEach(poi => {
            if (poi.queue !== undefined && poi.status === 'open') {
                poi.queue = Math.max(0, poi.queue + (Math.floor(Math.random() * 5) - 2));
                poi.waitTime = Math.max(0, Math.floor(poi.queue * 1.2));
                if (state.selectedPoi && state.selectedPoi.id === poi.id) {
                    const qEl = document.getElementById('queueCount');
                    const wEl = document.getElementById('waitTime');
                    if (qEl && wEl) {
                        qEl.textContent = poi.queue; wEl.textContent = poi.waitTime + 'm';
                        qEl.className = 'stat-val ' + (poi.queue > 20 ? 'high' : (poi.queue > 10 ? 'med' : 'low'));
                    }
                }
            }
        });
    }, 4000);

    setTimeout(() => {
        const p = pois.find(x => x.id === 'p8');
        if (p) {
            p.status = 'open'; p.queue = 2; p.waitTime = 3;
            showToast(`📣 ${p.title} on Lvl ${p.floor} is now OPEN!`, 'success');
            state.unreadNotifs++;
            document.getElementById('notifBadge').textContent = state.unreadNotifs;
            if (state.selectedPoi && state.selectedPoi.id === p.id) openDetails(p);
            if (state.floor === p.floor) renderMarkers();
            
            activityLog.unshift({ time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), desc: `${p.title} opened to the public.`, icon: 'fa-burger', color: 'var(--cat-snack)' });
            populateDashboard();
        }
    }, 8000);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : (type === 'alert' ? 'fa-bell' : 'fa-circle-info')}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0'; toast.style.transform = 'translateY(20px) scale(0.9)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function populateDashboard() {
    const list = document.getElementById('activityList');
    if (!list) return;
    list.innerHTML = '';
    activityLog.forEach(log => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `
            <div style="color: ${log.color}; font-size: 1.2rem; padding-top: 2px;"><i class="fa-solid ${log.icon}"></i></div>
            <div style="flex: 1;">
                <div class="activity-desc">${log.desc}</div>
                <div class="activity-time">${log.time}</div>
            </div>
        `;
        list.appendChild(li);
    });
}

function populateDirectory() {
    const grid = document.getElementById('directoryGrid');
    const search = document.getElementById('dirSearch');
    const floorFilter = document.getElementById('dirFloorFilter');
    if (!grid || !search || !floorFilter) return;

    const render = () => {
        const s = search.value.toLowerCase();
        const f = floorFilter.value;
        grid.innerHTML = '';
        pois.forEach(poi => {
            if (f !== 'all' && poi.floor.toString() !== f) return;
            if (s && !poi.title.toLowerCase().includes(s) && !poi.desc.toLowerCase().includes(s) && !categories[poi.type].label.toLowerCase().includes(s)) return;
            
            const cat = categories[poi.type];
            const div = document.createElement('div');
            div.className = 'dir-card';
            div.innerHTML = `
                <div class="dir-card-header">
                    <div class="dir-card-icon" style="background: ${cat.color}20; color: ${cat.color};"><i class="fa-solid ${cat.icon}"></i></div>
                    <div>
                        <div class="dir-card-title">${poi.title}</div>
                        <div class="dir-card-subtitle">Level ${poi.floor} • ${cat.label}</div>
                    </div>
                </div>
                <div style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.4; flex: 1;">${poi.desc}</div>
                <div class="dir-card-stats">
                    <span class="status-badge status-${poi.status}">${poi.status}</span>
                    ${poi.queue !== undefined ? `<span style="font-size: 0.85rem; font-weight: bold; color: white;"><i class="fa-solid fa-users"></i> ${poi.queue} in line</span>` : ''}
                </div>
            `;
            div.addEventListener('click', () => {
                // Switch to map view
                document.querySelector('.nav-btn[data-target="mapPage"]').click();
                // Select floor
                document.querySelector(`.floor-btn[data-floor="${poi.floor}"]`).click();
                // Open details
                setTimeout(() => openDetails(poi), 100);
            });
            grid.appendChild(div);
        });
    };

    search.addEventListener('input', render);
    floorFilter.addEventListener('change', render);
    render();
}
