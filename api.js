lucide.createIcons();

const APIRoot = "https://swapi.py4e.com/api";

const APIEndpoints = {
  films: `${APIRoot}/films`,
  people: `${APIRoot}/people`,
  planets: `${APIRoot}/planets`,
  species: `${APIRoot}/species`,
  starships: `${APIRoot}/starships`,
  vehicles: `${APIRoot}/vehicles`
}


const handlePaginationFetch = async (url, params) => {
  try {
    const searchParam = new URLSearchParams(params)
    const res = await fetch(`${url}?${searchParam.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
}


const APIPaginate = {
  films: (params) => handlePaginationFetch(APIEndpoints.films, params),
  people: (params) => handlePaginationFetch(APIEndpoints.people, params),
  planets: (params) => handlePaginationFetch(APIEndpoints.planets, params),
  species: (params) => handlePaginationFetch(APIEndpoints.species, params),
  starships: (params) => handlePaginationFetch(APIEndpoints.starships, params),
  vehicles: (params) => handlePaginationFetch(APIEndpoints.vehicles, params)
}

window.onload = async () => {

  // Gestion des boutons ou actions qui sont actif selon la page;
  const currentPathname = window.location.pathname;
  const activableDocuments = document.getElementsByClassName("unactive");
  for (const doc of activableDocuments) {
    if (doc.nodeName === "A") {
      if (new URL(doc.href).pathname === currentPathname) {
        doc.classList.remove('unactive');
        doc.classList.add('active');
      }
    } else {
      doc.classList.remove('unactive');
      doc.classList.add('active');
    }
  }

  const onPlanetSelected = (planet) => {
    const selectedPlanet = document.getElementById("selected-planet");
    selectedPlanet.innerHTML = `
        <h2 class="text-2xl font-bold mb-5">${planet.name}</h2>
        <p class="text-lg">Population : ${planet.population}</p>
        <p class="text-lg">Terrain : ${planet.terrain}</p>
        <p class="text-lg">Résidents : ${planet.residents.length}</p>
    `;
  };

  const renderPlanets = (planets) => {
    const planetsContainer = document.getElementById("planets");
    if (!planetsContainer) return;
    planetsContainer.innerHTML = "";
    planets.forEach((planet) => {
      const planetElement = document.createElement("tr");
      planetElement.innerHTML = `
      <td>${planet.name}</td>
      <td class="text-right">${planet.population}</td>
      <td class="text-right">${planet.diameter}</td>
      <td class="text-right">${new Date(planet.created).toLocaleDateString()}</td>
    `;
      planetElement.addEventListener("click", () => onPlanetSelected(planet));
      planetsContainer.appendChild(planetElement);
    });

  };

  const renderPlanetsCount = (count) => {
    const resultsCount = document.getElementById("planets-results-count");
    if (resultsCount)
      resultsCount.textContent = count;
  }
  const renderPeopleCount = (count) => {
    const resultsCount = document.getElementById("people-results-count");
    if (resultsCount)
      resultsCount.textContent = count;
  }
  const renderVehiculCount = (count) => {
    const resultsCount = document.getElementById("vehicul-results-count");
    if (resultsCount)
      resultsCount.textContent = count;
  }

  const resPlanets = await APIPaginate.planets();
  renderPlanets(resPlanets.results)
  renderPlanetsCount(resPlanets.count);

  const resPeople = await APIPaginate.people();
  renderPeopleCount(resPeople.count);

  const resVehicul = await APIPaginate.vehicles();
  renderVehiculCount(resVehicul.count);


  let timer = null;

  const antiSpam = (func) => {
    return (e) => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        func(e);
      }, 700);
    };
  };

  const getFilterPlanets = async (e) => {
    const search = e.target?.value;
    let planets = [];
    let count = 0
    if (search) {
      const resPlanets = await APIPaginate.planets({ search })
      planets = resPlanets.results;
      count = resPlanets.count;
    } else {
      const resPlanets = await APIPaginate.planets();
      planets = resPlanets.results;
      count = resPlanets.count;
    }
    renderResultsCount(count);
    renderPlanets(planets)
  };

  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", antiSpam(getFilterPlanets));
  }

  const sortPlanets = async (value, direction) => {
    const results = resPlanets.results;
    switch (value) {
      case "name":
        renderPlanets(results.sort((a, b) => a.name.localeCompare(b.name)))
        break;
      case "population":
        renderPlanets(results.sort((a, b) => direction === "asc" ? a.population - b.population : b.population - a.population))
        break;
      case "diametre":
        renderPlanets(results.sort((a, b) => direction === "asc" ? a.diameter - b.diameter : b.diameter - a.diameter))
        break;
      case "created":
        renderPlanets(results.sort((a, b) => direction === "asc" ? new Date(a.created).getTime() - new Date(b.created).getTime() : new Date(b.created) - new Date(a.created)))
        break;
      default:
        renderPlanets(results)
        break;
    }
  }

  const selectInput = document.getElementById('sort-select')
  const selectDirectionInput = document.getElementById('sort-direction-select')
  if (selectInput && selectDirectionInput) {
    selectInput.addEventListener("input", (e) => {
      const selectDirectionInput = document.getElementById('sort-direction-select')
      sortPlanets(e.target.value, selectDirectionInput.value)
    });
    selectDirectionInput.addEventListener("input", (e) => {
      const selectInput = document.getElementById('sort-select')
      sortPlanets(selectInput.value, e.target.value)
    });
  }
};