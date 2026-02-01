// DATA
const PALETTE = {
    "BROWN": "#d9b26d", "LIGHT_BLUE": "#a9bec3", "PINK": "#e7958a", "ORANGE": "#f59558",
    "RED": "#d4575f", "YELLOW": "#eac737", "GREEN": "#74a860", "DARK_BLUE": "#7e82a7",
    "CHANCE": "#b4cbd3", "COMMUNITY": "#becfd9", "UTILITY": "#318ca3",
    "TAX": "#b9b3a5", "RAILROAD": "#ae92a6"
};

//Descriptions for each color property
const PROPERTY_DESCRIPTIONS = {
    BROWN: "Starter properties in developing neighborhoods — affordable entry points for building your portfolio",
    LIGHT_BLUE: "Historic downtown commercial district — established businesses guarantee reliable returns",
    PINK: "Growing hillside residential communities — family-friendly with appreciation potential",
    ORANGE: "Central business corridor — prime commercial real estate with excellent transit",
    RED: "Premium residential estates — upscale neighborhoods commanding top-tier rents",
    YELLOW: "Riverside development zone — scenic properties with natural amenities",
    GREEN: "Elite hillside enclave — exclusive properties with commanding views",
    DARK_BLUE: "Crown jewel destinations — flagship properties representing market pinnacle",
    RAILROAD: "Transit infrastructure — essential hubs connecting communities",
    UTILITY: "Municipal services — critical infrastructure providing stable income",
    TAX: "Government obligations — mandatory contributions to civic infrastructure",
    CHANCE: "Market opportunity — unexpected developments reshaping strategy",
    COMMUNITY: "Civic landmarks — public spaces anchoring neighborhood identity",
    GO: "Starting position — collect your capital and begin building your empire",
    JAIL: "Temporary detention — time to reconsider your strategy",
    FREE_PARKING: "Municipal lot — brief respite from the competitive market",
    GO_TO_JAIL: "Regulatory violation — immediate detention pending review"
};

// Kamloops data to populate the game
const KAMLOOPS_DATA = {
    brown: ["TRANQUILLE ROAD", "HALSTON AVENUE", "FORTUNE DRIVE", "PARKCREST AVENUE"],
    lightBlue: ["COLUMBIA STREET", "VICTORIA STREET", "SEYMOUR STREET", "BATTLE STREET", "ST. PAUL STREET", "LANSDOWNE STREET"],
    pink: ["SUMMIT DRIVE", "HILLSIDE DRIVE", "NOTRE DAME DRIVE", "QU'APPELLE BOULEVARD", "WESTSYDE ROAD", "COPPERHEAD DRIVE"],
    orange: ["PACIFIC WAY", "LORNE STREET", "NICOLA STREET", "PAUL LAKE", "ROBSON DRIVE", "SCHUBERT DRIVE"],
    red: ["MCGILL ROAD", "HUGH ALLAN DRIVE", "DALHOUSIE DRIVE", "WESTSYDE RIDGE", "BROCK DRIVE", "GLENEAGLES DRIVE"],
    yellow: ["VALLEYVIEW ROAD", "RIVER ROAD", "RIVERSIDE DRIVE", "DALLAS DRIVE", "BARNHARTVALE", "ABERDEEN STREET"],
    green: ["MT. DUFFERIN STREET", "PINEVIEW ROAD", "JUNIPER DRIVE", "SOUTHILL STREET", "CAMPBELL CREEK", "RANCHERO"],
    darkBlue: ["SUN PEAKS", "LAC DU BOIS", "KENNA PARK", "PETERSON CREEK"],
    busStops: ["LANSDOWNE EXCHANGE", "ABERDEEN MALL", "ROYAL INLAND HOSPITAL", "SAHALI EXCHANGE", "TRU EXCHANGE ", "NORTH SHORE EXCHANGE", "VALLEYVIEW EXCHANGE", "DALLAS EXCHANGE"],
    utilities: ["BC HYDRO", "WATER WORKS", "SHAW NET", "FORTIS BC"],
    taxes: ["CITY HALL TAX", "TOURISM TAX", "GST OFFICE", "BC PST"],
    chance: ["BLAZERS", "TOURNAMENT CAPITAL CENTRE", "SUN PEAKS", "TRU OLD MAIN", "SALMON RUN", "POWWOW"],
    community: ["RIVERSIDE PARK", "ABERDEEN SHOPPING CENTRE", "SAHALI MALL", "BROCKLEHURST", "DOWNTOWN", "TRU CAMPUS"],
    corners: {GO: "GO", JAIL: "JAIL", FREE_PARKING: "FREE PARK", GO_TO_JAIL: "GO TO JAIL"}
};

