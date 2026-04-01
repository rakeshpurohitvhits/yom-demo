================================================================================
          GIFT ONE TOWER - 3D DIGITAL TWIN
          Interactive Building Visualization
================================================================================

OVERVIEW
--------
A web-based 3D Digital Twin prototype of GIFT One Tower (Gujarat International 
Finance Tec-City), built with Three.js, MapLibre GL JS, and Express.js. 

Features include:
  • 3D interactive building model (29 floors, 122m tall)
  • Real map integration with MapLibre GL JS (OpenStreetMap)
  • Floor-by-floor exploration with room metadata
  • Real-time simulated telemetry (occupancy, temperature, energy, air quality)
  • Day/Night mode with realistic lighting and shadows
  • Multiple view modes: Orbit, Map, Bird's Eye, Interior, Real Map
  • Clickable rooms with tenant information
  • Surrounding GIFT City context (GIFT Two Tower, Metro Station, etc.)


PREREQUISITES
-------------
Before running this project, make sure you have the following installed:

  1. Node.js (v14 or higher)
     Download: https://nodejs.org/
     Verify:   node --version

  2. npm (comes with Node.js)
     Verify:   npm --version

  3. A modern web browser (Chrome, Firefox, Edge, Safari)


PROJECT STRUCTURE
-----------------
  /workspace/app/frontend/
  ├── index.html          # Main HTML file (UI, controls, layout)
  ├── style.css           # Stylesheet (dark theme, responsive design)
  ├── script.js           # Main JavaScript (Three.js 3D scene, MapLibre map,
  │                       #   camera controls, telemetry, day/night mode)
  ├── server.js           # Express.js backend server (API endpoints)
  ├── rooms.json          # Room metadata (30 rooms with tenant info)
  ├── three.min.js        # Three.js library (local copy)
  ├── OrbitControls.js    # Three.js OrbitControls module
  ├── package.json        # Node.js project configuration
  ├── package-lock.json   # Dependency lock file
  └── README.txt          # This file


INSTALLATION & SETUP
--------------------
Follow these steps to run the project locally:

  Step 1: Open a terminal/command prompt

  Step 2: Navigate to the project directory
          cd /workspace/app/frontend
          (or wherever you have saved the project files)

  Step 3: Install dependencies
          npm install

  Step 4: Start the server
          npm start
          (or alternatively: node server.js)

  Step 5: Open your browser and go to:
          http://localhost:3000

That's it! The application should now be running.


ENVIRONMENT VARIABLES (OPTIONAL)
---------------------------------
  PORT    - Set a custom port (default: 3000)
            Example: PORT=8080 node server.js


API ENDPOINTS
-------------
The Express server provides the following REST API endpoints:

  GET /api/rooms
      Returns all rooms. Supports query filters:
        ?floor=5        - Filter by floor number (0-28)
        ?status=occupied - Filter by status (occupied/vacant/maintenance)
        ?tenant=IFSC    - Search by tenant name

  GET /api/rooms/:id
      Returns a specific room by room_id
      Example: /api/rooms/GF-001

  GET /api/telemetry
      Returns building-wide telemetry summary (all 28 floors)

  GET /api/telemetry/:floor_id
      Returns telemetry for a specific floor (0-28)
      Example: /api/telemetry/5

  GET /api/building
      Returns building metadata (name, coordinates, certifications, etc.)

  GET /api/geojson
      Returns GeoJSON data for map layers (building footprints, roads, POIs)

  GET /api/poi
      Returns Points of Interest around GIFT City


VIEW MODES
----------
  • Orbit View     - Default 3D view, rotate around the building
  • Map View       - Top-down orthographic view
  • Bird's Eye     - Elevated perspective view
  • Interior View  - First-person view inside a floor
  • Real Map       - MapLibre GL JS map with building at real-world coordinates
                     (23.1647°N, 72.6801°E)


DAY/NIGHT MODES
---------------
  • Dawn  🌅  - Warm sunrise lighting with soft shadows
  • Day   ☀️  - Bright daylight with full shadows
  • Dusk  🌇  - Orange sunset lighting
  • Night 🌙  - Dark mode with glowing windows and street lights
  • Auto  🔄  - Automatically matches your local time of day


CONTROLS
--------
  Mouse:
    Left Click + Drag   - Rotate the view (Orbit mode)
    Right Click + Drag  - Pan the view
    Scroll Wheel        - Zoom in/out
    Click on Floor      - Select floor and view room details
    Click on Room       - View room metadata and tenant info

  UI Controls:
    View Mode Buttons   - Switch between view modes (top of screen)
    Time of Day Buttons - Switch day/night mode
    Floor Slider        - Navigate between floors
    Telemetry Panel     - Real-time building data dashboard


TROUBLESHOOTING
---------------
  Issue: "Port 3000 is already in use"
  Fix:   The server automatically tries to free the port. If it fails:
         - On Linux/Mac:  lsof -ti:3000 | xargs kill -9
         - On Windows:    netstat -ano | findstr :3000
                          taskkill /PID <PID> /F
         - Or use a different port: PORT=3001 node server.js

  Issue: "Cannot find module 'express'"
  Fix:   Run "npm install" in the project directory

  Issue: Map tiles not loading in Real Map mode
  Fix:   Ensure you have an active internet connection (OSM tiles load online)

  Issue: 3D scene is slow/laggy
  Fix:   Try a browser with hardware acceleration enabled (Chrome recommended)


TECHNOLOGY STACK
----------------
  Frontend:
    • Three.js          - 3D rendering engine
    • MapLibre GL JS    - Open-source map library (OpenStreetMap tiles)
    • HTML5 / CSS3      - UI and styling
    • Vanilla JavaScript - Application logic

  Backend:
    • Node.js           - Runtime environment
    • Express.js        - Web server framework

  Data:
    • OpenStreetMap     - Map tiles and geographic data
    • rooms.json        - Room and tenant metadata (30 rooms)
    • Simulated telemetry based on LEED Platinum benchmarks


BUILDING DATA
-------------
  Name:          GIFT One Tower
  Location:      23.164693°N, 72.680088°E (GIFT City, Gandhinagar, Gujarat)
  Height:        122 meters
  Floors:        29 (Ground + 28 upper floors)
  Total Area:    800,000 sq ft
  Year Built:    2012
  Certification: LEED Platinum
  Developer:     Gujarat International Finance Tec-City Company Limited


LICENSE
-------
  MIT License


================================================================================
  For questions or issues, please contact the development team.
================================================================================
