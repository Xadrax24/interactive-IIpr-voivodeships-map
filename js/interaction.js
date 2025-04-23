// funkcja załadowania województw w widoku województwa
function loadPartMap(nazwaWoj) {
    clearMap();
    document.getElementById("checkbox-panstwo").style.display = "none";
  // Wczytaj dane o województwach
  d3.json(DATA_PATH + "woj_poligony.geojson").then(function(wojPolData) {
    const wojFeature = wojPolData.features.find(f => f.properties.nazwa === nazwaWoj);
    if (!wojFeature) {
      console.warn("Nie znaleziono województwa:", nazwaWoj);
      return;
    }
    d3.select("#info").text("woj. " + nazwaWoj);

    const { projekcja: lokalnaProjekcja, sciezka: lokalnaSciezka } = getLokalnaProjekcja(wojFeature);

    loadPoligonyWoj(nazwaWoj, lokalnaSciezka, wojPoligonyGroup);
    loadPoligonyPow(nazwaWoj, lokalnaSciezka, powPoligonyGroup);
    loadGraniceWoj(nazwaWoj, lokalnaSciezka, graniceWojGroup);
    loadGranicePow(nazwaWoj, lokalnaSciezka, granicePowGroup);
    loadMiasta(nazwaWoj, lokalnaProjekcja, miastaGroup, [3, 10]);
});
}

// Funkcja przywracająca główny widok mapy
function loadFullMap() {
    clearMap();
    loadGranicePan();
    loadGraniceWoj();
    loadGranicePow();
    loadMiasta();
    loadPoligonyPan();
    loadPoligonyWoj();
    loadPoligonyPow();
  
    d3.select("#info").text("II RP")
    d3.select("#powiat-info").style("display", "none");
    document.getElementById("checkbox-panstwo").style.display = "inline-block";
  }

  function getLokalnaProjekcja(feature) {
    const projekcja = d3.geoMercator();
    projekcja.fitExtent(
      [[WIDTH * 0.1, HEIGHT * 0.01], [WIDTH * 0.9, HEIGHT * 0.89]],
      feature
    );
    return {
      projekcja: projekcja,
      sciezka: d3.geoPath().projection(projekcja)
    };
  }


  // Nasłuchiwacz na zmianę warstw
  d3.selectAll('#layer-controls input[type="checkbox"]').on("change", function() {
    const layers = d3.select(this).attr("data-layer").split(",");
    const visible = this.checked;
  
    layers.forEach(layerId => {
      d3.select(`#${layerId}`).style("display", visible ? null : "none");
    });
    if (layers.includes("powiaty") && !visible) {
      d3.select("#powiat-info").style("display", "none");
    }
  });


  // Nasłuchiwacz na klawisz ESC (by wrócić do głównego widoku mapy)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {  // Jeśli naciśnięto ESC
      loadFullMap(); // Przywróć główny widok mapy
    }
  });