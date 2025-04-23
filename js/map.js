// Element SVG
const svg = d3.select("svg");

// Stworzenie kontenera wspólnego dla elementów administracyjnych
const g = svg.append("g");

// Zarządzanie przybliżaniem
const zoom = d3.zoom()
    .scaleExtent(ZOOM_SETTINGS.scaleExtent)
    .on("zoom", (event) => g.attr("transform", event.transform));
svg.call(zoom);

// Tworzenie tooltip
const tooltip = d3.select("#tooltip");

// Projekcja i generator ścieżek SVG
const projection = d3.geoMercator();
let path = d3.geoPath().projection(projection);

// tworzenie kontenerów na warstwy
const panPoligonyGroup = g.append("g").attr("id", "pan_poligony");
const wojPoligonyGroup = g.append("g").attr("id", "woj_poligony");
const powPoligonyGroup = g.append("g").attr("id", "pow_poligony");
const granicePanGroup = g.append("g").attr("id", "pan_granica");
const graniceWojGroup = g.append("g").attr("id", "woj_granica");
const granicePowGroup = g.append("g").attr("id", "pow_granica");
const miastaGroup = g.append("g").attr("id", "miasta");

