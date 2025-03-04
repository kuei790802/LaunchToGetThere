// 模擬餐廳資料庫
const restaurants = [
    { name: "老王牛肉麵", style: "chinese", price: 120, distance: 2, menu: "牛肉麵, 小菜" },
    { name: "壽司郎", style: "japanese", price: 250, distance: 5, menu: "壽司, 味噌湯" },
    { name: "義大利小館", style: "western", price: 350, distance: 8, menu: "披薩, 義大利麵" },
];

// 儲存最近選擇
let recentChoices = JSON.parse(localStorage.getItem("recentChoices")) || [];

document.getElementById("randomLunch").addEventListener("click", () => {
    const price = document.getElementById("priceFilter").value;
    const style = document.getElementById("styleFilter").value;
    const distance = document.getElementById("distanceFilter").value;

    let filtered = restaurants.filter(r => {
        return (
            (price === "all" || (price === "low" && r.price <= 100) || 
             (price === "mid" && r.price <= 300) || (price === "high" && r.price > 300)) &&
            (style === "all" || r.style === style) &&
            (distance === "all" || (distance === "near" && r.distance <= 1) || 
             (distance === "medium" && r.distance <= 5) || (distance === "far" && r.distance <= 10))
        );
    });

    if (filtered.length === 0) {
        alert("沒有符合條件的餐廳！");
        return;
    }

    const randomPick = filtered[Math.floor(Math.random() * filtered.length)];
    recentChoices.push(randomPick);
    localStorage.setItem("recentChoices", JSON.stringify(recentChoices));
    showResult(randomPick);
    updateRecentList();
});

// 顯示結果頁面
function showResult(restaurant) {
    document.body.innerHTML = `
        <div class="container mt-5">
            <h1>你的午餐推薦</h1>
            <div class="card mt-4">
                <div class="card-body">
                    <h3>${restaurant.name}</h3>
                    <p>風格: ${restaurant.style}</p>
                    <p>價格: $${restaurant.price}</p>
                    <p>距離: ${restaurant.distance} 公里</p>
                    <p>菜單: ${restaurant.menu}</p>
                    <button class="btn btn-secondary" onclick="location.reload()">換一個</button>
                    <button class="btn btn-success" onclick="saveFavorite('${restaurant.name}')">加入最愛</button>
                </div>
            </div>
        </div>
    `;
}

// 更新最近選擇列表
function updateRecentList() {
    const list = document.getElementById("recentList");
    list.innerHTML = "";
    recentChoices.slice(-3).forEach(r => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = `${r.name} - $${r.price}`;
        list.appendChild(li);
    });
}

// 儲存最愛
function saveFavorite(name) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.includes(name)) {
        favorites.push(name);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert(`${name} 已加入最愛！`);
    }
}

updateRecentList();