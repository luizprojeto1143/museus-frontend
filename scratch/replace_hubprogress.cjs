const fs = require('fs');
const file = 'src/modules/visitor/pages/CityHub.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('import { HubCulturalProgress }')) {
  c = c.replace('import { HubHeroBanner } from "../components/CityHub/HubHeroBanner";', 'import { HubHeroBanner } from "../components/CityHub/HubHeroBanner";\nimport { HubCulturalProgress } from "../components/CityHub/HubCulturalProgress";');
}

const sectionRegex = /<\s*section className="dashboard-cultural-progress-banner"[\s\S]*?<\/\s*section\s*>/;
c = c.replace(sectionRegex, `<HubCulturalProgress totalExploration={totalExploration} citiesVisited={citiesVisited} museumsExplored={museumsExplored} visitor={visitor} />`);

fs.writeFileSync(file, c);