// Seeded Random Number Generator 
class SeededRandom {
    constructor(seed) { this.seed = seed; }
    next() { this.seed = (this.seed * 9301 + 49297) % 233280; return this.seed / 233280; }
    randint(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; }
    random() { return this.next(); }
    shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); 
        [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
}

//Create a default game catalog of properties to use for the algorithm to populate the tiles with information
function defaultCatalog() {
    const props = [], colorData = [
        ["BROWN", KAMLOOPS_DATA.brown], ["LIGHT_BLUE", KAMLOOPS_DATA.lightBlue],
        ["PINK", KAMLOOPS_DATA.pink], ["ORANGE", KAMLOOPS_DATA.orange],
        ["RED", KAMLOOPS_DATA.red], ["YELLOW", KAMLOOPS_DATA.yellow],
        ["GREEN", KAMLOOPS_DATA.green], ["DARK_BLUE", KAMLOOPS_DATA.darkBlue]
    ];
    let pid = 1;
    for (const [color, names] of colorData) {
        for (let i = 0; i < names.length; i++) {
            props.push({ 
                id: `P_${String(pid).padStart(2, '0')}`, name: names[i], color: color,
                cost: 100 + (pid * 20), rent: [10 * pid, 20 * pid, 50 * Math.ceil(pid/2), 90 * Math.ceil(pid/2), 130 * Math.ceil(pid/2)],
                houseCost: 300 * Math.ceil(pid / 10)
            });
            pid++;
        }
    }
    return {
        corners: [{id: "GO", name: KAMLOOPS_DATA.corners.GO}, {id: "JAIL", name: KAMLOOPS_DATA.corners.JAIL},
            {id: "FREE_PARKING", name: KAMLOOPS_DATA.corners.FREE_PARKING}, {id: "GO_TO_JAIL", name: KAMLOOPS_DATA.corners.GO_TO_JAIL}],
        chance: KAMLOOPS_DATA.chance.map((name, i) => ({id: `CH_${i+1}`, name})),
        community: KAMLOOPS_DATA.community.map((name, i) => ({id: `CC_${i+1}`, name})),
        utilities: KAMLOOPS_DATA.utilities.map((name, i) => ({id: `UT_${i+1}`, name, cost: 150})),
        taxes: KAMLOOPS_DATA.taxes.map((name, i) => ({id: `TAX_${i+1}`, name, amount: 200 * (i + 1)})),
        railroads: KAMLOOPS_DATA.busStops.map((name, i) => ({id: `RR_${i+1}`, name, cost: 200})),
        properties: props
    };
}

//Create a game catalog from a json file containing the game data and return it
function buildTilesFromCatalog(cat) {
    const corners = {};
    for (const c of cat.corners) corners[c.id] = {id: c.id, kind: c.id, label: c.name, meta: c};
    const mkList = (items, kind) => items.map(x => ({id: x.id, kind, label: x.name || kind, meta: x}));
    const properties = cat.properties.map(p => ({id: p.id, kind: "PROPERTY", label: p.name, color: p.color, meta: p}));
    return { corners, chance: mkList(cat.chance, "CHANCE"), community: mkList(cat.community, "COMMUNITY"),
        utilities: mkList(cat.utilities, "UTILITY"), taxes: mkList(cat.taxes, "TAX"),
        railroads: mkList(cat.railroads, "RAILROAD"), properties };
}
 // Check if two points are adjacent
