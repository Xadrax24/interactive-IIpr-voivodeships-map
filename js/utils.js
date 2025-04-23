// funkcja czyszczenia mapy
function clearMap() {
    granicePanGroup.selectAll("*").remove();
    graniceWojGroup.selectAll("*").remove();
    granicePowGroup.selectAll("*").remove();
    miastaGroup.selectAll("*").remove();
    panPoligonyGroup.selectAll("*").remove();
    wojPoligonyGroup.selectAll("*").remove();
    powPoligonyGroup.selectAll("*").remove();
}

// ########## GRANICE ##########
// funkcja wczytywania granic państwa
function loadGranicePan() {
    d3.json(DATA_PATH + "pan_granica.geojson").then(function(data) {
      data.features = data.features.map(f => {
          f.geometry.coordinates = f.geometry.coordinates.map(line => {
            const first = line[0];
            const last = line[line.length - 1];
            if (first[0] === last[0] && first[1] === last[1]) {
              return line.slice(0, -1);
            }
            return line;
          });
        return f;
      });

      projection.fitExtent(
        [[WIDTH * 0.1, HEIGHT * 0.01], [WIDTH * 0.9, HEIGHT * 0.89]],
        data
      );

      granicePanGroup.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
    });
}


// funkcja wczytywania granic województw
function loadGraniceWoj(nazwaWoj = null, projekcja = path, grupa = graniceWojGroup) {
    d3.json(DATA_PATH + "woj_granica.geojson").then(function(data) {
        data.features = data.features.map(f => {
              f.geometry.coordinates = f.geometry.coordinates.map(line => {
                  const first = line[0];
                  const last = line[line.length - 1];
                  return (first[0] === last[0] && first[1] === last[1]) ? line.slice(0, -1) : line;
              });
          return f;
      });
      

        const filteredData = nazwaWoj
            ? data.features.filter(f => f.properties.nazwa === nazwaWoj)
            : data.features;


        grupa.selectAll("path")
        .data(filteredData)
        .enter()
        .append("path")
        .attr("class", "wojewodztwo")
        .attr("d", projekcja)
    });
}

// funkcja wczytywania granicy powiatów
function loadGranicePow(nazwaWoj = null, projekcja = path, grupa = granicePowGroup) {
    d3.json(DATA_PATH + "pow_granica.geojson").then(function(data) {
      data.features = data.features.map(f => {
        if (f.geometry.type === "MultiLineString") {
            f.geometry.coordinates = f.geometry.coordinates.map(line => {
                const first = line[0];
                const last = line[line.length - 1];
                return (first[0] === last[0] && first[1] === last[1]) ? line.slice(0, -1) : line;
            });
        } else if (f.geometry.type === "LineString") {
            const coords = f.geometry.coordinates;
            const first = coords[0];
            const last = coords[coords.length - 1];
            f.geometry.coordinates = (first[0] === last[0] && first[1] === last[1]) ? coords.slice(0, -1) : coords;
        }
        return f;
    });

        const filtered = nazwaWoj
            ? data.features.filter(f => f.properties["PALATINATE_NAME"] === nazwaWoj)
            : data.features;

        grupa.selectAll("path")
            .data(filtered)
            .enter()
            .append("path")
            .attr("class", "granice_pow")
            .attr("d", projekcja)
    });
}

// ########## POLIGONY ##########
// funkcja wczytywania poligonu państwa
function loadPoligonyPan() {
    d3.json(DATA_PATH + "pan_poligony.geojson").then(function(data) {
        panPoligonyGroup.selectAll("path")
          .data(data.features)
          .enter()
          .append("path")
          .attr("class", "pan_pol")
          .attr("d", path)
    })
}

// funckja załadowania poligonu województw
  function loadPoligonyWoj(nazwaWoj = null, projekcja = path, grupa = wojPoligonyGroup) {
    d3.json(DATA_PATH + "woj_poligony.geojson").then(function(data) {
      const filtered = nazwaWoj
        ? data.features.filter(f => f.properties.nazwa === nazwaWoj)
        : data.features;

      grupa.selectAll("path")
        .data(filtered)
        .enter()
        .append("path")
        .attr("class", "woj_pol")
        .attr("d", projekcja)
        .on("click", function(event, d) {
          const nazwa = d.properties.nazwa;
          if (!nazwaWoj) loadPartMap(nazwa);
        });
    });
  }

// funckja załadowania poligonów powiatów
  function loadPoligonyPow(nazwaWoj = null, projekcja = path, grupa = powPoligonyGroup) {
    d3.json(DATA_PATH + "pow_poligony.geojson").then(function(data) {
      const filtered = nazwaWoj
        ? data.features.filter(f => f.properties["PALATINATE_NAME"] === nazwaWoj)
        : data.features;

      grupa.selectAll("path")
        .data(filtered)
        .enter()
        .append("path")
        .attr("class", "pow_pol")
        .attr("d", projekcja)
        .on("mouseover", function(event, d) {
            const powiatNazwa = d.properties.DISTRICT_NAME || "Brak nazwy";
            d3.select("#powiat-info")
            .style("display", "block")
            .text("pow. " + powiatNazwa);
        })
        .on("mouseout", function() {
            d3.select("#powiat-info")
            .style("display", "none");
        })
        .on("click", function(event, d) {
            if (!nazwaWoj) {
                const wojewodztwo = d.properties.PALATINATE_NAME;
                if (wojewodztwo) loadPartMap(wojewodztwo);
            }
        });
    });
  }
  

// ########## MIASTA ##########
// funkcja załadowania miast
function loadMiasta(wojewodztwo, projekcja = projection, grupa = miastaGroup, scaleRange = [2, 8]) {
    d3.json(DATA_PATH + "miasta.geojson").then(function(data) {
      const miasta = wojewodztwo
       ? data.features.filter(city => city.properties["woj."] === wojewodztwo)
       : data.features;

  // Skala rozmiaru punktów
  const populationScale = d3.scaleSqrt()
    .domain(d3.extent(miasta, d => d.properties.licz_lud))
    .range(scaleRange);

    const cities = grupa.selectAll("g.city")
    .data(miasta)
    .enter()
    .append("g")
    .attr("class", "city")
    .attr("transform", d => {
      const [x, y] = projekcja(d.geometry.coordinates);
      return `translate(${x},${y})`;
    })
    .on("mouseover", function(event, d) {
  tooltip.transition().duration(200).style("opacity", 1);
  tooltip.html(d.properties.nazwa || "Brak nazwy")
    .style("left", (event.pageX + 5) + "px")
    .style("top", (event.pageY - 30) + "px");
})
.on("mouseout", function() {
  tooltip.transition().duration(200).style("opacity", 0);
});

  // Białe koło z obwódką dla każdego miasta
  cities.append("circle")
    .attr("r", d => populationScale(d.properties.licz_lud))
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5);

  // Czarna kropka dla stolic województw
  cities.filter(d => d.properties.stolica_woj === true)
    .append("circle")
    .attr("r", d => populationScale(d.properties.licz_lud) * 0.4)
    .attr("fill", "black");
    });
  }