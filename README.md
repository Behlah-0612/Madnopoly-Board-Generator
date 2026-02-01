# **MADNOPOLY BOARD GENERATOR**



A small front-end application that procedurally generates a Monopoly-style closed-loop board path and fills it with Kamloops-themed tiles (properties, transit hubs, utilities, taxes, Chance/Community). It renders the board in a 3D-styled view and lets you click tiles to view a detailed “property deed” card.



#### **WHAT THIS INCLUDES**



Procedural path generation: grid-based loop creation with controlled detours while always forming a valid closed cycle.



Tile assignment: anchor tiles (GO, JAIL, FREE PARKING, GO TO JAIL) remain fixed; special tiles are evenly distributed; property colours are grouped for balanced gameplay.



Seeded randomness: separate seeds are used for board path generation and tile placement and are displayed in the UI.



Interactive UI: players can click tiles to view details, drag to rotate the board, zoom, toggle the legend, and use keyboard shortcuts.



#### **HOW TO RUN**

No build tools required.



Download or clone the project folder.



Open index.html in a web browser (Chrome or Edge recommended).





#### **FILE OVERVIEW**



index.html: Defines the structure of the interface including controls, board container, property card, legend, loading screen, and shortcuts.



script.js: Contains the procedural content generation logic, seeded random functions, board path creation, tile assignment, rendering, and user interactions.



styles.css: Handles the visual styling, board appearance, 3D effects, property cards, legend, and loading animations.



#### **NOTES**

This module is designed to support a hybrid PCG board game workflow where the board is generated digitally and then reconstructed physically using modular tiles. The grid size and path length are fixed to maintain clarity and consistency across sessions.