function adjacent(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1; }
// Get the neighbors of a point
function neighbors4(p, w, h) { const [x, y] = p, out = []; if (x > 0) out.push([x - 1, y]); if (x < w - 1) out.push([x + 1, y]); if (y > 0) out.push([x, y - 1]); if (y < h - 1) out.push([x, y + 1]); return out; }
// Get the distance to the nearest wall
function wallDistance(p, w, h) { const [x, y] = p; return Math.min(x, y, (w - 1) - x, (h - 1) - y); }
// Get the border of a board
function borderCycle(w, h) { const path = []; for (let x = 0; x < w; x++) path.push([x, 0]); for (let y = 1; y < h; y++) path.push([w - 1, y]); for (let x = w - 2; x >= 0; x--) path.push([x, h - 1]); for (let y = h - 2; y > 0; y--) path.push([0, y]); return path; }
// Get the side of an edge
function sideOfEdge(u, v, w, h) { const [ux, uy] = u, [vx, vy] = v; if (uy === 0 && vy === 0) return "TOP"; if (ux === w - 1 && vx === w - 1) return "RIGHT"; if (uy === h - 1 && vy === h - 1) return "BOTTOM"; if (ux === 0 && vx === 0) return "LEFT"; return "INNER"; }
// Get the number of extra touches
function extraTouchCount(cell, used, w, h, allowed) { let c = 0; for (const nb of neighbors4(cell, w, h)) { const key = `${nb[0]},${nb[1]}`; const allowedKeys = allowed.map(a => `${a[0]},${a[1]}`); if (used.has(key) && !allowedKeys.includes(key)) c++; } return c; }
// Get the candidates for a detour
function detourCandidatesForEdge(u, v) { const [ux, uy] = u, [vx, vy] = v, dx = vx - ux, dy = vy - uy, cands = []; if (dy === 0 && Math.abs(dx) === 1) { cands.push([[ux, uy - 1], [vx, vy - 1]]); cands.push([[ux, uy + 1], [vx, vy + 1]]); } if (dx === 0 && Math.abs(dy) === 1) { cands.push([[ux - 1, uy], [vx - 1, vy]]); cands.push([[ux + 1, uy], [vx + 1, vy]]); } return cands; }
// Check if a detour is valid
function isInwardDetour(u, v, a, b, w, h) { const side = sideOfEdge(u, v, w, h); if (side === "INNER") return true; return wallDistance(a, w, h) >= 1 && wallDistance(b, w, h) >= 1; }
// Score a detour 
function scoreDetour(u, v, a, b, w, h, sideCounts, rng) { const da = wallDistance(a, w, h), db = wallDistance(b, w, h), target = 2; const depthScore = 10 - Math.abs(da - target) - Math.abs(db - target); const side = sideOfEdge(u, v, w, h); const balanceScore = 6 - (sideCounts[side] || 0) * 1.5; return depthScore + balanceScore + rng.random() * 0.25; }

// Try to insert a detour
function tryInsertOneDetour(cycle, used, w, h, rng, sideCounts) {
    const n = cycle.length;
    let best = null, bestScore = -1e9;
    for (let attempt = 0; attempt < 100; attempt++) {
        const i = rng.randint(0, n - 1), u = cycle[i], v = cycle[(i + 1) % n];
        const cands = detourCandidatesForEdge(u, v);
        rng.shuffle(cands);
        for (const [a, b] of cands) {
            const [ax, ay] = a, [bx, by] = b;
            if (!(0 <= ax && ax < w && 0 <= ay && ay < h && 0 <= bx && bx < w && 0 <= by && by < h)) continue;
            const aKey = `${ax},${ay}`, bKey = `${bx},${by}`;
            if (used.has(aKey) || used.has(bKey)) continue;
            if (!(adjacent(u, a) && adjacent(a, b) && adjacent(b, v))) continue;
            if (!isInwardDetour(u, v, a, b, w, h)) continue;
            if (extraTouchCount(a, used, w, h, [u, b]) > 0) continue;
            if (extraTouchCount(b, used, w, h, [v, a]) > 0) continue;
            const s = scoreDetour(u, v, a, b, w, h, sideCounts, rng);
            if (s > bestScore) { bestScore = s; best = [i, u, v, a, b]; }
        }
    }
    if (best === null) return false;
    const [i, u, v, a, b] = best;
    cycle.splice(i + 1, 0, a, b);
    used.add(`${a[0]},${a[1]}`);
    used.add(`${b[0]},${b[1]}`);
    const side = sideOfEdge(u, v, w, h);
    sideCounts[side] = (sideCounts[side] || 0) + 1;
    return true;
}

