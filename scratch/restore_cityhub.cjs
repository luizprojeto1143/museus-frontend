const fs = require('fs');
const file = 'src/modules/visitor/pages/CityHub.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  '<HubFeaturedCities filteredCities={filteredCities} />',
  `        {/* Central Dashboard Scroll Area */}
        <main className="hub-main-dashboard">
          {/* Top Bar Header */}
          <HubHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} authName={authName} levelTitle={levelTitle} />

          {/* Hero Welcome banner */}
          <HubHeroBanner hubSettings={hubSettings} hasCities={cities.length > 0} />

          {/* Cidades em Destaque Rows */}
          <HubFeaturedCities filteredCities={filteredCities} />`
);

fs.writeFileSync(file, c);
