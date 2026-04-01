// ===== GIFT One Tower — Digital Twin =====
// Real OSM Data: Way 386478178, 23.164693°N, 72.680088°E, 122m, 29 floors

// ===== Configuration =====
var NUM_FLOORS = 29;
var FLOOR_HEIGHT = 1.4;
var FLOOR_GAP = 0.06;
var TOWER_WIDTH = 14;
var TOWER_DEPTH = 10;
var WALL_THICKNESS = 0.08;
var TOTAL_HEIGHT = NUM_FLOORS * (FLOOR_HEIGHT + FLOOR_GAP);

// GIFT One Tower real coordinates
var GIFT_ONE_LNG = 72.680088;
var GIFT_ONE_LAT = 23.164693;

// Floor color coding by zone
var FLOOR_COLORS = {
  ground: 0x00d4ff,
  banking: 0x00d4ff,
  amenity: 0x00e5a0,
  it: 0x4a9eff,
  exchange: 0xffd700,
  finance: 0xffa500,
  legal: 0xc084fc,
  exec: 0xff6b6b,
  tech: 0x50c878
};

function getFloorColor(f) {
  if (f === 0) return FLOOR_COLORS.ground;
  if (f <= 3) return FLOOR_COLORS.banking;
  if (f <= 5) return FLOOR_COLORS.amenity;
  if (f <= 10) return FLOOR_COLORS.it;
  if (f <= 15) return FLOOR_COLORS.exchange;
  if (f <= 20) return FLOOR_COLORS.finance;
  if (f <= 22) return FLOOR_COLORS.legal;
  if (f <= 25) return FLOOR_COLORS.exec;
  return FLOOR_COLORS.tech;
}

function getFloorZoneLabel(f) {
  if (f === 0) return 'Ground / Lobby';
  if (f <= 3) return 'Banking';
  if (f <= 5) return 'Amenities';
  if (f <= 10) return 'IT / ITES';
  if (f <= 15) return 'Exchanges';
  if (f <= 20) return 'Finance';
  if (f <= 22) return 'Legal';
  if (f <= 25) return 'Executive';
  return 'Tech / BMS';
}

// Room definitions with real tenants
var ROOM_DEFS = [
  { id:'room_G01', floor:0, x:-2, z:0, w:4, d:4, label:'Grand Lobby' },
  { id:'room_G02', floor:0, x:4, z:-2, w:2.5, d:2.5, label:'Security Center' },
  { id:'room_G03', floor:0, x:4, z:2, w:2.5, d:2.5, label:'Visitor Lounge' },
  { id:'room_101', floor:1, x:0, z:0, w:10, d:7, label:'Bank of Baroda' },
  { id:'room_201', floor:2, x:0, z:0, w:10, d:7, label:'HDFC Bank' },
  { id:'room_301', floor:3, x:0, z:0, w:10, d:7, label:'SBI IFSC' },
  { id:'room_401', floor:4, x:0, z:0, w:10, d:7, label:'Food Court' },
  { id:'room_501', floor:5, x:0, z:0, w:10, d:7, label:'Conference Center' },
  { id:'room_601', floor:6, x:0, z:0, w:10, d:7, label:'Oracle Dev Center' },
  { id:'room_701', floor:7, x:0, z:0, w:10, d:7, label:'Oracle Cloud Ops' },
  { id:'room_801', floor:8, x:0, z:0, w:10, d:7, label:'TCS Digital' },
  { id:'room_901', floor:9, x:0, z:0, w:10, d:7, label:'Infosys BPM' },
  { id:'room_1001', floor:10, x:0, z:0, w:10, d:7, label:'Wipro FinTech' },
  { id:'room_1101', floor:11, x:0, z:0, w:10, d:7, label:'BSE India INX' },
  { id:'room_1201', floor:12, x:0, z:0, w:10, d:7, label:'NSE IFSC' },
  { id:'room_1301', floor:13, x:0, z:0, w:10, d:7, label:'MCX Commodities' },
  { id:'room_1401', floor:14, x:0, z:0, w:10, d:7, label:'NSDL Depository' },
  { id:'room_1501', floor:15, x:0, z:0, w:10, d:7, label:'CDSL Services' },
  { id:'room_1601', floor:16, x:0, z:0, w:10, d:7, label:'IFSCA Regulator' },
  { id:'room_1701', floor:17, x:0, z:0, w:10, d:7, label:'Goldman Sachs' },
  { id:'room_1801', floor:18, x:0, z:0, w:10, d:7, label:'JP Morgan' },
  { id:'room_1901', floor:19, x:0, z:0, w:10, d:7, label:'Deloitte' },
  { id:'room_2001', floor:20, x:0, z:0, w:10, d:7, label:'KPMG' },
  { id:'room_2101', floor:21, x:0, z:0, w:10, d:7, label:'Cyril Amarchand' },
  { id:'room_2201', floor:22, x:0, z:0, w:10, d:7, label:'AZB Partners' },
  { id:'room_2301', floor:23, x:0, z:0, w:10, d:7, label:'Board Room' },
  { id:'room_2401', floor:24, x:0, z:0, w:10, d:7, label:'Strategy Office' },
  { id:'room_2501', floor:25, x:0, z:0, w:10, d:7, label:'FinTech Hub' },
  { id:'room_2601', floor:26, x:0, z:0, w:10, d:7, label:'MD & CEO Suite' },
  { id:'room_2701', floor:27, x:0, z:0, w:10, d:7, label:'Server Room & BMS' }
];

// ===== State =====
var scene, camera, renderer, controls;
var raycaster, mouse;
var roomMeshes = [];
var hoveredRoom = null;
var selectedRoom = null;
var floorGroups = {};
var activeFloor = 'all';
var currentView = 'orbit';
var interiorFurniture = [];
var telemetryInterval = null;

// MapLibre state
var maplibreMap = null;
var mapMarkers = [];
var mapInitialized = false;

// ===== Day/Night Cycle State =====
var dayNightMode = 'day'; // 'auto', 'dawn', 'day', 'dusk', 'night'
var simulatedHour = 12.0; // Start at noon for clear daytime view
var sunLight = null;
var ambientLight = null;
var hemiLight = null;
var fillLight = null;
var towerGlowLights = [];
var windowGlowMeshes = [];
var groundMesh = null;
var gridHelper = null;
var plazaMesh = null;
var roadMesh = null;
var greenPatches = [];
var contextBuildings = [];
var streetLights = [];

