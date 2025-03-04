// 模擬餐廳資料（作為備用，若 API 失敗）
const fallbackRestaurants = [
    { name: "老王牛肉麵", style: "chinese", price: 120, lat: 25.0330, lon: 121.5654 },
    { name: "壽司郎", style: "japanese", price: 250, lat: 25.0400, lon: 121.5500 },
    { name: "義大利小館", style: "western", price: 350, lat: 25.0500, lon: 121.5300 },
];

let recentChoices = JSON.parse(localStorage.getItem("recentChoices")) || [];
let userPosition = null;
let restaurants = []; // 動態儲存從 API 獲取的餐廳

// Google Places API Key
const GOOGLE_API_KEY = "AIzaSyCCKvJMURlbJdx7R6uki8zjr1BE0R5wqMU";

// Haversine 公式計算兩點距離（單位：公里）
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半徑（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 獲取用戶位置並查詢附近餐廳
document.getElementById("showNearby").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userPosition = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                fetchNearbyRestaurants();
            },
            (error) => {
                alert("無法獲取位置，請允許定位權限或稍後重試！");
                console.error(error);
                // 若定位失敗，使用備用資料
                restaurants = fallbackRestaurants;
                showNearbyRestaurants();
            }
        );
    } else {
        alert("您的瀏覽器不支援定位功能！");
        // 若不支援定位，使用備用資料
        restaurants = fallbackRestaurants;
        showNearbyRestaurants();
    }
});

// 使用 Google Places API 查詢附近餐廳
function fetchNearbyRestaurants() {
    if (!userPosition) return;

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userPosition.lat},${userPosition.lon}&radius=5000&type=restaurant&key=${GOOGLE_API_KEY}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK" && data.results.length > 0) {
                // 處理 API 返回的餐廳資料
                restaurants = data.results.map(place => ({
                    name: place.name,
                    lat: place.geometry.location.lat,
                    lon: place.geometry.location.lng,
                    style: place.types.includes("cafe") ? "cafe" : "restaurant", // 簡單分類
                    price: place.price_level ? place.price_level * 100 : 200, // 假設價格（API 不一定提供）
                }));
            } else {
                alert("無法從 Google Places API 獲取餐廳資料，使用備用資料！");
                restaurants = fallbackRestaurants;
            }
            showNearbyRestaurants();
        })
        .catch(error => {
            console.error("Google Places API 錯誤:", error);
            alert("無法連接到 Google Places API，使用備用資料！");
            restaurants = fallbackRestaurants;
            showNearbyRestaurants();
        });
}

// 顯示附近餐廳（按距離排序）
function showNearbyRestaurants() {
    if (!userPosition || restaurants.length === 0) return;

    // 計算每個餐廳與用戶的距離
    const restaurantsWithDistance = restaurants.map(restaurant => {
        const distance = getDistance(
            userPosition.lat, userPosition.lon,
            restaurant.lat, restaurant.lon
        );
        return { ...restaurant, distance };
    });

    // 按距離排序
    restaurantsWithDistance.sort((a, b) => a.distance - b.distance);

    // 顯示列表
    const listDiv = document.getElementById("restaurantList");
    listDiv.innerHTML = "<h3>附近餐廳（由近到遠）</h3>";
    const ul = document.createElement("ul");
    ul.className = "list-group";
    
    restaurantsWithDistance.forEach(r => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `${r.name} - ${r.style} - $${r.price || "未知"} - 距離: ${r.distance.toFixed(2)} 公里
            <button class="btn btn-sm btn-success ms-2" onclick="saveFavorite('${r.name}')">加入最愛</button>`;
        ul.appendChild(li);
    });
    listDiv.appendChild(ul);
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

updateRecentList();