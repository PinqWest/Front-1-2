const express = require("express");
const path = require("path");

const app = express();

// Разрешить запросы с Live Server (другой порт) и при открытии с Express
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80";

let nextId = 3;
const products = [
  {
    id: 1,
    name: "Кроссовки Street Runner",
    cost: 6990,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    description:
      "Лёгкие городские кроссовки с амортизирующей подошвой и дышащим верхом.",
  },
  {
    id: 2,
    name: "Рюкзак Urban",
    cost: 2490,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    description: "Вместительный рюкзак для учёбы и коротких поездок.",
  },
];

function normalizeImage(url) {
  if (typeof url !== "string" || url.trim() === "") return DEFAULT_IMAGE;
  return url.trim();
}

function findIndexById(id) {
  return products.findIndex((p) => p.id === id);
}

// GET /api/products — все товары
app.get("/api/products", (_req, res) => {
  res.json(products);
});

// GET /api/products/:id — товар по id
app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Некорректный id" });
  }
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: "Товар не найден" });
  }
  res.json(product);
});

// POST /api/products — { name, cost, image?, description? }
app.post("/api/products", (req, res) => {
  const { name, cost, image, description } = req.body;
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Поле «название» (name) обязательно" });
  }
  const price = Number(cost);
  if (Number.isNaN(price) || price < 0) {
    return res.status(400).json({ error: "Поле «стоимость» (cost) — неотрицательное число" });
  }
  if (image !== undefined && image !== null && typeof image !== "string") {
    return res.status(400).json({ error: "Поле image — строка (URL картинки)" });
  }
  if (description !== undefined && description !== null && typeof description !== "string") {
    return res.status(400).json({ error: "Поле description — строка" });
  }
  const product = {
    id: nextId++,
    name: name.trim(),
    cost: price,
    image: normalizeImage(image),
    description: typeof description === "string" ? description.trim() : "",
  };
  products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id — частичное обновление: name, cost, image, description
app.put("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Некорректный id" });
  }
  const index = findIndexById(id);
  if (index === -1) {
    return res.status(404).json({ error: "Товар не найден" });
  }
  const { name, cost, image, description } = req.body;
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Поле name должно быть непустой строкой" });
    }
    products[index].name = name.trim();
  }
  if (cost !== undefined) {
    const price = Number(cost);
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({ error: "Поле cost — неотрицательное число" });
    }
    products[index].cost = price;
  }
  if (image !== undefined) {
    if (image !== null && typeof image !== "string") {
      return res.status(400).json({ error: "Поле image — строка (URL)" });
    }
    products[index].image = normalizeImage(image);
  }
  if (description !== undefined) {
    if (typeof description !== "string") {
      return res.status(400).json({ error: "Поле description — строка" });
    }
    products[index].description = description.trim();
  }
  res.json(products[index]);
});

// DELETE /api/products/:id — удаление товара
app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Некорректный id" });
  }
  const index = findIndexById(id);
  if (index === -1) {
    return res.status(404).json({ error: "Товар не найден" });
  }
  const [removed] = products.splice(index, 1);
  res.json(removed);
});

app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Статика и API: http://localhost:${PORT}/`);
  console.log(`Админка товаров: http://localhost:${PORT}/admin.html`);
  console.log(`JSON API: http://localhost:${PORT}/api/products`);
});
