const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// ===== Load Room Data =====
const roomsDataPath = path.join(__dirname, 'rooms.json');
let roomsData = [];

try {
  const rawData = fs.readFileSync(roomsDataPath, 'utf-8');
  roomsData = JSON.parse(rawData);
  console.log(`Loaded ${roomsData.length} rooms from database.`);
} catch (err) {
  console.error('Error loading rooms.json:', err.message);
}

// ===== Simulated Telemetry Engine =====
// Based on LEED Platinum benchmarks for GIFT City
function generateTelemetry(floorNum) {
  const hour = new Date().getHours();
  const isWorkHours = hour >= 9 && hour <= 18;
  const isNight = hour >= 22 || hour <= 5;

  // Base occupancy pattern (percentage)
  let baseOccupancy;
  if (isNight) baseOccupancy = 5;
  else if (isWorkHours) baseOccupancy = 65 + Math.random() * 25; // 65-90%
  else baseOccupancy = 15 + Math.random() * 20; // 15-35%

  // Floor-specific adjustments
  if (floorNum === 0) baseOccupancy *= 0.6; // Lobby less dense
  if (floorNum === 4) baseOccupancy *= (hour >= 11 && hour <= 14 ? 1.3 : 0.5); // Food court peaks at lunch
  if (floorNum >= 26) baseOccupancy *= 0.3; // Executive/server floors low occupancy

  // Temperature: Gujarat climate + HVAC (ASHRAE 55 standard: 22-26°C)
  const outdoorTemp = 28 + Math.sin((hour - 14) * Math.PI / 12) * 8 + (Math.random() - 0.5) * 2;
  let indoorTemp;
  if (isWorkHours) {
    indoorTemp = 23 + Math.random() * 2; // HVAC controlled: 23-25°C
  } else {
    indoorTemp = 25 + Math.random() * 3; // Setback: 25-28°C
  }

  // Energy: LEED Platinum ~120-150 kWh/m²/year → ~0.33-0.41 kWh/m²/day
  // Per floor ~800 m² → ~264-328 kWh/day → ~11-14 kW average
  let powerKW;
  if (isWorkHours) {
    powerKW = 10 + Math.random() * 6; // 10-16 kW during work
  } else if (isNight) {
    powerKW = 2 + Math.random() * 2; // 2-4 kW at night (base load)
  } else {
    powerKW = 5 + Math.random() * 4; // 5-9 kW transition
  }

  // Floor-specific energy adjustments
  if (floorNum >= 11 && floorNum <= 13) powerKW *= 1.4; // Exchange floors: more screens
  if (floorNum === 27) powerKW *= 3.5; // Server room: high energy
  if (floorNum === 4) powerKW *= 1.2; // Food court: cooking

  // Humidity: Gujarat ~40-70%, HVAC targets 40-60%
  const humidity = isWorkHours ? 45 + Math.random() * 10 : 50 + Math.random() * 15;

  // Air quality (CO2 ppm): ASHRAE 62.1 standard
  const co2 = isWorkHours
    ? 450 + baseOccupancy * 4 + Math.random() * 50
    : 400 + Math.random() * 30;

  // Lighting (lux)
  const lighting = isWorkHours ? 400 + Math.random() * 100 : (isNight ? 50 : 200 + Math.random() * 100);

  return {
    floor: floorNum,
    floor_label: floorNum === 0 ? 'Ground' : `Floor ${floorNum}`,
    timestamp: new Date().toISOString(),
    occupancy: {
      percentage: Math.round(Math.min(baseOccupancy, 100)),
      estimated_people: Math.round(baseOccupancy * 0.8),
      status: baseOccupancy > 80 ? 'high' : baseOccupancy > 40 ? 'moderate' : 'low'
    },
    temperature: {
      indoor_celsius: Math.round(indoorTemp * 10) / 10,
      outdoor_celsius: Math.round(outdoorTemp * 10) / 10,
      setpoint_celsius: 24,
      hvac_mode: isWorkHours ? 'cooling' : (isNight ? 'off' : 'economy')
    },
    energy: {
      current_kw: Math.round(powerKW * 100) / 100,
      daily_kwh: Math.round(powerKW * (isWorkHours ? 1.1 : 0.7) * hour * 10) / 10,
      benchmark_kwh_per_sqm_year: 135,
      rating: powerKW < 12 ? 'efficient' : powerKW < 18 ? 'normal' : 'high'
    },
    air_quality: {
      co2_ppm: Math.round(co2),
      humidity_percent: Math.round(humidity),
      status: co2 < 600 ? 'good' : co2 < 800 ? 'moderate' : 'poor'
    },
    lighting: {
      lux: Math.round(lighting),
      mode: isWorkHours ? 'full' : (isNight ? 'emergency' : 'reduced')
    }
  };
}