// Day/Night presets (hour -> settings)
// GIFT City is at IST (UTC+5:30), latitude ~23°N
function getDayNightSettings(hour) {
  // hour is 0-24 float
  var h = ((hour % 24) + 24) % 24;

  // Sky/background color
  var skyR, skyG, skyB;
  // Sun position (angle in radians from east, elevation)
  var sunAngle, sunElevation, sunIntensity;
  // Ambient settings
  var ambientIntensity, ambientColor;
  var hemiSkyColor, hemiGroundColor, hemiIntensity;
  // Fog
  var fogColor, fogDensity;
  // Ground brightness
  var groundBrightness;
  // Window glow
  var windowGlowIntensity;
  // Tone mapping exposure
  var exposure;

  if (h >= 5 && h < 7) {
    // Dawn: 5-7 AM
    var t = (h - 5) / 2; // 0 to 1
    skyR = lerp(0.02, 0.45, t); skyG = lerp(0.02, 0.35, t); skyB = lerp(0.06, 0.55, t);
    sunAngle = lerp(-Math.PI * 0.4, -Math.PI * 0.2, t);
    sunElevation = lerp(0.05, 0.3, t);
    sunIntensity = lerp(0.2, 0.8, t);
    ambientIntensity = lerp(0.15, 0.4, t);
    ambientColor = lerpColor(0x1a1030, 0x504060, t);
    hemiSkyColor = lerpColor(0x2a2040, 0x7a8aaa, t);
    hemiGroundColor = lerpColor(0x0a0a15, 0x2a2a1e, t);
    hemiIntensity = lerp(0.15, 0.35, t);
    fogColor = lerpColor(0x0a0a18, 0x3a3050, t);
    fogDensity = lerp(0.006, 0.004, t);
    groundBrightness = lerp(0.04, 0.15, t);
    windowGlowIntensity = lerp(0.6, 0.2, t);
    exposure = lerp(1.0, 1.3, t);
  } else if (h >= 7 && h < 10) {
    // Morning: 7-10 AM
    var t = (h - 7) / 3;
    skyR = lerp(0.45, 0.55, t); skyG = lerp(0.35, 0.65, t); skyB = lerp(0.55, 0.9, t);
    sunAngle = lerp(-Math.PI * 0.2, 0, t);
    sunElevation = lerp(0.3, 0.65, t);
    sunIntensity = lerp(0.8, 1.2, t);
    ambientIntensity = lerp(0.4, 0.6, t);
    ambientColor = lerpColor(0x504060, 0x606880, t);
    hemiSkyColor = lerpColor(0x7a8aaa, 0x87CEEB, t);
    hemiGroundColor = lerpColor(0x2a2a1e, 0x3a4a2a, t);
    hemiIntensity = lerp(0.35, 0.5, t);
    fogColor = lerpColor(0x3a3050, 0x8090a0, t);
    fogDensity = lerp(0.004, 0.003, t);
    groundBrightness = lerp(0.15, 0.35, t);
    windowGlowIntensity = lerp(0.2, 0.05, t);
    exposure = lerp(1.3, 1.5, t);
  } else if (h >= 10 && h < 16) {
    // Midday: 10 AM - 4 PM
    var t = (h - 10) / 6;
    skyR = lerp(0.55, 0.5, t); skyG = lerp(0.65, 0.6, t); skyB = lerp(0.9, 0.85, t);
    sunAngle = lerp(0, Math.PI * 0.3, t);
    sunElevation = lerp(0.65, 0.8 - t * 0.15, 1); // peaks around noon
    if (h < 13) sunElevation = lerp(0.65, 0.85, (h - 10) / 3);
    else sunElevation = lerp(0.85, 0.6, (h - 13) / 3);
    sunIntensity = 1.3;
    ambientIntensity = 0.65;
    ambientColor = 0x707890;
    hemiSkyColor = 0x87CEEB;
    hemiGroundColor = 0x3a4a2a;
    hemiIntensity = 0.5;
    fogColor = lerpColor(0x8090a0, 0x7a8898, t);
    fogDensity = 0.002;
    groundBrightness = 0.4;
    windowGlowIntensity = 0.02;
    exposure = 1.6;
  } else if (h >= 16 && h < 18) {
    // Afternoon to dusk: 4-6 PM
    var t = (h - 16) / 2;
    skyR = lerp(0.5, 0.7, t); skyG = lerp(0.6, 0.35, t); skyB = lerp(0.85, 0.3, t);
    sunAngle = lerp(Math.PI * 0.3, Math.PI * 0.45, t);
    sunElevation = lerp(0.6, 0.15, t);
    sunIntensity = lerp(1.2, 0.6, t);
    ambientIntensity = lerp(0.6, 0.3, t);
    ambientColor = lerpColor(0x707890, 0x604030, t);
    hemiSkyColor = lerpColor(0x87CEEB, 0xaa6633, t);
    hemiGroundColor = lerpColor(0x3a4a2a, 0x1a1510, t);
    hemiIntensity = lerp(0.5, 0.25, t);
    fogColor = lerpColor(0x7a8898, 0x4a2a20, t);
    fogDensity = lerp(0.002, 0.005, t);
    groundBrightness = lerp(0.35, 0.12, t);
    windowGlowIntensity = lerp(0.05, 0.4, t);
    exposure = lerp(1.5, 1.2, t);
  } else if (h >= 18 && h < 20) {
    // Dusk to night: 6-8 PM
    var t = (h - 18) / 2;
    skyR = lerp(0.7, 0.08, t); skyG = lerp(0.35, 0.05, t); skyB = lerp(0.3, 0.15, t);
    sunAngle = lerp(Math.PI * 0.45, Math.PI * 0.5, t);
    sunElevation = lerp(0.15, -0.1, t);
    sunIntensity = lerp(0.6, 0.05, t);
    ambientIntensity = lerp(0.3, 0.12, t);
    ambientColor = lerpColor(0x604030, 0x151025, t);
    hemiSkyColor = lerpColor(0xaa6633, 0x1a1530, t);
    hemiGroundColor = lerpColor(0x1a1510, 0x080810, t);
    hemiIntensity = lerp(0.25, 0.1, t);
    fogColor = lerpColor(0x4a2a20, 0x060612, t);
    fogDensity = lerp(0.005, 0.006, t);
    groundBrightness = lerp(0.12, 0.03, t);
    windowGlowIntensity = lerp(0.4, 0.8, t);
    exposure = lerp(1.2, 0.9, t);
  } else {
    // Night: 8 PM - 5 AM
    skyR = 0.015; skyG = 0.015; skyB = 0.04;
    sunAngle = 0;
    sunElevation = -0.3;
    sunIntensity = 0.02;
    ambientIntensity = 0.1;
    ambientColor = 0x0a0a20;
    hemiSkyColor = 0x0a0a20;
    hemiGroundColor = 0x050508;
    hemiIntensity = 0.08;
    fogColor = 0x040410;
    fogDensity = 0.006;
    groundBrightness = 0.02;
    windowGlowIntensity = 0.9;
    exposure = 0.85;
  }

  return {
    skyColor: new THREE.Color(skyR, skyG, skyB),
    sunAngle: sunAngle,
    sunElevation: Math.max(sunElevation, -0.3),
    sunIntensity: sunIntensity,
    ambientIntensity: ambientIntensity,
    ambientColor: typeof ambientColor === 'number' ? new THREE.Color(ambientColor) : new THREE.Color(ambientColor),
    hemiSkyColor: typeof hemiSkyColor === 'number' ? new THREE.Color(hemiSkyColor) : new THREE.Color(hemiSkyColor),
    hemiGroundColor: typeof hemiGroundColor === 'number' ? new THREE.Color(hemiGroundColor) : new THREE.Color(hemiGroundColor),
    hemiIntensity: hemiIntensity,
    fogColor: typeof fogColor === 'number' ? new THREE.Color(fogColor) : new THREE.Color(fogColor),
    fogDensity: fogDensity,
    groundBrightness: groundBrightness,
    windowGlowIntensity: windowGlowIntensity,
    exposure: exposure,
    hour: h
  };
}

function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

function lerpColor(c1, c2, t) {
  var a = new THREE.Color(c1);
  var b = new THREE.Color(c2);
  return new THREE.Color(
    lerp(a.r, b.r, t),
    lerp(a.g, b.g, t),
    lerp(a.b, b.b, t)
  );
}

function getGIFTCityHour() {
  // GIFT City is IST = UTC+5:30
  var now = new Date();
  var utcH = now.getUTCHours() + now.getUTCMinutes() / 60;
  var ist = (utcH + 5.5) % 24;
  return ist;
}

function getCurrentHour() {
  if (simulatedHour >= 0) return simulatedHour;
  return getGIFTCityHour();
}

var cameraAnim = {
  active: false,
  startPos: new THREE.Vector3(),
  endPos: new THREE.Vector3(),
  startTarget: new THREE.Vector3(),
  endTarget: new THREE.Vector3(),
  startTime: 0,
  duration: 1200
};

var savedOrbitState = {
  position: new THREE.Vector3(45, 35, 45),
  target: new THREE.Vector3(0, TOTAL_HEIGHT * 0.35, 0)
};

// ===== DOM =====
var canvas = document.getElementById('three-canvas');
var tooltip = document.getElementById('hover-tooltip');
var infoPanel = document.getElementById('info-panel');
var panelClose = document.getElementById('panel-close');
var loadingOverlay = document.getElementById('loading-overlay');
var floorButtons = document.querySelectorAll('.floor-btn');
var viewButtons = document.querySelectorAll('.view-btn');
var viewIndicator = document.getElementById('view-indicator');
var viewIndicatorText = document.getElementById('view-indicator-text');
var viewIndicatorExit = document.getElementById('view-indicator-exit');
var canvasContainer = document.getElementById('canvas-container');
var mapContainer = document.getElementById('map-container');

// ===== Scene Init =====
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5565aa); // Will be updated by day/night cycle
  scene.fog = new THREE.FogExp2(0x8090a0, 0.002);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.copy(savedOrbitState.position);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.copy(savedOrbitState.target);
  controls.minDistance = 15;
  controls.maxDistance = 120;
  controls.maxPolarAngle = Math.PI / 2.05;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
}

