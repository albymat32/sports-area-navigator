import './style.css';

const state = {
    floor: 1,
    filters: {
        entrance: true,
        snack: true,
        water: true,
        event: true,
        restroom: true,
        firstaid: true,
        merch: true,
        security: true
    },
    zoom: 1,
    pan: { x: 0, y: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    selectedPoi: null,
    subscriptions: new Set(),
    unreadNotifs: 0
};

const categories = {
    entrance: { label: "IN / OUT", color: "var(--cat-entrance)", icon: "fa-door-open", img: "https://images.unsplash.com/photo-1572421334812-9c1cdcdcb8fa?auto=format&fit=crop&w=400&q=80" },
    snack: { label: "Snacks & Food", color: "var(--cat-snack)", icon: "fa-burger", img: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=400&q=80" },
    water: { label: "Water Stations", color: "var(--cat-water)", icon: "fa-droplet", img: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80" },
    event: { label: "Event Locations", color: "var(--cat-event)", icon: "fa-star", img: "https://images.unsplash.com/photo-1540039155732-6761b54b94f1?auto=format&fit=crop&w=400&q=80" },
    restroom: { label: "Restrooms", color: "var(--cat-restroom)", icon: "fa-restroom", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80" },
    firstaid: { label: "First Aid", color: "var(--cat-firstaid)", icon: "fa-truck-medical", img: "https://images.unsplash.com/photo-1513224502586-d1e602410265?auto=format&fit=crop&w=400&q=80" },
    merch: { label: "Merchandise", color: "var(--cat-merch)", icon: "fa-bag-shopping", img: "https://images.unsplash.com/photo-1555529733-0e670560f8e1?auto=format&fit=crop&w=400&q=80" },
    security: { label: "Security", color: "var(--cat-security)", icon: "fa-shield-halved", img: "https://images.unsplash.com/photo-1542157585-ef20bfcce579?auto=format&fit=crop&w=400&q=80" }
};

// Mock POI Data
const pois = [
    // Floor 1
    { id: 'p1', floor: 1, type: 'entrance', x: 500, y: 730, title: 'South Gate (Main)', status: 'open', desc: 'Main entry point.' },
    { id: 'p2', floor: 1, type: 'entrance', x: 500, y: 70, title: 'North Gate', status: 'open', desc: 'North entry point.' },
    { id: 'p3', floor: 1, type: 'snack', x: 300, y: 650, title: 'Burger Stand', status: 'open', desc: 'Gourmet burgers.', queue: 5, waitTime: 10 },
    { id: 'p4', floor: 1, type: 'water', x: 700, y: 650, title: 'Water Station S', status: 'open', desc: 'Free drinking water.' },
    { id: 'p5', floor: 1, type: 'restroom', x: 200, y: 400, title: 'Restroom West', status: 'open', desc: 'Men, Women, Accessible.' },
    { id: 'p6', floor: 1, type: 'firstaid', x: 800, y: 400, title: 'Medical Tent', status: 'open', desc: 'First aid and emergencies.' },
    { id: 'p7', floor: 1, type: 'event', x: 500, y: 400, title: 'Center Stage / Field', status: 'open', desc: 'Main match area.', schedule: 'Match starts at 8:00 PM' },
    
    // Floor 2
    { id: 'p8', floor: 2, type: 'snack', x: 350, y: 250, title: 'Pizza Corner', status: 'closed', desc: 'Slices and whole pies.', queue: 0, waitTime: 0 },
    { id: 'p9', floor: 2, type: 'merch', x: 650, y: 250, title: 'Official Store', status: 'open', desc: 'Jerseys and memorabilia.', queue: 15, waitTime: 25 },
    { id: 'p10', floor: 2, type: 'restroom', x: 800, y: 600, title: 'Restroom East', status: 'open', desc: 'Men, Women.' },
    { id: 'p11', floor: 2, type: 'water', x: 200, y: 600, title: 'Water Station W', status: 'open', desc: 'Free drinking water.' },
    { id: 'p12', floor: 2, type: 'security', x: 500, y: 150, title: 'Security Post', status: 'open', desc: 'Lost and found.' },
    
    // Floor 3
    { id: 'p13', floor: 3, type: 'snack', x: 500, y: 680, title: 'VIP Lounge Bar', status: 'open', desc: 'Premium drinks and snacks.', queue: 2, waitTime: 3 },
    { id: 'p14', floor: 3, type: 'restroom', x: 300, y: 300, title: 'VIP Restroom', status: 'open', desc: 'Exclusive access.' },
    { id: 'p15', floor: 3, type: 'event', x: 500, y: 400, title: 'VIP Boxes', status: 'open', desc: 'Premium viewing area.' }
];

// Mock Comments
const commentsData = {
    'p3': [{ user: 'Alex', text: 'Line is moving fast!', time: '2 mins ago' }],
    'p9': [{ user: 'Sam', text: 'Sold out of home jerseys sizes M and L.', time: '10 mins ago' }]
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initLegend();
    renderMarkers();
    initMapControls();
    initSimulations();
    
    // Floor selector
    document.querySelectorAll('.floor-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.floor = parseInt(e.target.dataset.floor);
            renderMarkers();
            closeDetails();
        });
    });

    document.getElementById('closeDetails').addEventListener('click', closeDetails);
});

