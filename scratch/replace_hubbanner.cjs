const fs = require('fs');
const file = 'src/modules/visitor/pages/CityHub.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('import { HubHeroBanner }')) {
  c = c.replace('import { HubFeaturedCities } from "../components/CityHub/HubFeaturedCities";', 'import { HubFeaturedCities } from "../components/CityHub/HubFeaturedCities";\nimport { HubHeroBanner } from "../components/CityHub/HubHeroBanner";');
}

const bannerRegex = /<\s*div[^>]*className="dashboard-hero-banner cursor-pointer"[\s\S]*?<\/\s*div\s*>/;
c = c.replace(bannerRegex, `<HubHeroBanner hubSettings={hubSettings} hasCities={cities.length > 0} />`);

fs.writeFileSync(file, c);
