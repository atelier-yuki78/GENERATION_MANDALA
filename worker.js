importScripts('https://cdn.jsdelivr.net/npm/swisseph@2.10.8-1/dist/swisseph.min.js');

const PLANETS = [
    swisseph.SE_SUN,
    swisseph.SE_MOON,
    swisseph.SE_MERCURY,
    swisseph.SE_VENUS,
    swisseph.SE_MARS,
    swisseph.SE_JUPITER,
    swisseph.SE_SATURN,
    swisseph.SE_URANUS,
    swisseph.SE_NEPTUNE,
    swisseph.SE_PLUTO,
    swisseph.SE_TRUE_NODE,
    swisseph.SE_CHIRON
];

swisseph.swe_set_ephe_path('https://cdn.jsdelivr.net/npm/swisseph@2.10.8-1/dist/ephe/');

self.onmessage = function(e) {
    const { id, date, time, isUnknown } = e.data;
    if (!date) return;

    const [year, month, day] = date.split('-').map(Number);
    const [hour, min] = time.split(':').map(Number);
    const ut = (isUnknown ? 12 : hour) + (min / 60) - 9;
    
    swisseph.swe_julday(year, month, day, ut, swisseph.SE_GREG_CAL, (jd) => {
        const planetsData = [];
        let completed = 0;

        PLANETS.forEach((p, idx) => {
            swisseph.swe_calc_ut(jd, p, swisseph.SEFLG_SPEED, (res) => {
                planetsData[idx] = res.longitude;
                completed++;
                if (completed === PLANETS.length) {
                    self.postMessage({ id, planets: planetsData });
                }
            });
        });
    });
};
