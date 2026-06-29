const fs = require('fs');
const file = 'src/modules/visitor/pages/CityDashboard.tsx';
let c = fs.readFileSync(file, 'utf8');

// Remove the misplaced <CityProgress ... />
c = c.replace(/<CityProgress\s+explorationPercent=[\s\S]*?onNavigate={navigate}\s*\/>/g, '');

// Insert it back before the view-progress-btn
const targetStr = '<Button \n              variant="outline" \n              className="view-progress-btn';
const progressStr = `<CityProgress 
            explorationPercent={explorationPercent}
            visitedEquipmentsCount={visitedEquipmentsCount}
            totalEquipmentsCount={totalEquipmentsCount}
            registeredEventsCount={registeredEventsCount}
            activeEventsCount={activeEventsCount}
            completedTrailsCount={completedTrailsCount}
            totalTrailsCount={totalTrailsCount}
            equipmentsPercent={equipmentsPercent}
            eventsPercent={eventsPercent}
            trailsPercent={trailsPercent}
            onNavigate={navigate}
          />
          `;

c = c.replace(targetStr, progressStr + targetStr);

fs.writeFileSync(file, c);