// ===== Lighting =====
function addLighting() {
  ambientLight = new THREE.AmbientLight(0x303050, 0.5);
  scene.add(ambientLight);

  hemiLight = new THREE.HemisphereLight(0x4a6fa5, 0x1a1a2e, 0.4);
  scene.add(hemiLight);

  sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  sunLight.position.set(30, 60, 30);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.left = -30; sunLight.shadow.camera.right = 30;
  sunLight.shadow.camera.top = 60; sunLight.shadow.camera.bottom = -10;
  sunLight.shadow.camera.near = 0.5; sunLight.shadow.camera.far = 120;
  sunLight.shadow.bias = -0.001;
  scene.add(sunLight);

  fillLight = new THREE.DirectionalLight(0x4a9eff, 0.2);
  fillLight.position.set(-20, 30, -20);
  scene.add(fillLight);

  // Tower glow lights (stronger at night)
  towerGlowLights = [];
  [0.1, 0.3, 0.5, 0.7, 0.9].forEach(function(p) {
    var gl = new THREE.PointLight(0x4a9eff, 0.25, 15);
    gl.position.set(0, TOTAL_HEIGHT * p, 0);
    scene.add(gl);
    towerGlowLights.push(gl);
  });

  // Street lights around the tower (visible at night)
  var slMat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.5, metalness: 0.6 });
  var slPositions = [
    [-TOWER_WIDTH/2 - 4, TOWER_DEPTH/2 + 4],
    [TOWER_WIDTH/2 + 4, TOWER_DEPTH/2 + 4],
    [-TOWER_WIDTH/2 - 4, -TOWER_DEPTH/2 - 4],
    [TOWER_WIDTH/2 + 4, -TOWER_DEPTH/2 - 4],
    [0, TOWER_DEPTH/2 + 10],
    [TOWER_WIDTH/2 + 7, 10],
    [TOWER_WIDTH/2 + 7, -10]
  ];
  slPositions.forEach(function(pos) {
    // Pole
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.5, 6), slMat);
    pole.position.set(pos[0], 1.75, pos[1]);
    pole.castShadow = true;
    scene.add(pole);
    // Light bulb
    var bulbGeo = new THREE.SphereGeometry(0.15, 8, 8);
    var bulbMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.0 });
    var bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(pos[0], 3.5, pos[1]);
    scene.add(bulb);
    // Point light
    var sl = new THREE.PointLight(0xffdd88, 0, 12);
    sl.position.set(pos[0], 3.4, pos[1]);
    sl.castShadow = false;
    scene.add(sl);
    streetLights.push({ light: sl, bulb: bulb });
  });
}

// ===== Ground & Environment =====
function addGround() {
  // Ground plane
  groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 160),
    new THREE.MeshStandardMaterial({ color: 0x080816, roughness: 0.9, metalness: 0.1 })
  );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.01;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Grid
  gridHelper = new THREE.GridHelper(160, 64, 0x151530, 0x0c0c20);
  scene.add(gridHelper);

  // Entrance plaza
  plazaMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 14),
    new THREE.MeshStandardMaterial({ color: 0x121228, roughness: 0.8, metalness: 0.12 })
  );
  plazaMesh.rotation.x = -Math.PI / 2;
  plazaMesh.position.set(0, 0.02, TOWER_DEPTH / 2 + 7);
  plazaMesh.receiveShadow = true;
  scene.add(plazaMesh);

  // Entrance pillars with glow
  var pillarMat = new THREE.MeshStandardMaterial({
    color: 0x4a9eff, emissive: 0x4a9eff, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.7
  });
  [-3, 3].forEach(function(x) {
    var p = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.5, 0.25), pillarMat);
    p.position.set(x, 1.25, TOWER_DEPTH / 2 + 1);
    p.castShadow = true;
    scene.add(p);
  });

  // Parking lines
  for (var i = 0; i < 6; i++) {
    var line = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.02, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x1a1a38 })
    );
    line.position.set(-TOWER_WIDTH / 2 - 7, 0.03, -10 + i * 3);
    scene.add(line);
  }

  // Road
  roadMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 70),
    new THREE.MeshStandardMaterial({ color: 0x0e0e22, roughness: 0.95 })
  );
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(TOWER_WIDTH / 2 + 7, 0.02, 0);
  scene.add(roadMesh);

  // Road dashes
  var dashMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.15 });
  for (var d = 0; d < 12; d++) {
    var dash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 1.8), dashMat);
    dash.position.set(TOWER_WIDTH / 2 + 7, 0.04, -30 + d * 5);
    scene.add(dash);
  }

  // Green patches
  greenPatches = [];
  var greenMat = new THREE.MeshStandardMaterial({ color: 0x0f2a0f, roughness: 0.9 });
  [[-TOWER_WIDTH/2-2, TOWER_DEPTH/2+3], [TOWER_WIDTH/2+2, TOWER_DEPTH/2+3],
   [-TOWER_WIDTH/2-2, -TOWER_DEPTH/2-3], [TOWER_WIDTH/2+2, -TOWER_DEPTH/2-3]].forEach(function(pos) {
    var g = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 3.5), greenMat);
    g.position.set(pos[0], 0.06, pos[1]);
    scene.add(g);
    greenPatches.push(g);
  });

  // Nearby buildings (context)
  contextBuildings = [];
  var bldgMat = new THREE.MeshStandardMaterial({ color: 0x0f0f25, roughness: 0.7, metalness: 0.3, transparent: true, opacity: 0.5 });
  [
    { x: -30, z: 0, w: 8, h: 25, d: 6 },
    { x: 30, z: -10, w: 6, h: 18, d: 5 },
    { x: -20, z: -25, w: 10, h: 12, d: 8 },
    { x: 25, z: 20, w: 7, h: 30, d: 5 }
  ].forEach(function(b) {
    var bm = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), bldgMat.clone());
    bm.position.set(b.x, b.h / 2, b.z);
    bm.castShadow = true;
    bm.receiveShadow = true;
    scene.add(bm);
    contextBuildings.push(bm);
    // Wireframe
    var edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(b.w, b.h, b.d));
    var wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1a1a40, transparent: true, opacity: 0.3 }));
    wire.position.copy(bm.position);
    scene.add(wire);
  });
}

// ===== Build Tower =====
function buildTower() {
  for (var f = 0; f < NUM_FLOORS; f++) {
    floorGroups[f] = new THREE.Group();
    floorGroups[f].userData.floor = f;
    scene.add(floorGroups[f]);
  }

  for (var f = 0; f < NUM_FLOORS; f++) {
    buildFloor(f);
  }

  // Rooms
  ROOM_DEFS.forEach(function(def) { createRoom(def); });

  buildElevatorShafts();
  buildRooftop();

  // Roof slab
  var roofY = NUM_FLOORS * (FLOOR_HEIGHT + FLOOR_GAP);
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(TOWER_WIDTH, 0.2, TOWER_DEPTH),
    new THREE.MeshStandardMaterial({ color: 0x1e1e3e, roughness: 0.6, metalness: 0.4 })
  );
  roof.position.set(0, roofY, 0);
  roof.castShadow = true;
  roof.receiveShadow = true;
  scene.add(roof);
}