// Generate a board layout cycle that creates a valid loop with the given length while adding detours
function generateCycle(w, h, length, seed) {
    const base = borderCycle(w, h), baseLen = base.length;
    if (length < baseLen) throw new Error(`Length ${length} < border ${baseLen}`);
    if ((length - baseLen) % 2 !== 0) throw new Error("Length must differ by even");
    const need = (length - baseLen) / 2;

    // Try 50 times to find a valid cycle with detours and a loop of the desired length
    for (let attempt = 0; attempt < 50; attempt++) {
        const rng = new SeededRandom(seed + attempt * 13337); // Use different seed for each attempt
        const cycle = borderCycle(w, h); // Start with a border cycle
        const used = new Set(cycle.map(c => `${c[0]},${c[1]}`)); 
        const sideCounts = {TOP: 0, RIGHT: 0, BOTTOM: 0, LEFT: 0, INNER: 0}; 
        let ok = true;
        // Add detours
        for (let i = 0; i < need; i++) {  
            if (!tryInsertOneDetour(cycle, used, w, h, rng, sideCounts)) { ok = false; break; }
        }
        if (!ok) continue;
        const idx = cycle.findIndex(c => c[0] === 0 && c[1] === 0);
        if (idx !== -1) return cycle.slice(idx).concat(cycle.slice(0, idx));
    }
    throw new Error("Could not generate - try 'New Board'");
}

// Helper functions for generating board layouts

//function to evenly distribute k positions among L
function evenlySpreadPositions(L, k, banned) {
    if (k === 0) return [];
    const step = L / k, picks = [];
    for (let i = 0; i < k; i++) {
        const target = Math.round(i * step) % L;
        let d = 0;
        while (true) {
            const a = (target + d) % L, b = (target - d + L) % L;
            if (!banned.has(a)) { picks.push(a); banned.add(a); break; }
            if (!banned.has(b)) { picks.push(b); banned.add(b); break; }
            d++;
        }
    }
    return picks;
}


function circularDist(a, b, L) { const d = Math.abs(a - b); return Math.min(d, L - d); }

//function to fill the tiles in colour clusters
function clusterFill(candidateIndices, count, banned, center, L) {
    const candidates = candidateIndices.filter(i => !banned.has(i));
    candidates.sort((x, y) => circularDist(x, center, L) - circularDist(y, center, L));
    const chosen = candidates.slice(0, count);
    chosen.forEach(c => banned.add(c));
    return chosen;
}