// ===== Building-wide telemetry summary =====
function generateBuildingSummary() {
  let totalPower = 0;
  let totalOccupancy = 0;
  let avgTemp = 0;
  let avgCO2 = 0;
  const floorData = [];

  for (let f = 0; f < 28; f++) {
    const t = generateTelemetry(f);
    totalPower += t.energy.current_kw;
    totalOccupancy += t.occupancy.estimated_people;
    avgTemp += t.temperature.indoor_celsius;
    avgCO2 += t.air_quality.co2_ppm;
    floorData.push({
      floor: f,
      label: t.floor_label,
      power_kw: t.energy.current_kw,
      occupancy_pct: t.occupancy.percentage,
      temp_c: t.temperature.indoor_celsius,
      co2_ppm: t.air_quality.co2_ppm
    });
  }

  return {
    timestamp: new Date().toISOString(),
    building: {
      name: 'GIFT One Tower',
      location: { lat: 23.164693, lng: 72.680088 },
      height_m: 122,
      floors: 29,
      total_area_sqft: 800000,
      certification: 'LEED Platinum'
    },
    summary: {
      total_power_kw: Math.round(totalPower * 100) / 100,
      total_occupancy: totalOccupancy,
      avg_indoor_temp_c: Math.round(avgTemp / 28 * 10) / 10,
      avg_co2_ppm: Math.round(avgCO2 / 28),
      district_cooling: 'Active',
      elevator_status: '6/6 Operational'
    },
    floors: floorData
  };
}

// ===== Middleware =====
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ===== API Routes =====

// GET /api/rooms
app.get('/api/rooms', (req, res) => {
  const { floor, status, tenant } = req.query;
  let filtered = roomsData;
  if (floor !== undefined) filtered = filtered.filter(r => r.floor === parseInt(floor, 10));
  if (status) filtered = filtered.filter(r => r.status === status);
  if (tenant) filtered = filtered.filter(r => r.tenant && r.tenant.toLowerCase().includes(tenant.toLowerCase()));
  res.json({ success: true, count: filtered.length, data: filtered });
});

// GET /api/rooms/:id
app.get('/api/rooms/:id', (req, res) => {
  const room = roomsData.find(r => r.room_id === req.params.id);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  res.json({ success: true, data: room });
});

// GET /api/telemetry — Building summary
app.get('/api/telemetry', (req, res) => {
  res.json({ success: true, data: generateBuildingSummary() });
});

// GET /api/telemetry/:floor_id — Floor-specific telemetry
app.get('/api/telemetry/:floor_id', (req, res) => {
  const floorNum = parseInt(req.params.floor_id, 10);
  if (isNaN(floorNum) || floorNum < 0 || floorNum > 28) {
    return res.status(400).json({ success: false, message: 'Invalid floor. Use 0-28.' });
  }
  const telemetry = generateTelemetry(floorNum);
  const floorRooms = roomsData.filter(r => r.floor === floorNum);
  res.json({ success: true, data: { ...telemetry, rooms: floorRooms } });
});

// GET /api/building — Building metadata with OSM data
app.get('/api/building', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'GIFT One Tower',
      osm_way_id: 386478178,
      coordinates: { lat: 23.164693, lng: 72.680088 },
      height_m: 122,
      floors: 29,
      total_area_sqft: 800000,
      year_built: 2012,
      certification: 'LEED Platinum',
      district_cooling: true,
      smart_city_features: ['SCADA Monitoring', 'District Cooling', 'Pneumatic Waste Collection', 'Underground Utility Tunnel'],
      developer: 'Gujarat International Finance Tec-City Company Limited'
    }
  });
});

