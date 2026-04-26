// worker.js
importScripts('https://unpkg.com/swisseph@2.10.8-1/dist/swisseph.min.js');

const PLANETS = [
    swisseph.SE_SUN,       // 0: Q
    swisseph.SE_MOON,      // 1: R
    swisseph.SE_MERCURY,   // 2: S
    swisseph.SE_VENUS,     // 3: T
    swisseph.SE_MARS,      // 4: U
    swisseph.SE_JUPITER,   // 5: V
    swisseph.SE_SATURN,    // 6: W
    swisseph.SE_URANUS,    // 7: X
    swisseph.SE_NEPTUNE,   // 8: Y
    swisseph.SE_PLUTO,     // 9: Z
    swisseph.SE_TRUE_NODE, // 10: k (ドラゴンヘッド)
    swisseph.SE_CHIRON     // 11: q (キロン)
];

// 天文暦データの取得先を外部サーバーに設定
// これにより、計算時に必要な .se1 ファイルが自動的にロードされます
swisseph.swe_set_ephe_path('https://unpkg.com/swisseph@2.10.8-1/ephe/');

self.onmessage = function(e) {
    const { id, date, time, isUnknown } = e.data;
    if (!date) return;

    const [year, month, day] = date.split('-').map(Number);
    const [hour, min] = time.split(':').map(Number);
    
    // 日本標準時(UTC+9)を考慮した調整
    const ut = (isUnknown ? 12 : hour) + (min / 60) - 9;
    
    swisseph.swe_julday(year, month, day, ut, swisseph.SE_GREG_CAL, (jd) => {
        const planetsData = [];
        let completed = 0;

        PLANETS.forEach((p, idx) => {
            // SEFLG_SPEED フラグで高精度計算を指定
            swisseph.swe_calc_ut(jd, p, swisseph.SEFLG_SPEED, (res) => {
                if (res.error) {
                    console.error(`Error calculating planet ${p}:`, res.error);
                }
                
                planetsData[idx] = res.longitude;
                completed++;

                if (completed === PLANETS.length) {
                    self.postMessage({ id, planets: planetsData });
                }
            });
        });
    });
};
