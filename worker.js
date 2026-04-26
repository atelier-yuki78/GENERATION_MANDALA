// 安定性の高い cdnjs からスイス暦ライブラリを読み込みます
importScripts('https://cdnjs.cloudflare.com/ajax/libs/swisseph/2.10.8-1/swisseph.min.js');

const PLANETS = [
    swisseph.SE_SUN,       // 0: 太陽 (Q)
    swisseph.SE_MOON,      // 1: 月 (R)
    swisseph.SE_MERCURY,   // 2: 水星 (S)
    swisseph.SE_VENUS,     // 3: 金星 (T)
    swisseph.SE_MARS,      // 4: 火星 (U)
    swisseph.SE_JUPITER,   // 5: 木星 (V)
    swisseph.SE_SATURN,    // 6: 土星 (W)
    swisseph.SE_URANUS,    // 7: 天王星 (X)
    swisseph.SE_NEPTUNE,   // 8: 海王星 (Y)
    swisseph.SE_PLUTO,     // 9: 冥王星 (Z)
    swisseph.SE_TRUE_NODE, // 10: ドラゴンヘッド (k)
    swisseph.SE_CHIRON     // 11: キロン (q)
];

// 天文暦データ（高精度計算のためのファイル）の取得先を設定
swisseph.swe_set_ephe_path('https://cdnjs.cloudflare.com/ajax/libs/swisseph/2.10.8-1/ephe/');

self.onmessage = function(e) {
    const { id, date, time, isUnknown } = e.data;
    if (!date) return;

    // 日付と時刻の数値を整理
    const [year, month, day] = date.split('-').map(Number);
    const [hour, min] = time.split(':').map(Number);
    
    // 日本標準時(UTC+9)を考慮して世界時(UT)に変換
    const ut = (isUnknown ? 12 : hour) + (min / 60) - 9;
    
    // ユリウス日を計算して惑星位置を算出
    swisseph.swe_julday(year, month, day, ut, swisseph.SE_GREG_CAL, (jd) => {
        const planetsData = [];
        let completed = 0;

        PLANETS.forEach((p, idx) => {
            // 高精度フラグ（SEFLG_SPEED）を使用して計算
            swisseph.swe_calc_ut(jd, p, swisseph.SEFLG_SPEED, (res) => {
                if (res.error) {
                    console.error(`Error calculating planet ${p}:`, res.error);
                }
                
                planetsData[idx] = res.longitude; // 黄経を格納
                completed++;

                // すべての天体の計算が終わったらメイン画面に送る
                if (completed === PLANETS.length) {
                    self.postMessage({ id, planets: planetsData });
                }
            });
        });
    });
};