//Assigning the tiles to the genertaed cycle
function assignTiles(cycle, tileset, w, h, tileSeed) {
    const rng = new SeededRandom(tileSeed), L = cycle.length;
    if (L !== 76) throw new Error("Path length must be 76");
    const anchors = {GO: [0, 0], JAIL: [w - 1, 0], FREE_PARKING: [w - 1, h - 1], GO_TO_JAIL: [0, h - 1]};
    const indexOf = {};
    for (const [k, coord] of Object.entries(anchors)) {
        const idx = cycle.findIndex(c => c[0] === coord[0] && c[1] === coord[1]);
        if (idx === -1) throw new Error(`Anchor ${k} not found`);
        indexOf[k] = idx;
    }
    const placed = Array(L).fill(null), banned = new Set(Object.values(indexOf));
    placed[indexOf.GO] = tileset.corners.GO;
    placed[indexOf.JAIL] = tileset.corners.JAIL;
    placed[indexOf.FREE_PARKING] = tileset.corners.FREE_PARKING;
    placed[indexOf.GO_TO_JAIL] = tileset.corners.GO_TO_JAIL;

    const specialsPlan = [
        ["CHANCE", tileset.chance], ["COMMUNITY", tileset.community],
        ["UTILITY", tileset.utilities], ["TAX", tileset.taxes], ["RAILROAD", tileset.railroads]
    ];
    for (const [kind, bucket] of specialsPlan) {
        const picks = evenlySpreadPositions(L, bucket.length, banned);
        const bucketCopy = [...bucket];
        rng.shuffle(bucketCopy);
        for (const idx of picks) placed[idx] = bucketCopy.pop();
    }

    let empty = [];
    for (let i = 0; i < L; i++) if (placed[i] === null) empty.push(i);
    const propsByColor = {};
    for (const p of tileset.properties) {
        if (!propsByColor[p.color]) propsByColor[p.color] = [];
        propsByColor[p.color].push(p);
    }
    for (const c in propsByColor) rng.shuffle(propsByColor[c]);
    const goI = indexOf.GO;
    const colorOrder = ["BROWN", "LIGHT_BLUE", "PINK", "ORANGE", "RED", "YELLOW", "GREEN", "DARK_BLUE"];
    const expected = {BROWN: 4, LIGHT_BLUE: 6, PINK: 6, ORANGE: 6, RED: 6, YELLOW: 6, GREEN: 6, DARK_BLUE: 4};
    const centers = colorOrder.map((_, j) => (goI + Math.floor(j * L / colorOrder.length)) % L);

    for (let j = 0; j < colorOrder.length; j++) {
        const color = colorOrder[j], center = centers[j], need = expected[color];
        const picks = clusterFill(empty, need, banned, center, L);
        empty = empty.filter(i => !picks.includes(i));
        for (const idx of picks) placed[idx] = propsByColor[color].pop();
    }

    return {
        grid: {w, h}, path: cycle.map(c => ({x: c[0], y: c[1]})),
        tiles: placed.map(t => ({id: t.id, kind: t.kind, label: t.label, color: t.color, meta: t.meta})),
        anchors: Object.fromEntries(Object.entries(anchors).map(([k, v]) => [k, {x: v[0], y: v[1], index: indexOf[k]}]))
    };
}


//VISUALIZATION
function generateBoardJSON() {
    const W = 14, H = 14, L = 76;
    const pathSeed = Math.floor(Math.random() * 1e9);
    const tileSeed = Math.floor(Math.random() * 1e9);
    const tileset = buildTilesFromCatalog(defaultCatalog());
    const cycle = generateCycle(W, H, L, pathSeed);
    const board = assignTiles(cycle, tileset, W, H, tileSeed);
    board.seeds = {pathSeed, tileSeed};
    return board;
}

// STATE
let currentBoard = null;
let currentZoom = 1;
let currentRotation = {x: 45, z: -5};

// HELPERS
function getTileColor(t) {
    if (t.kind === "PROPERTY") return PALETTE[t.color] || "#555";
    if (t.kind === "RAILROAD") return PALETTE.RAILROAD;
    if (t.kind === "UTILITY") return PALETTE.UTILITY;
    if (t.kind === "TAX") return PALETTE.TAX;
    if (t.kind === "CHANCE") return PALETTE.CHANCE;
    if (t.kind === "COMMUNITY") return PALETTE.COMMUNITY;
    return "#666";
}

function calculateTileSize() {
    const wrapper = document.getElementById('boardWrapper');
    const availableWidth = wrapper.clientWidth - 200;
    const availableHeight = wrapper.clientHeight - 200;
    return Math.floor(Math.min(availableWidth / 15, availableHeight / 15, 52));
}

