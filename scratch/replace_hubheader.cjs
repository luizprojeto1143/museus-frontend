const fs = require('fs');
const file = 'src/modules/visitor/pages/CityHub.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('import { HubHeader }')) {
  c = c.replace('import { Card, Badge, Button } from "@/components/ui";', 'import { Card, Badge, Button } from "@/components/ui";\nimport { HubHeader } from "../components/CityHub/HubHeader";');
}

const headerRegex = /<\s*header className="dashboard-top-bar flex justify-between items-center mb-8"[\s\S]*?<\/\s*header\s*>/;
c = c.replace(headerRegex, `<HubHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} authName={authName} levelTitle={levelTitle} />`);

fs.writeFileSync(file, c);