function buildFloor(f) {
  var baseY = f * (FLOOR_HEIGHT + FLOOR_GAP);
  var group = floorGroups[f];
  var col = getFloorColor(f);

  // Slab
  var slab = new THREE.Mesh(
    new THREE.BoxGeometry(TOWER_WIDTH, 0.12, TOWER_DEPTH),
    new THREE.MeshStandardMaterial({ color: 0x161630, roughness: 0.7, metalness: 0.3 })
  );
  slab.position.set(0, baseY, 0);
  slab.receiveShadow = true;
  slab.castShadow = true;
  group.add(slab);

  // Glass walls
  var glassMat = new THREE.MeshStandardMaterial({
    color: 0x1a3a5e, transparent: true, opacity: 0.1, roughness: 0.3, metalness: 0.7, side: THREE.DoubleSide
  });

  var hw = TOWER_WIDTH / 2, hd = TOWER_DEPTH / 2;
  var wallY = baseY + FLOOR_HEIGHT / 2 + 0.06;

  // Front/Back
  [hd, -hd].forEach(function(z) {
    var w = new THREE.Mesh(new THREE.BoxGeometry(TOWER_WIDTH, FLOOR_HEIGHT, WALL_THICKNESS), glassMat);
    w.position.set(0, wallY, z);
    group.add(w);
  });
  // Left/Right
  [-hw, hw].forEach(function(x) {
    var w = new THREE.Mesh(new THREE.BoxGeometry(WALL_THICKNESS, FLOOR_HEIGHT, TOWER_DEPTH), glassMat);
    w.position.set(x, wallY, 0);
    group.add(w);
  });

  // Edge wireframes
  var edgeMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.3 });
  var ey = baseY + 0.06;
  var tey = baseY + FLOOR_HEIGHT + 0.06;

  // Bottom & top edges
  [ey, tey].forEach(function(y) {
    var pts = [
      new THREE.Vector3(-hw, y, -hd), new THREE.Vector3(hw, y, -hd),
      new THREE.Vector3(hw, y, hd), new THREE.Vector3(-hw, y, hd),
      new THREE.Vector3(-hw, y, -hd)
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), edgeMat));
  });

  // Vertical corners
  [[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].forEach(function(c) {
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(c[0], ey, c[1]),
        new THREE.Vector3(c[0], tey, c[1])
      ]), edgeMat
    ));
  });

  // Window glow strips (lines)
  if (f > 0) {
    var wMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.12 });
    var wy = baseY + FLOOR_HEIGHT * 0.5;
    [hd + 0.01, -hd - 0.01].forEach(function(z) {
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-hw + 0.5, wy, z),
          new THREE.Vector3(hw - 0.5, wy, z)
        ]), wMat
      ));
    });

    // Window glow panels (for night illumination)
    var glowMat = new THREE.MeshBasicMaterial({
      color: 0xffeedd, transparent: true, opacity: 0.0, side: THREE.DoubleSide
    });
    // Front and back window panels
    [hd + 0.02, -hd - 0.02].forEach(function(z) {
      var panel = new THREE.Mesh(
        new THREE.PlaneGeometry(TOWER_WIDTH - 1.5, FLOOR_HEIGHT * 0.6),
        glowMat.clone()
      );
      panel.position.set(0, baseY + FLOOR_HEIGHT * 0.5, z);
      panel.userData.isWindowGlow = true;
      panel.userData.floor = f;
      group.add(panel);
      windowGlowMeshes.push(panel);
    });
    // Left and right window panels
    [-hw - 0.02, hw + 0.02].forEach(function(x) {
      var panel = new THREE.Mesh(
        new THREE.PlaneGeometry(TOWER_DEPTH - 1, FLOOR_HEIGHT * 0.6),
        glowMat.clone()
      );
      panel.position.set(x, baseY + FLOOR_HEIGHT * 0.5, 0);
      panel.rotation.y = Math.PI / 2;
      panel.userData.isWindowGlow = true;
      panel.userData.floor = f;
      group.add(panel);
      windowGlowMeshes.push(panel);
    });
  }
}

function createRoom(def) {
  var baseY = def.floor * (FLOOR_HEIGHT + FLOOR_GAP) + 0.06;
  var rh = FLOOR_HEIGHT * 0.82;
  var fc = new THREE.Color(getFloorColor(def.floor));

  var mat = new THREE.MeshStandardMaterial({
    color: fc.clone().multiplyScalar(0.35),
    transparent: true, opacity: 0.45,
    roughness: 0.4, metalness: 0.3,
    emissive: fc.clone().multiplyScalar(0.05)
  });

  var mesh = new THREE.Mesh(new THREE.BoxGeometry(def.w, rh, def.d), mat);
  mesh.position.set(def.x, baseY + rh / 2, def.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.userData = {
    roomId: def.id, label: def.label, floor: def.floor, isRoom: true,
    originalColor: mat.color.clone(), originalEmissive: mat.emissive.clone(),
    originalOpacity: mat.opacity, roomDef: def
  };

  // Wireframe
  var edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: fc, transparent: true, opacity: 0.45 })
  );
  mesh.add(edges);

  floorGroups[def.floor].add(mesh);
  roomMeshes.push(mesh);
}

// ===== Elevator Shafts =====
function buildElevatorShafts() {
  var shaftMat = new THREE.MeshStandardMaterial({
    color: 0x151530, roughness: 0.5, metalness: 0.6, transparent: true, opacity: 0.65
  });
  var sh = TOTAL_HEIGHT;
  var positions = [-TOWER_WIDTH / 2 + 1.5, TOWER_WIDTH / 2 - 1.5];

  positions.forEach(function(sx) {
    var shaft = new THREE.Mesh(new THREE.BoxGeometry(1.1, sh, 1.1), shaftMat);
    shaft.position.set(sx, sh / 2, 0);
    shaft.castShadow = true;
    scene.add(shaft);

    // Shaft edge line
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(sx, 0, 0), new THREE.Vector3(sx, sh, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.15 })
    ));
  });

  // Elevator cars
  var carMat = new THREE.MeshStandardMaterial({
    color: 0x4a9eff, emissive: 0x4a9eff, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.8
  });
  var carGeo = new THREE.BoxGeometry(0.7, 0.5, 0.7);

  positions.forEach(function(sx, i) {
    var car = new THREE.Mesh(carGeo, carMat.clone());
    car.position.set(sx, 5 + i * 20, 0);
    car.userData.elevatorCar = true;
    car.userData.speed = 0.025 + i * 0.008;
    car.userData.direction = i === 0 ? 1 : -1;
    scene.add(car);
  });
}

// ===== Rooftop =====
function buildRooftop() {
  var roofY = NUM_FLOORS * (FLOOR_HEIGHT + FLOOR_GAP) + 0.2;

  // Antenna
  var antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.18, 4.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.4, metalness: 0.7 })
  );
  antenna.position.set(0, roofY + 2.25, 0);
  antenna.castShadow = true;
  scene.add(antenna);

  // Antenna blink light
  var aLight = new THREE.PointLight(0xff0000, 0.5, 8);
  aLight.position.set(0, roofY + 4.5, 0);
  aLight.userData.blinkLight = true;
  scene.add(aLight);

  // Helipad
  var helipad = new THREE.Mesh(
    new THREE.RingGeometry(1.5, 2, 32),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.2, side: THREE.DoubleSide })
  );
  helipad.rotation.x = -Math.PI / 2;
  helipad.position.set(0, roofY + 0.05, 0);
  scene.add(helipad);

  // H marking
  var hMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.3 });
  [[-0.4, 0], [0.4, 0]].forEach(function(pos) {
    var bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 1), hMat);
    bar.position.set(pos[0], roofY + 0.06, pos[1]);
    scene.add(bar);
  });
  var hH = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.12), hMat);
  hH.position.set(0, roofY + 0.06, 0);
  scene.add(hH);

  // Equipment boxes
  var eqMat = new THREE.MeshStandardMaterial({ color: 0x1e1e3e, roughness: 0.6, metalness: 0.4 });
  [[-4,-2],[4,-2],[-4,2],[4,2]].forEach(function(pos) {
    var eq = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6 + Math.random() * 0.4, 0.9), eqMat);
    eq.position.set(pos[0], roofY + 0.4, pos[1]);
    eq.castShadow = true;
    scene.add(eq);
  });
}

// ===== Camera Animation =====
function easeInOutCubic(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2;
}

function animateCamera(pos, target, dur) {
  cameraAnim.startPos.copy(camera.position);
  cameraAnim.endPos.copy(pos);
  cameraAnim.startTarget.copy(controls.target);
  cameraAnim.endTarget.copy(target);
  cameraAnim.startTime = performance.now();
  cameraAnim.duration = dur || 1200;
  cameraAnim.active = true;
}

function updateCameraAnimation() {
  if (!cameraAnim.active) return;
  var t = Math.min((performance.now() - cameraAnim.startTime) / cameraAnim.duration, 1);
  var e = easeInOutCubic(t);
  camera.position.lerpVectors(cameraAnim.startPos, cameraAnim.endPos, e);
  controls.target.lerpVectors(cameraAnim.startTarget, cameraAnim.endTarget, e);
  if (t >= 1) {
    cameraAnim.active = false;
    camera.position.copy(cameraAnim.endPos);
    controls.target.copy(cameraAnim.endTarget);
  }
  controls.update();
}