// Clock
function initClock() {
    const timeEl = document.getElementById('currentTime');
    setInterval(() => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }, 1000);
    // Initial call
    timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Legend setup
function initLegend() {
    const list = document.getElementById('legendList');
    list.innerHTML = '';
    
    for (const [key, data] of Object.entries(categories)) {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="color: ${data.color}; background-color: currentColor;"></div>
            <span><i class="fa-solid ${data.icon}"></i> ${data.label}</span>
        `;
        item.addEventListener('click', () => {
            state.filters[key] = !state.filters[key];
            item.classList.toggle('disabled', !state.filters[key]);
            renderMarkers();
        });
        list.appendChild(item);
    }
}

// Render Markers on Map
function renderMarkers() {
    const group = document.getElementById('markersGroup');
    group.innerHTML = '';
    
    const visiblePois = pois.filter(p => p.floor === state.floor && state.filters[p.type]);
    
    visiblePois.forEach(poi => {
        const color = categories[poi.type].color;
        
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('marker');
        g.setAttribute('transform', `translate(${poi.x}, ${poi.y})`);
        
        const innerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        innerG.classList.add('marker-inner');

        // Pin shape
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M0 0c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zm0-24c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z');
        path.setAttribute('fill', color);
        
        // Background circle for icon
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '0');
        circle.setAttribute('cy', '-16');
        circle.setAttribute('r', '12');
        circle.setAttribute('fill', color);
        circle.setAttribute('opacity', '0.2');

        innerG.appendChild(path);
        innerG.appendChild(circle);
        g.appendChild(innerG);
        
        g.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetails(poi);
            hideTooltip();
        });

        g.addEventListener('mouseenter', (e) => {
            if (!state.isDragging) showTooltip(e, poi);
        });

        g.addEventListener('mouseleave', () => {
            hideTooltip();
        });

        g.addEventListener('mousemove', (e) => {
            moveTooltip(e);
        });
        
        group.appendChild(g);
    });
}

// Map Controls (Pan & Zoom)
function initMapControls() {
    const map = document.getElementById('stadiumMap');
    const wrapper = document.getElementById('mapWrapper');
    
    const updateTransform = () => {
        map.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`;
    };

    document.getElementById('zoomIn').addEventListener('click', () => {
        state.zoom = Math.min(state.zoom + 0.2, 3);
        updateTransform();
    });
    
    document.getElementById('zoomOut').addEventListener('click', () => {
        state.zoom = Math.max(state.zoom - 0.2, 0.5);
        updateTransform();
    });
    
    document.getElementById('resetView').addEventListener('click', () => {
        state.zoom = 1;
        state.pan = { x: 0, y: 0 };
        updateTransform();
    });

    wrapper.addEventListener('mousedown', (e) => {
        if(e.button !== 0) return; // Only left click
        state.isDragging = true;
        state.dragStart = { x: e.clientX - state.pan.x, y: e.clientY - state.pan.y };
    });

    window.addEventListener('mousemove', (e) => {
        if (!state.isDragging) return;
        state.pan.x = e.clientX - state.dragStart.x;
        state.pan.y = e.clientY - state.dragStart.y;
        updateTransform();
    });

    window.addEventListener('mouseup', () => {
        state.isDragging = false;
    });
    
    // Zoom with scroll
    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        state.zoom = Math.max(0.5, Math.min(state.zoom + delta, 3));
        updateTransform();
    });
}

// Tooltip Logic
function showTooltip(e, poi) {
    const tooltipEl = document.getElementById('mapTooltip');
    const cat = categories[poi.type];
    if (!tooltipEl || !cat) return;
    
    tooltipEl.innerHTML = `
        <div class="tooltip-img" style="background-image: url('${cat.img}')"></div>
        <div class="tooltip-content">
            <div class="tooltip-cat" style="color: ${cat.color}">
                <i class="fa-solid ${cat.icon}"></i> ${cat.label}
            </div>
            <div class="tooltip-title">${poi.title}</div>
            <div class="tooltip-desc">${poi.desc}</div>
        </div>
    `;
    tooltipEl.classList.remove('hidden');
    moveTooltip(e);
}