// PROPERTY CARD
function showPropertyCard(tile, index) {
    const card = document.getElementById('propertyCard');
    const color = getTileColor(tile);
    document.getElementById('cardColorStrip').style.background = color;

    const emoji = { 
        PROPERTY: '🏘️', RAILROAD: '🚂', UTILITY: '⚡', TAX: '💰', 
        CHANCE: '🎲', COMMUNITY: '🏛️', GO: '▶️', JAIL: '🔒', 
        FREE_PARKING: '🅿️', GO_TO_JAIL: '👮' 
    };
    document.getElementById('cardImage').textContent = emoji[tile.kind] || '🏠';

    document.getElementById('cardTitle').textContent = tile.label;
    document.getElementById('cardType').textContent = `${tile.kind.replace('_', ' ')} DEED`;

    let description;
    if (tile.kind === 'PROPERTY') description = PROPERTY_DESCRIPTIONS[tile.color];
    else description = PROPERTY_DESCRIPTIONS[tile.kind] || 'Special board location';
    document.getElementById('cardDescription').textContent = description;

    const rentDetails = document.getElementById('rentDetails');
    rentDetails.innerHTML = '';
    if (tile.meta?.cost) {
        rentDetails.innerHTML += `<div class="rentRow"><span class="rentLabel">Purchase Price</span><span class="rentValue">${tile.meta.cost}</span></div>`;
    }
    if (tile.meta?.rent) {
        const labels = ['Base Rent', '1 House', '2 Houses', '3 Houses', 'Hotel'];
        tile.meta.rent.forEach((rent, i) => {
            rentDetails.innerHTML += `<div class="rentRow"><span class="rentLabel">${labels[i]}</span><span class="rentValue">${rent}</span></div>`;
        });
    }
    if (tile.meta?.houseCost) {
        rentDetails.innerHTML += `<div class="rentRow"><span class="rentLabel">House Cost</span><span class="rentValue">${tile.meta.houseCost}</span></div>`;
    }
    if (tile.meta?.amount) {
        rentDetails.innerHTML += `<div class="rentRow"><span class="rentLabel">Tax Amount</span><span class="rentValue">${tile.meta.amount}</span></div>`;
    }

    document.getElementById('propertyInfo').innerHTML = `
        <div class="rentRow"><span class="rentLabel">Position</span><span class="rentValue" style="color: var(--ink-black);">#${index}</span></div>
        <div class="rentRow"><span class="rentLabel">Property ID</span><span class="rentValue" style="color: var(--ink-black); font-size: 18px;">${tile.id}</span></div>
        ${tile.color ? `<div class="rentRow"><span class="rentLabel">Color Group</span><span class="rentValue" style="color: var(--ink-black); font-size: 18px;">${tile.color.replace('_', ' ')}</span></div>` : ''}
    `;

    card.classList.add('active');
    document.getElementById('boardWrapper').classList.add('shifted');
}

function hidePropertyCard() {
    document.getElementById('propertyCard').classList.remove('active');
    document.getElementById('boardWrapper').classList.remove('shifted');
}