// ===== View Modes =====
function saveOrbitState() {
  savedOrbitState.position.copy(camera.position);
  savedOrbitState.target.copy(controls.target);
}

function showThreeJS() {
  canvasContainer.classList.remove('hidden');
  mapContainer.classList.add('hidden');
  document.getElementById('map-legend').style.display = 'none';
  document.getElementById('floor-controls').style.display = '';
}

function showMapView() {
  canvasContainer.classList.add('hidden');
  mapContainer.classList.remove('hidden');
  document.getElementById('map-legend').style.display = '';
  document.getElementById('floor-controls').style.display = 'none';
  infoPanel.classList.add('hidden');

  if (!mapInitialized) {
    initMapLibre();
  } else {
    maplibreMap.resize();
  }
}

function switchToOrbitView() {
  currentView = 'orbit';
  updateViewButtons();
  hideViewIndicator();
  showThreeJS();
  controls.enableRotate = true;
  controls.minDistance = 15; controls.maxDistance = 120;
  controls.maxPolarAngle = Math.PI / 2.05; controls.minPolarAngle = 0;
  clearInteriorFurniture();
  restoreAllRoomAppearance();
  updateFloorVisibility();
  animateCamera(savedOrbitState.position, savedOrbitState.target, 1000);
  applyDayNightCycle(); // Let day/night system set fog
}

function switchToRealMapView() {
  if (currentView === 'orbit') saveOrbitState();
  currentView = 'realmap';
  updateViewButtons();
  showViewIndicator('🌍 Real Map — GIFT City, Gandhinagar');
  clearInteriorFurniture();
  restoreAllRoomAppearance();
  showMapView();
}

function switchToMapView() {
  if (currentView === 'orbit') saveOrbitState();
  currentView = 'map';
  updateViewButtons();
  showViewIndicator('🗺️ Map View — Top-Down');
  showThreeJS();
  clearInteriorFurniture();
  restoreAllRoomAppearance();
  updateFloorVisibility();
  controls.enableRotate = false;
  controls.minDistance = 10; controls.maxDistance = 150;
  controls.maxPolarAngle = 0; controls.minPolarAngle = 0;
  animateCamera(new THREE.Vector3(0, 85, 0.01), new THREE.Vector3(0, TOTAL_HEIGHT * 0.4, 0), 1200);
  applyDayNightCycle();
}

function switchToBirdsEyeView() {
  if (currentView === 'orbit') saveOrbitState();
  currentView = 'birdseye';
  updateViewButtons();
  showViewIndicator('🦅 Bird\'s Eye — Elevated');
  showThreeJS();
  clearInteriorFurniture();
  restoreAllRoomAppearance();
  updateFloorVisibility();
  controls.enableRotate = true;
  controls.minDistance = 25; controls.maxDistance = 150;
  controls.maxPolarAngle = Math.PI / 3; controls.minPolarAngle = Math.PI / 8;
  animateCamera(new THREE.Vector3(55, 60, 55), new THREE.Vector3(0, TOTAL_HEIGHT * 0.3, 0), 1200);
  applyDayNightCycle();
}

function switchToInteriorView(roomMesh) {
  if (!roomMesh || !roomMesh.userData.isRoom) return;
  if (currentView === 'orbit') saveOrbitState();
  currentView = 'interior';
  updateViewButtons();
  showThreeJS();

  var def = roomMesh.userData.roomDef;
  showViewIndicator('🚪 Interior — ' + roomMesh.userData.label + ' (F' + def.floor + ')');

  // Show only nearby floors
  for (var f = 0; f < NUM_FLOORS; f++) {
    floorGroups[f].visible = (Math.abs(f - def.floor) <= 1);
  }

  // Adjust opacities
  roomMeshes.forEach(function(rm) {
    if (rm === roomMesh) {
      rm.material.opacity = 0.1;
    } else if (rm.userData.floor === def.floor) {
      rm.material.opacity = 0.12;
    } else {
      rm.material.opacity = 0.06;
    }
    rm.material.transparent = true;
  });

  var baseY = def.floor * (FLOOR_HEIGHT + FLOOR_GAP) + 0.06;
  var cy = baseY + (FLOOR_HEIGHT * 0.82) / 2;

  controls.enableRotate = true;
  controls.minDistance = 0.5; controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI * 0.85; controls.minPolarAngle = 0.1;

  animateCamera(
    new THREE.Vector3(def.x + def.w * 0.3, cy + 0.4, def.z + def.d * 0.3),
    new THREE.Vector3(def.x - def.w * 0.1, cy - 0.2, def.z - def.d * 0.1),
    1500
  );
  addInteriorFurniture(def, baseY);
  applyDayNightCycle();
}

// ===== Interior Furniture =====
function addInteriorFurniture(def, baseY) {
  clearInteriorFurniture();
  var fc = new THREE.Color(getFloorColor(def.floor));
  var fy = baseY + 0.07;
  var furniMat = new THREE.MeshStandardMaterial({ color: 0x2a2a4e, roughness: 0.6, metalness: 0.2 });
  var accentMat = new THREE.MeshStandardMaterial({
    color: fc.clone().multiplyScalar(0.5), roughness: 0.5, metalness: 0.3,
    emissive: fc.clone().multiplyScalar(0.06)
  });

  // Interior light
  var il = new THREE.PointLight(fc.getHex(), 0.7, 12);
  il.position.set(def.x, baseY + FLOOR_HEIGHT * 0.7, def.z);
  scene.add(il);
  interiorFurniture.push(il);

  // Desks + chairs + monitors
  var count = Math.min(Math.floor(def.w * def.d / 15), 4);
  if (count < 1) count = 1;
  for (var i = 0; i < count; i++) {
    var ox = (i % 2 === 0 ? -1 : 1) * def.w * 0.18;
    var oz = (i < 2 ? -1 : 1) * def.d * 0.15;

    var desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), furniMat.clone());
    desk.position.set(def.x + ox, fy + 0.55, def.z + oz);
    desk.castShadow = true;
    scene.add(desk); interiorFurniture.push(desk);

    var chair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), accentMat.clone());
    chair.position.set(def.x + ox, fy + 0.35, def.z + oz + 0.42);
    scene.add(chair); interiorFurniture.push(chair);

    var monMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a1e, roughness: 0.2, metalness: 0.8,
      emissive: new THREE.Color(0x2244aa), emissiveIntensity: 0.3
    });
    var mon = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.02), monMat);
    mon.position.set(def.x + ox, fy + 0.75, def.z + oz - 0.18);
    scene.add(mon); interiorFurniture.push(mon);
  }

  // Ceiling light
  var cl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.03, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 })
  );
  cl.position.set(def.x, baseY + FLOOR_HEIGHT * 0.82, def.z);
  scene.add(cl); interiorFurniture.push(cl);

  // Floor rug
  var rug = new THREE.Mesh(
    new THREE.PlaneGeometry(def.w * 0.35, def.d * 0.35),
    new THREE.MeshStandardMaterial({ color: fc.clone().multiplyScalar(0.2), roughness: 0.9, side: THREE.DoubleSide })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(def.x, fy + 0.01, def.z);
  scene.add(rug); interiorFurniture.push(rug);
}

function clearInteriorFurniture() {
  interiorFurniture.forEach(function(obj) {
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(function(m) { m.dispose(); });
      else obj.material.dispose();
    }
  });
  interiorFurniture = [];
}

function restoreAllRoomAppearance() {
  roomMeshes.forEach(function(m) { resetRoomAppearance(m); });
}

function resetRoomAppearance(mesh) {
  if (!mesh || !mesh.userData || !mesh.userData.originalColor) return;
  mesh.material.color.copy(mesh.userData.originalColor);
  mesh.material.emissive.copy(mesh.userData.originalEmissive);
  mesh.material.emissiveIntensity = 1;
  mesh.material.opacity = mesh.userData.originalOpacity;
}

