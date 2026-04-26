self.onmessage = function(e) {
    const { id } = e.data;
    // テスト用のダミー天体データ（10度、50度...に記号が出るはず）
    const testPlanets = [10, 50, 90, 120, 150, 180, 210, 240, 270, 300, 330, 350];

    self.postMessage({
        id: id,
        planets: testPlanets
    });
};