// RENDER BOARD WITH SHARP TILES
function renderBoard(board) {
    const board3d = document.getElementById('board3d');
    const boardBase = document.getElementById('boardBase');
    board3d.innerHTML = '';

    const path = board.path, tiles = board.tiles, L = path.length;
    const tileSize = calculateTileSize();
    const spacing = Math.max(8, Math.floor(tileSize * 0.2));

    // Calculate dimensions
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of path) {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }

    const boardWidth = (maxX - minX + 1) * (tileSize + spacing) + 60;
    const boardHeight = (maxY - minY + 1) * (tileSize + spacing) + 60;
    board3d.style.width = boardWidth + 'px';
    board3d.style.height = boardHeight + 'px';
    boardBase.style.width = boardWidth + 'px';
    boardBase.style.height = boardHeight + 'px';

    // CONTINUOUS SHARP PATH LINES
    for (let i = 0; i < L; i++) {
        const p1 = path[i], p2 = path[(i + 1) % L];
        const x1 = (p1.x - minX) * (tileSize + spacing) + 30;
        const y1 = (p1.y - minY) * (tileSize + spacing) + 30;
        const x2 = (p2.x - minX) * (tileSize + spacing) + 30;
        const y2 = (p2.y - minY) * (tileSize + spacing) + 30;
        const dx = x2 - x1, dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        const line = document.createElement('div');
        line.className = 'path-line';
        line.style.width = length + 'px';
        line.style.height = Math.max(12, tileSize * 0.28) + 'px';
        line.style.left = (x1 + tileSize/2) + 'px';
        line.style.top = (y1 + tileSize/2 - (tileSize * 0.14)) + 'px';
        line.style.transform = `rotate(${angle}deg) translateZ(5px)`;
        board3d.appendChild(line);
    }

    // SHARP RECTANGULAR TILES WITH CLEAR TEXT
    for (let i = 0; i < L; i++) {
        const {x, y} = path[i], tile = tiles[i], color = getTileColor(tile);
        const isCorner = ["GO", "JAIL", "FREE_PARKING", "GO_TO_JAIL"].includes(tile.kind);

        const tileEl = document.createElement('div');
        tileEl.className = 'tile' + (isCorner ? ' corner' : '');
        const tileActualSize = isCorner ? tileSize * 1.5 : tileSize;
        tileEl.style.width = tileActualSize + 'px';
        tileEl.style.height = tileActualSize + 'px';
        tileEl.style.left = ((x - minX) * (tileSize + spacing) + 30) + 'px';
        tileEl.style.top = ((y - minY) * (tileSize + spacing) + 30) + 'px';

        // Color strip on the top
        if (!isCorner) {
            tileEl.style.setProperty('--color-strip', color);
        }

        // PROPERTY NAME
        const nameSpan = document.createElement('div');
        nameSpan.className = 'tile-name';
        nameSpan.textContent = tile.label;

        
        const textLength = tile.label.length;
        let fontSize;
        if (isCorner) {
            fontSize = Math.min(16, tileActualSize / 5.5);
        } else if (textLength <= 6) {
            fontSize = Math.min(13, tileActualSize / 3.5);
        } else if (textLength <= 10) {
            fontSize = Math.min(12, tileActualSize / 4);
        } else if (textLength <= 14) {
            fontSize = Math.min(11, tileActualSize / 4.5);
        } else {
            fontSize = Math.min(10, tileActualSize / 5);
        }
        nameSpan.style.fontSize = fontSize + 'px';
        nameSpan.style.lineHeight = '1.15';

        // HIGH CONTRAST TEXT
        if (isCorner) {
            nameSpan.style.color = '#663300';
            nameSpan.style.fontWeight = '900';
        } else {
            // Dark backgrounds get white text, light backgrounds get dark text
            const darkColors = ['#8B4513', '#DC143C', '#1E90FF', '#228B22', '#2C2C2C', '#FF8C42', '#8B2332'];
            const isDark = darkColors.some(dc => color === dc);
            nameSpan.style.color = isDark ? '#ffffff' : '#1a1a1a';
            nameSpan.style.fontWeight = '700';

            // Extra text shadow for clarity on dark backgrounds
            if (isDark) {
                nameSpan.style.textShadow = '0 2px 4px rgba(0,0,0,0.6), 0 0 1px rgba(0,0,0,0.8)';
            } else {
                nameSpan.style.textShadow = '0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(255,255,255,0.5)';
            }
        }

        tileEl.appendChild(nameSpan);
        tileEl.title = tile.label + ' - Click to view details';
        tileEl.addEventListener('click', () => showPropertyCard(tile, i));
        board3d.appendChild(tileEl);
    }

    // Update seeds
    document.getElementById('pathSeed').textContent = board.seeds.pathSeed;
    document.getElementById('tileSeed').textContent = board.seeds.tileSeed;
}

// LOADING
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress >= 100) { progress = 100; clearInterval(interval); }
            document.getElementById('progressFill').style.width = progress + '%';
        }, 80);
    } else {
        setTimeout(() => loading.classList.add('hidden'), 400);
    }
}