function updateFloorVisibility() {
  for (var f = 0; f < NUM_FLOORS; f++) {
    if (activeFloor === 'all') {
      floorGroups[f].visible = true;
    } else if (activeFloor === '0') {
      floorGroups[f].visible = (f === 0);
    } else {
      var parts = activeFloor.split('-');
      floorGroups[f].visible = (f >= parseInt(parts[0]) && f <= parseInt(parts[1]));
    }
  }
}

// ===== UI Helpers =====
function updateViewButtons() {
  viewButtons.forEach(function(b) {
    b.classList.toggle('active', b.dataset.view === currentView);
  });
}

function showViewIndicator(text) {
  viewIndicatorText.textContent = text;
  viewIndicator.classList.remove('hidden');
}

function hideViewIndicator() {
  viewIndicator.classList.add('hidden');
}

// ===== MapLibre GL JS Integration =====
function initMapLibre() {
  if (mapInitialized) return;

  maplibreMap = new maplibregl.Map({
    container: 'maplibre-map',
    style: {
      version: 8,
      name: 'GIFT City Dark',
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19,
          paint: {
            'raster-saturation': -0.6,
            'raster-brightness-max': 0.5,
            'raster-contrast': 0.2
          }
        }
      ]
    },
    center: [GIFT_ONE_LNG, GIFT_ONE_LAT],
    zoom: 16,
    pitch: 60,
    bearing: -30,
    antialias: true
  });

  maplibreMap.addControl(new maplibregl.NavigationControl(), 'top-left');
  maplibreMap.addControl(new maplibregl.ScaleControl({ maxWidth: 200 }), 'bottom-right');

  maplibreMap.on('load', function() {
    addBuildingLayers();
    addPOIMarkers();
    mapInitialized = true;
  });
}

function addBuildingLayers() {
  // Fetch GeoJSON from our API
  fetch('/api/geojson')
    .then(function(r) { return r.json(); })
    .then(function(geojson) {
      // Filter buildings only (polygons)
      var buildings = {
        type: 'FeatureCollection',
        features: geojson.features.filter(function(f) {
          return f.geometry.type === 'Polygon';
        })
      };

      // Add building source
      maplibreMap.addSource('gift-buildings', {
        type: 'geojson',
        data: buildings
      });

      // 3D extruded buildings
      maplibreMap.addLayer({
        id: 'gift-buildings-3d',
        type: 'fill-extrusion',
        source: 'gift-buildings',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.85
        }
      });

      // Building outlines (flat)
      maplibreMap.addLayer({
        id: 'gift-buildings-outline',
        type: 'line',
        source: 'gift-buildings',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.6
        }
      });

      // Building labels
      maplibreMap.addLayer({
        id: 'gift-buildings-labels',
        type: 'symbol',
        source: 'gift-buildings',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-anchor': 'center',
          'text-offset': [0, -2],
          'text-allow-overlap': true,
          'text-font': ['Open Sans Regular']
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(6,6,18,0.9)',
          'text-halo-width': 2
        }
      });

      // Click on buildings
      maplibreMap.on('click', 'gift-buildings-3d', function(e) {
        if (e.features && e.features.length > 0) {
          var props = e.features[0].properties;
          var coords = e.lngLat;

          new maplibregl.Popup({ closeButton: true, maxWidth: '280px' })
            .setLngLat(coords)
            .setHTML(
              '<div class="map-popup-title">' + props.name + '</div>' +
              '<div class="map-popup-desc">' + (props.description || '') + '</div>' +
              '<div class="map-popup-stat">Height: ' + props.height + 'm • Floors: ' + props.floors + '</div>' +
              (props.type === 'main' ? '<div class="map-popup-stat" style="color:#4a9eff;margin-top:4px;cursor:pointer" onclick="switchToOrbitView()">🔄 Switch to 3D Digital Twin →</div>' : '')
            )
            .addTo(maplibreMap);
        }
      });

      // Hover cursor
      maplibreMap.on('mouseenter', 'gift-buildings-3d', function() {
        maplibreMap.getCanvas().style.cursor = 'pointer';
      });
      maplibreMap.on('mouseleave', 'gift-buildings-3d', function() {
        maplibreMap.getCanvas().style.cursor = '';
      });

      // Add road network from GeoJSON
      var roads = {
        type: 'FeatureCollection',
        features: geojson.features.filter(function(f) {
          return f.properties.type === 'road';
        })
      };

      if (roads.features.length > 0) {
        maplibreMap.addSource('gift-roads', {
          type: 'geojson',
          data: roads
        });

        maplibreMap.addLayer({
          id: 'gift-roads-line',
          type: 'line',
          source: 'gift-roads',
          paint: {
            'line-color': '#ffd700',
            'line-width': 1.5,
            'line-opacity': 0.3,
            'line-dasharray': [4, 2]
          }
        }, 'gift-buildings-3d');
      }
    })
    .catch(function(err) {
      console.error('Failed to load GeoJSON:', err);
    });
}

function addPOIMarkers() {
  fetch('/api/poi')
    .then(function(r) { return r.json(); })
    .then(function(json) {
      if (!json.success) return;

      json.data.forEach(function(poi) {
        var el = document.createElement('div');
        el.className = poi.type === 'tower' && poi.name.includes('One') ? 'map-marker map-marker-main' : 'map-marker';
        el.textContent = poi.icon;
        el.title = poi.name;

        var marker = new maplibregl.Marker({ element: el })
          .setLngLat([poi.lng, poi.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 25, closeButton: true, maxWidth: '250px' })
              .setHTML(
                '<div class="map-popup-title">' + poi.icon + ' ' + poi.name + '</div>' +
                '<div class="map-popup-desc">' + poi.desc + '</div>' +
                (poi.name === 'GIFT One Tower' ?
                  '<div class="map-popup-stat" style="color:#4a9eff;margin-top:6px">📍 23.1647°N, 72.6801°E</div>' +
                  '<div class="map-popup-stat" style="color:#50c878">OSM Way: 386478178</div>'
                  : '')
              )
          )
          .addTo(maplibreMap);

        mapMarkers.push(marker);
      });
    })
    .catch(function(err) {
      console.error('Failed to load POIs:', err);
    });
}

// ===== Raycasting =====
function onMouseMove(e) {
  if (currentView === 'realmap') return;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (currentView === 'interior') { tooltip.classList.add('hidden'); return; }

  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObjects(roomMeshes, false);

  if (hoveredRoom && hoveredRoom !== selectedRoom) resetRoomAppearance(hoveredRoom);

  if (hits.length > 0 && hits[0].object.userData.isRoom) {
    var hit = hits[0].object;
    hoveredRoom = hit;
    canvas.style.cursor = 'pointer';

    if (hit !== selectedRoom) {
      hit.material.emissive.set(getFloorColor(hit.userData.floor));
      hit.material.emissiveIntensity = 0.35;
      hit.material.opacity = 0.72;
    }

    var zone = getFloorZoneLabel(hit.userData.floor);
    tooltip.textContent = hit.userData.label + ' • F' + hit.userData.floor + ' • ' + zone;
    tooltip.style.left = (e.clientX + 16) + 'px';
    tooltip.style.top = (e.clientY - 10) + 'px';
    tooltip.classList.remove('hidden');
  } else {
    hoveredRoom = null;
    canvas.style.cursor = 'default';
    tooltip.classList.add('hidden');
  }
}

function onClick(e) {
  if (currentView === 'realmap') return;
  if (e.target.closest('#info-panel,#floor-controls,#app-header,#view-controls,#view-indicator,#telemetry-dashboard,#map-legend,#map-info-card')) return;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObjects(roomMeshes, false);

  if (selectedRoom && currentView !== 'interior') {
    resetRoomAppearance(selectedRoom);
    selectedRoom = null;
  }

  if (hits.length > 0 && hits[0].object.userData.isRoom) {
    var hit = hits[0].object;
    selectedRoom = hit;

    if (currentView !== 'interior') {
      hit.material.emissive.set(getFloorColor(hit.userData.floor));
      hit.material.emissiveIntensity = 0.5;
      hit.material.opacity = 0.85;
    }

    fetchRoomData(hit.userData.roomId, hit.userData.floor);
  } else if (currentView !== 'interior') {
    infoPanel.classList.add('hidden');
  }
}