function moveTooltip(e) {
    const tooltipEl = document.getElementById('mapTooltip');
    if (!tooltipEl) return;
    tooltipEl.style.left = e.clientX + 'px';
    tooltipEl.style.top = e.clientY + 'px';
}

function hideTooltip() {
    const tooltipEl = document.getElementById('mapTooltip');
    if (tooltipEl) tooltipEl.classList.add('hidden');
}

// Details Panel
function openDetails(poi) {
    state.selectedPoi = poi;
    const panel = document.getElementById('detailsPanel');
    const content = document.getElementById('detailsContent');
    const cat = categories[poi.type];
    
    const isSubbed = state.subscriptions.has(poi.id);
    
    let statsHtml = '';
    if (poi.queue !== undefined) {
        const queueClass = poi.queue > 10 ? 'high' : (poi.queue > 5 ? 'med' : 'low');
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
            </div>
        `;
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
            <p style="margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">${poi.desc}</p>
            ${poi.schedule ? `<p style="margin-top: 0.5rem; color: #fff; font-weight: bold;"><i class="fa-regular fa-clock"></i> ${poi.schedule}</p>` : ''}
        </div>
        
        ${statsHtml}

        <button class="subscribe-btn ${isSubbed ? 'subscribed' : ''}" onclick="toggleSubscription('${poi.id}')">
            ${isSubbed ? '<i class="fa-solid fa-check"></i> Subscribed to Updates' : '<i class="fa-regular fa-bell"></i> Notify Me'}
        </button>

        <div class="comments-section">
            <h4>Live Updates & Comments</h4>
            <div class="comment-list" id="commentList">
                ${commentsHtml.length ? commentsHtml : '<div style="color:var(--text-muted); font-size:0.8rem;">No comments yet.</div>'}
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
    if (state.selectedPoi && state.selectedPoi.id === id) {
        openDetails(state.selectedPoi); // Refresh
    }
};

window.postComment = () => {
    const input = document.getElementById('newComment');
    const text = input.value.trim();
    if (!text || !state.selectedPoi) return;
    
    if (!commentsData[state.selectedPoi.id]) {
        commentsData[state.selectedPoi.id] = [];
    }
    
    commentsData[state.selectedPoi.id].unshift({
        user: 'You',
        text: text,
        time: 'Just now'
    });
    
    input.value = '';
    openDetails(state.selectedPoi); // Refresh to show
};

// Live Simulations
let currentAttendees = 42501;

function initSimulations() {
    // Simulate queue changes and global stats
    setInterval(() => {
        // Update attendees
        const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
        currentAttendees += change;
        const countEl = document.getElementById('attendeeCount');
        if (countEl) countEl.textContent = currentAttendees.toLocaleString();

        pois.forEach(poi => {
            if (poi.queue !== undefined && poi.status === 'open') {
                // Random fluctuation
                const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
                poi.queue = Math.max(0, poi.queue + change);
                poi.waitTime = Math.max(0, Math.floor(poi.queue * 1.5));
                
                // Update UI if open
                if (state.selectedPoi && state.selectedPoi.id === poi.id) {
                    const qEl = document.getElementById('queueCount');
                    const wEl = document.getElementById('waitTime');
                    if (qEl && wEl) {
                        qEl.textContent = poi.queue;
                        wEl.textContent = poi.waitTime + 'm';
                        qEl.className = 'stat-val ' + (poi.queue > 10 ? 'high' : (poi.queue > 5 ? 'med' : 'low'));
                    }
                }
            }
        });
    }, 3000); // Fast update for demo purposes

    // Simulate random events (like a stall opening)
    setTimeout(() => {
        const closedStall = pois.find(p => p.id === 'p8'); // Pizza Corner
        if (closedStall) {
            closedStall.status = 'open';
            closedStall.queue = 2;
            closedStall.waitTime = 3;
            
            showToast(`📣 ${closedStall.title} on Level ${closedStall.floor} is now OPEN!`, 'success');
            
            // If subscribed, send a special alert
            if (state.subscriptions.has(closedStall.id)) {
                setTimeout(() => showToast(`🔔 Subscription Alert: ${closedStall.title} is open.`, 'alert'), 1000);
            }
            
            // Increment badge
            state.unreadNotifs++;
            document.getElementById('notifBadge').textContent = state.unreadNotifs;
            
            if (state.selectedPoi && state.selectedPoi.id === closedStall.id) {
                openDetails(closedStall); // Refresh
            }
            
            // If on floor 2, re-render markers
            if (state.floor === 2) {
                renderMarkers();
            }
        }
    }, 8000); // Show shortly after loading
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : (type === 'alert' ? 'fa-bell' : 'fa-circle-info')}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}
