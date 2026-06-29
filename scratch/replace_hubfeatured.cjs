const fs = require('fs');
const file = 'src/modules/visitor/pages/CityHub.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('import { HubFeaturedCities }')) {
  c = c.replace('import { HubHeader } from "../components/CityHub/HubHeader";', 'import { HubHeader } from "../components/CityHub/HubHeader";\nimport { HubFeaturedCities } from "../components/CityHub/HubFeaturedCities";');
}

const sectionRegex = /<\s*section className="dashboard-section-row mb-10"[\s\S]*?<\/\s*section\s*>/;
c = c.replace(sectionRegex, `<HubFeaturedCities filteredCities={filteredCities} />`);

fs.writeFileSync(file, c);