function onDoubleClick(e) {
  if (currentView === 'realmap') return;
  if (e.target.closest('#info-panel,#floor-controls,#app-header,#view-controls,#view-indicator,#telemetry-dashboard,#map-legend,#map-info-card')) return;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObjects(roomMeshes, false);

  if (hits.length > 0 && hits[0].object.userData.isRoom) {
    selectedRoom = hits[0].object;
    fetchRoomData(selectedRoom.userData.roomId, selectedRoom.userData.floor);
    switchToInteriorView(selectedRoom);
  }
}

// ===== API Fetch =====
function fetchRoomData(roomId, floorNum) {
  // Fetch room info
  fetch('/api/rooms/' + roomId)
    .then(function(r) { return r.json(); })
    .then(function(json) {
      if (json.success) showInfoPanel(json.data);
    })
    .catch(function() {
      var def = ROOM_DEFS.find(function(d) { return d.id === roomId; });
      if (def) {
        showInfoPanel({
          room_id: def.id, room_name: def.label, department: def.label,
          description: getFloorZoneLabel(def.floor), floor: def.floor,
          working_hours: '9 AM - 6 PM', capacity: '—', status: 'unknown',
          tenant: def.label, area_sqft: '—'
        });
      }
    });

  // Fetch floor telemetry
  fetch('/api/telemetry/' + floorNum)
    .then(function(r) { return r.json(); })
    .then(function(json) {
      if (json.success) showFloorTelemetry(json.data);
    })
    .catch(function() {});
}

function showInfoPanel(data) {
  document.getElementById('panel-title').textContent = data.room_name;
  document.getElementById('info-tenant').textContent = data.tenant || '—';
  document.getElementById('info-room-id').textContent = data.room_id;
  document.getElementById('info-floor').textContent = data.floor === 0 ? 'Ground' : 'Floor ' + data.floor;
  document.getElementById('info-department').textContent = data.department;
  document.getElementById('info-description').textContent = data.description;
  document.getElementById('info-hours').textContent = data.working_hours;
  document.getElementById('info-capacity').textContent = data.capacity + (typeof data.capacity === 'number' ? ' people' : '');
  document.getElementById('info-area').textContent = data.area_sqft ? data.area_sqft.toLocaleString() + ' sqft' : '—';

  var statusEl = document.getElementById('info-status');
  statusEl.textContent = (data.status || '').charAt(0).toUpperCase() + (data.status || '').slice(1);
  statusEl.className = 'info-value';
  if (data.status === 'occupied') statusEl.classList.add('status-occupied');
  else if (data.status === 'available') statusEl.classList.add('status-available');
  else if (data.status === 'restricted') statusEl.classList.add('status-restricted');

  infoPanel.classList.remove('hidden');
}

function showFloorTelemetry(data) {
  document.getElementById('info-temp').textContent = data.temperature.indoor_celsius + '°C (' + data.temperature.hvac_mode + ')';
  document.getElementById('info-power').textContent = data.energy.current_kw + ' kW (' + data.energy.rating + ')';
  document.getElementById('info-occ').textContent = data.occupancy.percentage + '% (' + data.occupancy.estimated_people + ' people)';
  document.getElementById('info-co2').textContent = data.air_quality.co2_ppm + ' ppm (' + data.air_quality.status + ')';
}

// ===== Telemetry Dashboard =====
function updateDashboard() {
  fetch('http://localhost:3000/api/telemetry')
    .then(function(r) { return r.json(); })
    .then(function(json) {
      if (!json.success) return;
      var d = json.data;

      document.getElementById('dash-time').textContent = new Date().toLocaleTimeString();
      document.getElementById('dash-power').textContent = d.summary.total_power_kw + ' kW';
      var pr = document.getElementById('dash-power-rating');
      pr.textContent = d.summary.total_power_kw < 350 ? '✓ Efficient' : d.summary.total_power_kw < 500 ? '~ Normal' : '⚠ High';
      pr.className = 'dash-card-sub ' + (d.summary.total_power_kw < 350 ? 'efficient' : d.summary.total_power_kw < 500 ? 'normal' : 'high');

      document.getElementById('dash-temp').textContent = d.summary.avg_indoor_temp_c + '°C';
      document.getElementById('dash-hvac').textContent = 'District Cooling: ' + d.summary.district_cooling;

      document.getElementById('dash-occupancy').textContent = d.summary.total_occupancy + ' ppl';
      var occPct = Math.round(d.summary.total_occupancy / 800 * 100);
      var occEl = document.getElementById('dash-occ-status');
      occEl.textContent = occPct + '% capacity';
      occEl.className = 'dash-card-sub ' + (occPct < 40 ? 'good' : occPct < 70 ? 'moderate' : 'high');

      document.getElementById('dash-co2').textContent = d.summary.avg_co2_ppm + ' ppm';
      var airEl = document.getElementById('dash-air-status');
      airEl.textContent = d.summary.avg_co2_ppm < 600 ? '✓ Good' : d.summary.avg_co2_ppm < 800 ? '~ Moderate' : '⚠ Poor';
      airEl.className = 'dash-card-sub ' + (d.summary.avg_co2_ppm < 600 ? 'good' : d.summary.avg_co2_ppm < 800 ? 'moderate' : 'poor');

      // Floor heatmap
      updateFloorHeatmap(d.floors);
    })
    .catch(function() {});
}

function updateFloorHeatmap(floors) {
  var container = document.getElementById('floor-heatmap');
  container.innerHTML = '';

  floors.forEach(function(f) {
    var cell = document.createElement('div');
    cell.className = 'heatmap-cell';

    // Color based on energy usage
    var intensity = Math.min(f.power_kw / 20, 1);
    var r = Math.round(intensity * 255);
    var g = Math.round((1 - intensity) * 180);
    var b = Math.round((1 - intensity) * 80);
    cell.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';

    var tip = document.createElement('span');
    tip.className = 'heatmap-tip';
    tip.textContent = f.label + ': ' + f.power_kw + 'kW, ' + f.occupancy_pct + '% occ';
    cell.appendChild(tip);

    cell.addEventListener('click', function() {
      // Filter to this floor
      activeFloor = String(f.floor);
      floorButtons.forEach(function(b) { b.classList.remove('active'); });
      if (currentView === 'interior' || currentView === 'realmap') switchToOrbitView();
      updateFloorVisibility();
    });

    container.appendChild(cell);
  });
}

// ===== Controls Setup =====
function setupFloorControls() {
  floorButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      floorButtons.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      activeFloor = this.dataset.floor;
      if (currentView === 'interior' || currentView === 'realmap') switchToOrbitView();
      updateFloorVisibility();
    });
  });
}

function setupViewControls() {
  viewButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var v = this.dataset.view;
      if (v === currentView) return;
      switch (v) {
        case 'orbit': switchToOrbitView(); break;
        case 'realmap': switchToRealMapView(); break;
        case 'map': switchToMapView(); break;
        case 'birdseye': switchToBirdsEyeView(); break;
        case 'interior':
          if (selectedRoom) { switchToInteriorView(selectedRoom); }
          else {
            var b = this;
            b.style.borderColor = '#ff6b6b'; b.style.color = '#ff6b6b';
            setTimeout(function() { b.style.borderColor = ''; b.style.color = ''; }, 1500);
          }
          break;
      }
    });
  });

  viewIndicatorExit.addEventListener('click', switchToOrbitView);

  // Map info close
  var mapInfoClose = document.getElementById('map-info-close');
  if (mapInfoClose) {
    mapInfoClose.addEventListener('click', function() {
      document.getElementById('map-info-card').classList.add('hidden');
    });
  }
}

panelClose.addEventListener('click', function() {
  infoPanel.classList.add('hidden');
  if (selectedRoom && currentView !== 'interior') {
    resetRoomAppearance(selectedRoom);
    selectedRoom = null;
  }
});

