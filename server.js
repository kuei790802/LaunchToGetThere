const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

// 模擬資料庫
let restaurants = [
    { id: 1, name: "老王牛肉麵", style: "chinese", price: 120, distance: 2 },
    { id: 2, name: "壽司郎", style: "japanese", price: 250, distance: 5 },
    { id: 3, name: "義大利小館", style: "western", price: 350, distance: 8 },
];

// 隨機推薦 API
app.get("/api/random-lunch", (req, res) => {
    const { price, style, distance } = req.query;
    let filtered = restaurants.filter(r => {
        return (
            (!price || r.price <= parseInt(price)) &&
            (!style || r.style === style) &&
            (!distance || r.distance <= parseInt(distance))
        );
    });
    const randomPick = filtered[Math.floor(Math.random() * filtered.length)];
    res.json(randomPick || { error: "無符合條件的餐廳" });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});