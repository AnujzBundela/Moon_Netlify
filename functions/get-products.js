const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const data = fs.readFileSync(path.resolve(__dirname, "../data/products.json"));
  const products = JSON.parse(data);

  // Optional: filter by category via query params
  const category = event.queryStringParameters?.category;
  const filtered = category
    ? products.filter(p => p.category === category)
    : products;

  return {
    statusCode: 200,
    body: JSON.stringify(filtered),
  };
};
