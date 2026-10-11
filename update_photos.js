const fs = require('fs');
const path = require('path');

const stationsPath = path.join(__dirname, 'tube_stations.json');
const photosDir = path.join(__dirname, 'photos');

if (!fs.existsSync(stationsPath)) {
  console.error('tube_stations.json not found!');
  process.exit(1);
}

if (!fs.existsSync(photosDir)) {
  console.error('photos/ directory not found!');
  process.exit(1);
}

const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
const folders = fs.readdirSync(photosDir).filter(f => {
  try {
    return fs.statSync(path.join(photosDir, f)).isDirectory();
  } catch (e) {
    return false;
  }
});

const mediaRegex = /\.(jpe?g|png|webp|mp4|mov|webm)$/i;

let totalPhotosLinked = 0;
let stationsUpdated = 0;

stations.forEach(st => {
  delete st.folder;
  if (folders.includes(st.name)) {
    const folderPath = path.join(photosDir, st.name);
    const files = fs.readdirSync(folderPath)
      .filter(f => !f.startsWith('.') && mediaRegex.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    st.photos = files;
    totalPhotosLinked += files.length;
    stationsUpdated++;
  } else {
    st.photos = [];
    console.warn(`Warning: No matching folder in photos/ for station "${st.name}"`);
  }
});

fs.writeFileSync(stationsPath, JSON.stringify(stations, null, 2) + '\n', 'utf8');

console.log('----------------------------------------------------');
console.log(`Successfully updated tube_stations.json!`);
console.log(`Total stations: ${stations.length}`);
console.log(`Stations with photos: ${stationsUpdated} / ${stations.length}`);
console.log(`Total photo links created: ${totalPhotosLinked}`);
console.log('----------------------------------------------------');
