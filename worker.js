// worker.js
importScripts('https://cdn.jsdelivr.net/npm/swisseph@1.0.12/dist/swisseph.min.js');

const CACHE = new Map();

self.onmessage = function(e) {
    const { id, date, time, isUnknown } = e.data;
    const cacheKey = `${date}-${time}-${isUnknown}`;

    if (CACHE.has(cacheKey)) {
        self.postMessage({ id, planets: CACHE.get(cacheKey) });
        return;
    }

    if (!date) return;

    try {
        const [y, m, d] = date.split('-').map(Number);
        const [hh, mm] = (isUnknown ? "12:00" : time).split(':').map(Number);
        
        // ユリウス日計算 (日本時間 JST-9)
        const julianDay = swisseph.swe_julday(y, m, d, hh + mm/60 - 9, swisseph.SE_GREG_CAL); 
        
        const bodies = [
            swisseph.SE_SUN, swisseph.SE_MOON, swisseph.SE_MERCURY, swisseph.SE_VENUS, 
            swisseph.SE_MARS, swisseph.SE_JUPITER, swisseph.SE_SATURN, swisseph.SE_URANUS, 
            swisseph.SE_NEPTUNE, swisseph.SE_PLUTO, swisseph.SE_CHIRON, swisseph.SE_TRUE_NODE
        ];

        const planets = bodies.map(b => {
            const res = swisseph.swe_calc_ut(julianDay, b, swisseph.SEFLG_SPEED);
            return res.longitude;
        });

        CACHE.set(cacheKey, planets);
        self.postMessage({ id, planets });
    } catch (err) {
        console.error("Worker Calculation Error:", err);
    }
};