// GENERATE
function generateNewBoard() {
    hidePropertyCard();
    showLoading(true);
    setTimeout(() => {
        try {
            currentBoard = generateBoardJSON();
            renderBoard(currentBoard);
            console.log('✓ Board generated', currentBoard.seeds);
        } catch (e) {
            console.error('Error:', e);
            alert(e.message + ' - Click OK to try again');
        } finally {
            showLoading(false);
        }
    }, 150);
}

// RESHUFFLE
function reshuffleTiles() {
    if (!currentBoard) return;
    hidePropertyCard();
    showLoading(true);
    setTimeout(() => {
        try {
            const W = currentBoard.grid.w, H = currentBoard.grid.h;
            const cycle = currentBoard.path.map(p => [p.x, p.y]);
            const tileset = buildTilesFromCatalog(defaultCatalog());
            const tileSeed = Math.floor(Math.random() * 1e9);
            const board = assignTiles(cycle, tileset, W, H, tileSeed);
            board.seeds = {pathSeed: currentBoard.seeds.pathSeed, tileSeed};
            currentBoard = board;
            renderBoard(currentBoard);
            console.log('✓ Reshuffled', {tileSeed});
        } catch (e) {
            console.error('Error:', e);
            alert(e.message);
        } finally {
            showLoading(false);
        }
    }, 150);
}

// RESET VIEW
function resetView() {
    currentZoom = 1;
    currentRotation = {x: 45, z: -5};
    const boardContainer = document.getElementById('boardContainer');
    boardContainer.style.transform = `rotateX(${currentRotation.x}deg) rotateZ(${currentRotation.z}deg) scale(${currentZoom})`;
}
    
// EVENT HANDLERS
function setupEventHandlers() {
    // Buttons
    document.getElementById('generateBtn').addEventListener('click', generateNewBoard);
    document.getElementById('reshuffleBtn').addEventListener('click', reshuffleTiles);
    document.getElementById('closeCard').addEventListener('click', hidePropertyCard);

    // Legend toggle
    const legendToggle = document.getElementById('legendToggle');
    const legend = document.getElementById('legend');
    legendToggle.addEventListener('click', () => legend.classList.toggle('active'));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'n') generateNewBoard();
        else if (key === 't') reshuffleTiles();
        else if (key === 'l') legend.classList.toggle('active');
        else if (key === 'r') resetView();
        else if (key === 'escape') hidePropertyCard();
    });

    // Window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (currentBoard) renderBoard(currentBoard);
        }, 250);
    });

    // MOUSE INTERACTIONS - Drag to rotate
    const boardContainer = document.getElementById('boardContainer');
    let isDragging = false, startX, startY;

    boardContainer.addEventListener('mousedown', (e) => {
        if (e.target === boardContainer || e.target.id === 'board3d' || e.target.id === 'boardBase') {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            boardContainer.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        currentRotation.z += dx * 0.1;
        currentRotation.x += -dy * 0.1;
        currentRotation.x = Math.max(-10, Math.min(80, currentRotation.x));
        boardContainer.style.transform = `rotateX(${currentRotation.x}deg) rotateZ(${currentRotation.z}deg) scale(${currentZoom})`;
        startX = e.clientX;
        startY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        boardContainer.style.cursor = 'grab';
    });

    // MOUSE WHEEL - Zoom
    boardContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        currentZoom = Math.max(0.5, Math.min(2.5, currentZoom + delta));
        boardContainer.style.transform = `rotateX(${currentRotation.x}deg) rotateZ(${currentRotation.z}deg) scale(${currentZoom})`;
    }, {passive: false});
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🎲 MADNOPOLY', 'font-size: 28px; font-weight: bold; color: #1B7A3D;');
    console.log('%c✨ Sharp Rectangular Edition', 'color: #666; font-style: italic;');
    console.log('%c• No rounded corners\n• High contrast text\n• Crystal clear readability', 'color: #999;');
    setupEventHandlers();
    generateNewBoard();
});