function onKeyDown(e) {
  switch (e.key) {
    case '1': switchToOrbitView(); break;
    case '2': switchToRealMapView(); break;
    case '3': switchToMapView(); break;
    case '4': switchToBirdsEyeView(); break;
    case '5': if (selectedRoom) switchToInteriorView(selectedRoom); break;
    case 'Escape': if (currentView !== 'orbit') switchToOrbitView(); break;
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (maplibreMap) maplibreMap.resize();
}

// ===== Day/Night Cycle Application =====
function applyDayNightCycle() {
  var hour = getCurrentHour();
  var s = getDayNightSettings(hour);

  // Update time label
  var hh = Math.floor(hour);
  var mm = Math.floor((hour - hh) * 60);
  var ampm = hh >= 12 ? 'PM' : 'AM';
  var displayH = hh % 12 || 12;
  var timeLabel = document.getElementById('dn-time-label');
  if (timeLabel) {
    timeLabel.textContent = (displayH < 10 ? '0' : '') + displayH + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ampm;
  }

  // Sky / background
  scene.background.copy(s.skyColor);

  // Fog
  scene.fog = new THREE.FogExp2(s.fogColor.getHex(), s.fogDensity);

  // Sun position (orbit around tower based on angle and elevation)
  if (sunLight) {
    var sunDist = 60;
    var elev = Math.max(s.sunElevation, 0.05) * Math.PI / 2;
    var sx = Math.cos(s.sunAngle) * Math.cos(elev) * sunDist;
    var sy = Math.sin(elev) * sunDist;
    var sz = Math.sin(s.sunAngle) * Math.cos(elev) * sunDist;
    sunLight.position.set(sx, sy, sz);
    sunLight.intensity = s.sunIntensity;

    // Sun color: warm at dawn/dusk, white at midday
    if (hour >= 5 && hour < 8) {
      sunLight.color.setHex(0xffaa66); // warm orange
    } else if (hour >= 8 && hour < 16) {
      sunLight.color.setHex(0xffffff); // white
    } else if (hour >= 16 && hour < 20) {
      sunLight.color.setHex(0xff8844); // warm sunset
    } else {
      sunLight.color.setHex(0x334466); // moonlight blue
    }

    // Shadow visibility
    sunLight.castShadow = s.sunElevation > 0.05;
  }

  // Ambient
  if (ambientLight) {
    ambientLight.intensity = s.ambientIntensity;
    ambientLight.color.copy(s.ambientColor);
  }

  // Hemisphere
  if (hemiLight) {
    hemiLight.intensity = s.hemiIntensity;
    hemiLight.color.copy(s.hemiSkyColor);
    hemiLight.groundColor.copy(s.hemiGroundColor);
  }

  // Fill light (dimmer at night)
  if (fillLight) {
    fillLight.intensity = s.sunIntensity * 0.15;
  }

  // Tone mapping exposure
  renderer.toneMappingExposure = s.exposure;

  // Ground color
  if (groundMesh) {
    var gb = s.groundBrightness;
    groundMesh.material.color.setRGB(gb * 0.5, gb * 0.5, gb * 0.7);
  }
  if (plazaMesh) {
    var pb = s.groundBrightness * 1.2;
    plazaMesh.material.color.setRGB(pb * 0.55, pb * 0.55, pb * 0.75);
  }
  if (roadMesh) {
    var rb = s.groundBrightness * 0.8;
    roadMesh.material.color.setRGB(rb * 0.4, rb * 0.4, rb * 0.55);
  }

  // Green patches - greener during day
  greenPatches.forEach(function(g) {
    var dayFactor = Math.max(0, Math.min(1, (s.groundBrightness - 0.02) / 0.38));
    g.material.color.setRGB(
      0.05 + dayFactor * 0.1,
      0.15 + dayFactor * 0.35,
      0.05 + dayFactor * 0.08
    );
  });

  // Context buildings - slightly visible during day
  contextBuildings.forEach(function(bm) {
    var dayFactor = Math.max(0, Math.min(1, (s.groundBrightness - 0.02) / 0.38));
    bm.material.color.setRGB(
      0.06 + dayFactor * 0.2,
      0.06 + dayFactor * 0.2,
      0.12 + dayFactor * 0.25
    );
  });

  // Tower glow lights - brighter at night
  towerGlowLights.forEach(function(gl) {
    gl.intensity = 0.1 + s.windowGlowIntensity * 0.4;
  });

  // Street lights - on at night
  var isNightish = s.windowGlowIntensity > 0.3;
  streetLights.forEach(function(sl) {
    sl.light.intensity = isNightish ? 0.5 + s.windowGlowIntensity * 0.3 : 0;
    sl.bulb.material.emissiveIntensity = isNightish ? 0.5 + s.windowGlowIntensity * 0.5 : 0;
  });

  // Window glow panels
  windowGlowMeshes.forEach(function(panel) {
    var floorFactor = 1.0;
    // Some floors are occupied 24/7 (exchanges, server room)
    var f = panel.userData.floor;
    if (f >= 11 && f <= 13) floorFactor = 1.2; // exchanges
    else if (f === 27) floorFactor = 1.5; // server room
    else if (f === 0) floorFactor = 0.8; // lobby
    else if (f === 4) floorFactor = 0.6; // food court dimmer at night

    // Random flicker for realism
    var flicker = 0.9 + Math.sin(performance.now() * 0.0003 + f * 1.7) * 0.1;

    var glowOpacity = s.windowGlowIntensity * floorFactor * flicker;

    // During work hours, some windows are lit even in day
    if (hour >= 9 && hour < 18 && s.windowGlowIntensity < 0.1) {
      glowOpacity = 0.02 * floorFactor; // subtle interior light during day
    }

    panel.material.opacity = Math.min(glowOpacity * 0.25, 0.22);

    // Warm color at night, cooler during day
    if (s.windowGlowIntensity > 0.3) {
      panel.material.color.setHex(0xffeedd); // warm
    } else {
      panel.material.color.setHex(0xddeeff); // cool daylight
    }
  });
}

function setupDayNightControls() {
  var dnButtons = document.querySelectorAll('.dn-btn');
  dnButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      dnButtons.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var mode = this.dataset.mode;
      dayNightMode = mode;
      switch (mode) {
        case 'auto': simulatedHour = -1; break;
        case 'dawn': simulatedHour = 6.0; break;
        case 'day': simulatedHour = 12.0; break;
        case 'dusk': simulatedHour = 18.0; break;
        case 'night': simulatedHour = 23.0; break;
      }
      applyDayNightCycle();
    });
  });
}

// ===== Animation Loop =====
var lastDayNightUpdate = 0;

function animate() {
  requestAnimationFrame(animate);
  if (currentView === 'realmap') return; // Skip Three.js rendering when map is shown

  updateCameraAnimation();
  controls.update();

  var time = performance.now() * 0.001;
  var now = performance.now();

  // Update day/night cycle every 500ms (smooth but not every frame)
  if (now - lastDayNightUpdate > 500) {
    applyDayNightCycle();
    lastDayNightUpdate = now;
  }

  // Room pulse
  if (currentView !== 'interior') {
    for (var i = 0; i < roomMeshes.length; i++) {
      var m = roomMeshes[i];
      if (m !== selectedRoom && m !== hoveredRoom) {
        m.material.opacity = m.userData.originalOpacity * (0.88 + Math.sin(time * 1.1 + i * 0.3) * 0.06);
      }
    }
  }

  // Elevator cars
  scene.traverse(function(obj) {
    if (obj.userData.elevatorCar) {
      obj.position.y += obj.userData.speed * obj.userData.direction;
      if (obj.position.y > TOTAL_HEIGHT - 2) obj.userData.direction = -1;
      else if (obj.position.y < 2) obj.userData.direction = 1;
    }
    if (obj.userData.blinkLight) {
      obj.intensity = 0.3 + Math.sin(time * 3) * 0.3;
    }
  });

  renderer.render(scene, camera);
}

// ===== Init =====
function init() {
  initScene();
  addLighting();
  addGround();
  buildTower();
  setupFloorControls();
  setupViewControls();
  setupDayNightControls();

  // Apply initial day/night cycle
  applyDayNightCycle();

  // Hide map legend initially (only shown in real map view)
  document.getElementById('map-legend').style.display = 'none';

  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('click', onClick, false);
  window.addEventListener('dblclick', onDoubleClick, false);
  window.addEventListener('resize', onResize, false);
  window.addEventListener('keydown', onKeyDown, false);

  // Start telemetry
  updateDashboard();
  telemetryInterval = setInterval(updateDashboard, 5000);

  // Hide loading
  setTimeout(function() {
    loadingOverlay.classList.add('fade-out');
    setTimeout(function() { loadingOverlay.style.display = 'none'; }, 600);
  }, 800);

  animate();
}

init();