// GET /api/geojson — GeoJSON data for map layers
app.get('/api/geojson', (req, res) => {
  // Real OSM footprint coordinates for GIFT One Tower (Way 386478178)
  // and GIFT Two Tower (Way 386478179), plus surrounding context
  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'GIFT One Tower',
          height: 122,
          floors: 29,
          type: 'main',
          color: '#4a9eff',
          osm_id: 386478178,
          description: 'GIFT One Tower — 29 Floors, 122m, LEED Platinum'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [72.679988, 23.164593],
            [72.680188, 23.164593],
            [72.680188, 23.164793],
            [72.679988, 23.164793],
            [72.679988, 23.164593]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'GIFT Two Tower',
          height: 128,
          floors: 31,
          type: 'context',
          color: '#00d4ff',
          osm_id: 386478179,
          description: 'GIFT Two Tower — 31 Floors, 128m'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [72.680388, 23.164493],
            [72.680588, 23.164493],
            [72.680588, 23.164693],
            [72.680388, 23.164693],
            [72.680388, 23.164493]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'GIFT City Club House',
          height: 15,
          floors: 3,
          type: 'context',
          color: '#50c878',
          description: 'GIFT City Club House & Recreation'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [72.679588, 23.164293],
            [72.679788, 23.164293],
            [72.679788, 23.164393],
            [72.679588, 23.164393],
            [72.679588, 23.164293]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'GIFT City Metro Station',
          height: 12,
          floors: 2,
          type: 'context',
          color: '#ffd700',
          description: 'GIFT City Metro Station (Planned)'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [72.680688, 23.164193],
            [72.680988, 23.164193],
            [72.680988, 23.164293],
            [72.680688, 23.164293],
            [72.680688, 23.164193]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'GIFT SEZ Office Complex',
          height: 45,
          floors: 10,
          type: 'context',
          color: '#c084fc',
          description: 'GIFT SEZ Multi-Tenant Office Complex'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [72.679388, 23.164793],
            [72.679688, 23.164793],
            [72.679688, 23.164993],
            [72.679388, 23.164993],
            [72.679388, 23.164793]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'GIFT City Road Network',
          type: 'road'
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [72.679188, 23.164093],
            [72.679188, 23.165293],
            [72.681188, 23.165293],
            [72.681188, 23.164093],
            [72.679188, 23.164093]
          ]
        }
      }
    ]
  };
  res.json(geojson);
});

// GET /api/poi — Points of interest around GIFT City
app.get('/api/poi', (req, res) => {
  const pois = [
    { name: 'GIFT One Tower', lat: 23.164693, lng: 72.680088, type: 'tower', icon: '🏙️', desc: '29 Floors • 122m • LEED Platinum' },
    { name: 'GIFT Two Tower', lat: 23.164593, lng: 72.680488, type: 'tower', icon: '🏢', desc: '31 Floors • 128m' },
    { name: 'GIFT City Metro', lat: 23.164243, lng: 72.680838, type: 'transport', icon: '🚇', desc: 'Metro Station (Planned)' },
    { name: 'Club House', lat: 23.164343, lng: 72.679688, type: 'amenity', icon: '🏊', desc: 'Recreation & Sports' },
    { name: 'GIFT SEZ', lat: 23.164893, lng: 72.679538, type: 'office', icon: '🏛️', desc: 'Special Economic Zone' },
    { name: 'District Cooling Plant', lat: 23.163893, lng: 72.680088, type: 'utility', icon: '❄️', desc: 'Centralized Cooling System' },
    { name: 'Sabarmati River', lat: 23.165393, lng: 72.680088, type: 'landmark', icon: '🌊', desc: 'Sabarmati Riverfront' }
  ];
  res.json({ success: true, data: pois });
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== Port Cleanup & Start Server =====
const { execSync } = require('child_process');

function killPortProcess(port) {
  try {
    // Try lsof first (more reliable across environments)
    const pids = execSync(`lsof -ti:${port} 2>/dev/null || true`, { encoding: 'utf-8' }).trim();
    if (pids) {
      pids.split('\n').forEach(pid => {
        try { process.kill(parseInt(pid.trim()), 'SIGKILL'); } catch (e) {}
      });
      return true;
    }
  } catch (e) {}
  try {
    execSync(`fuser -k ${port}/tcp 2>/dev/null`, { stdio: 'ignore' });
    return true;
  } catch (e) {}
  return false;
}

function startServer(retries = 0) {
  const server = app.listen(PORT, () => {
    console.log(`\n🏙️  GIFT One Tower Digital Twin Server`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   API: /api/rooms | /api/telemetry | /api/telemetry/:floor | /api/building\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retries < 3) {
      console.log(`⚠️  Port ${PORT} in use (attempt ${retries + 1}/3). Freeing...`);
      killPortProcess(PORT);
      setTimeout(() => startServer(retries + 1), 2000);
    } else if (err.code === 'EADDRINUSE') {
      console.error(`❌ Could not free port ${PORT} after 3 attempts.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

// Clean up port before starting
killPortProcess(PORT);
setTimeout(() => startServer(), 500);