const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbw9EST2nHGLZTFqqgKBHECM3zkdKEKS7uPZfbSqkXe7KnV4v5wjzrgCrBIMjU9ZDbBu_A/exec"; // Replace with your deployed Apps Script web app URL

let menu = [];
let currentIndex = 0;
let itemsPerPage = 30;
let loadedMenu = [];

document.addEventListener("DOMContentLoaded", function () {
  let menuContainer = document.getElementById("menu");
  let loading = document.getElementById("loading");

  function loadMoreItems() {
    if (currentIndex >= menu.length) {
      loading.style.display = "none";
      return;
    }

    loading.style.display = "block";

    setTimeout(() => {
      let newItems = menu.slice(currentIndex, currentIndex + itemsPerPage);
      loadedMenu = loadedMenu.concat(newItems);
      display(loadedMenu);
      currentIndex += itemsPerPage;
      loading.style.display = "none";
    }, 1000);
  }

  function handleScroll() {
    let menuRect = menuContainer.getBoundingClientRect();
    let windowHeight = window.innerHeight || document.documentElement.clientHeight;

    if (menuRect.bottom <= windowHeight + 50) {
      loadMoreItems();
    }
  }

  window.addEventListener("scroll", handleScroll);

  // Fetch data from Google Sheets API
  fetch(SHEET_API_URL)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      menu = data.map(item => ({
        Id: parseInt(item.Id),
        Title: item.Title,
        Category: item.Category,
        Img: item.Image,
      }));
      generateCategoryButtons();
      loadMoreItems();
    })
    .catch(err => {
      console.error("Failed to load products:", err);
    });
});

// Generate category buttons
function generateCategoryButtons() {
  let categories = menu.reduce(function (pre, value) {
    if (!pre.includes(value.Category)) {
      pre.push(value.Category);
    }
    return pre;
  }, []).map(function (value) {
    return `<button type="button" class="btn" onclick="filterData('${value}')">${value}</button>`;
  });

  document.getElementById('btn').innerHTML = `
    <button type="button" class="btn" onclick="sortDataS('Title','Asc')">A to Z</button>
    <button type="button" class="btn" onclick="sortDataS('Title','Desc')">Z to A</button>
    ${categories.join(' ')}
    <button type="button" class="btn" onclick="displayAll()">All</button>
  `;
}

// Display function
function display(menuItems) {
  let dis = menuItems.map(function (value, index) {
    return `
      <div class="col-xl-3 col-lg-4 col-md-6">
        <div class="wrap text-center">
          <div class="imageContainer">
            <img src="${value.Img}" alt="image">
          </div>
          <h4>${value.Title}</h4>
          <button 
            class="btn" 
            data-id="all" 
            data-title="${value.Title}" 
            onclick="AddtoCart(this)">
            Add to Cart
          </button>
        </div>
      </div>`;
  });

  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading';
  loadingDiv.textContent = 'Loading more products...';

  document.getElementById('menu').innerHTML = dis.join(' ');
  document.getElementById('menu').appendChild(loadingDiv);
}

function filterData(clickCategory) {
  let fD = menu.filter(value => value.Category === clickCategory);
  display(fD);
}

function displayAll() {
  display(menu);
}

function sortDataS(props, order) {
  menu.sort((a, b) => {
    if (order === 'Desc') {
      return a[props] > b[props] ? -1 : 1;
    } else {
      return a[props] > b[props] ? 1 : -1;
    }
  });
  display(menu);
}

function searchItem() {
  let SI = document.getElementById('searchItems').value.toLowerCase();
  let filteredData = menu.filter(value => value.Title.toLowerCase().includes(SI));
  display(filteredData);
}

document.getElementById('searchItems').addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchItem();
  }
});

// CART FUNCTIONS
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  document.getElementById('count').innerText = cart.length;
}

function AddtoCart(button) {
  const Title = button.getAttribute("data-title");
  const selectedProduct = menu.find(item => item.Title === Title);

  if (!selectedProduct) {
    console.error("Product not found for title:", Title);
    return;
  }

  let obj = cart.find(value => value.items.Id === selectedProduct.Id);

  if (!obj) {
    cart.push({ items: selectedProduct, quantity: 1 });
  } else {
    obj.quantity += 1;
  }

  saveCart();
  updateCartCount();
  mapCartItem();
}

function mapCartItem() {
  let cartItemsHTML = cart.map((value, index) => {
    return `
      <div id="productImage">
        <article class="menu-item">
          <img src="${value.items.Img}" alt="menu item" class="photo" />
          <div class="item-info">
            <header>
              <h4>${value.items.Title}</h4>
            </header>
            <div id="productQuantity">
              <button class="_23FHuj" onclick="decQty(${index})"> – </button>
              <input type="text" class="_253qQJ" value="${value.quantity}" readonly>
              <button class="_23FHuj" onclick="incQty(${index})"> + </button>
            </div>
          </div>
        </article>
      </div>`;
  }).join("");

  document.getElementById('totalAmount').innerHTML = cartItemsHTML;
  totalprice();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
  mapCartItem();
}

function incQty(index) {
  cart[index].quantity += 1;
  saveCart();
  updateCartCount();
  mapCartItem();
}

function decQty(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartCount();
  mapCartItem();
}

function totalprice() {
  let total = cart.reduce((sum, item) => sum + (item.items.price * item.quantity), 0);
  document.getElementById('amt').innerHTML = '<b>Total:</b> ' + total.toFixed(2);
}

window.onload = function () {
  mapCartItem();
  updateCartCount();
};



// const menu = [
//   {
//     id: 1,
//     title: "Fresh Chilled Coconut",
//     category: "Welcome Drink(Appetizers)",
//     price: 54,
//     img: "https://img.freepik.com/free-photo/vegan-dairy-free-drink_23-2151920756.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 2,
//     title: "Apple Juice",
//     category: "Welcome Drink(Appetizers)",
//     price: 66,
//     img: "https://img.freepik.com/free-photo/front-view-fresh-apple-juice-with-fresh-apples-dark-drink-photo-color-cocktail-fruit_140725-92838.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 3,
//     title: "Orange Juice",
//     category: "Welcome Drink(Appetizers)",
//     price: 44,
//     img: "https://img.freepik.com/free-photo/sliced-oranges-with-juice-glass-jar-cup_114579-11763.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 4,
//     title: "Sweet Lime Juice ",
//     category: "Welcome Drink(Appetizers)",
//     price: 155,
//     img: "https://img.freepik.com/free-photo/glasses-with-lemonade-table_23-2148482456.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 5,
//     title: "Pineapple Juice ",
//     category: "Welcome Drink(Appetizers)",
//     price: 15,
//     img: "https://img.freepik.com/free-photo/slices-pineapple-pineapple-juice-wooden-board_114579-56170.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 6,
//     title: "Pineapple Mosambi Juice ",
//     category: "Welcome Drink(Appetizers)",
//     price: 153,
//     img: "image/Pine-APPLE.webp",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 7,
//     title: "Black Grapes Juice ",
//     category: "Welcome Drink(Appetizers)",
//     price: 15,
//     img: "https://img.freepik.com/free-photo/side-view-black-grape-juice-glass-basket-grapes-with-grape-berries-gray-background_141793-27301.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 8,
//     title: "Black Grapes Pineapple Juice ",
//     category: "Welcome Drink(Appetizers)",
//     price: 13,
//     img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5x7INt5vDLF2Wf2_FNeG2aiiTeG4ufUwouj-qVNmsq5Rb_g2mLQH0ZfHWtiIbKtQyYKo&usqp=CAU",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 9,
//     title: "Cocktail Juice ",
//     category: "Welcome Drink(Appetizers)",
//     price: 18,
//     img: "https://img.freepik.com/free-photo/freshness-summer-fruits-rustic-wooden-table-healthy-snack-generated-by-artificial-intelligence_188544-110093.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 10,
//     title: "Water Melon Juice ",
//     category: "Welcome Drink(Appetizers)",
//     price: 13,
//     img: "https://img.freepik.com/free-photo/high-angle-watermelon-slices-juice_23-2148293842.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 11,
//     title: "Guava Juice ",
//     category: "Welcome Drink(Appetizers)",
//     price: 15,
//     img: "https://img.freepik.com/free-photo/homemade-ice-tea-flavoured-with-apple_140725-1797.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 12,
//     title: "Ganga Jamuna ",
//     category: "Welcome Drink(Appetizers)",
//     price: 156,
//     img: "https://img.freepik.com/free-photo/two-glass-cups-orange-juice-with-wooden-reamer_114579-53629.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 13,
//     title: "Cream of Tomato ",
//     category: "Soup",
//     price: 129,
//     img: "https://img.freepik.com/free-photo/warm-tomato-soup-serve-bowl_1150-42621.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 14,
//     title: "Cream if Veg. ",
//     category: "Soup",
//     price: 1,
//     img: "https://img.freepik.com/free-photo/top-view-tasty-meat-soup-with-fresh-vegetables-dark-table-photo-dish-food-color_140725-81730.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 15,
//     title: "Minestorone ",
//     category: "Soup",
//     price: 13,
//     img: "https://img.freepik.com/free-photo/front-view-delicious-soup-inside-plate-with-spoon-dark-desk_140725-38051.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 16,
//     title: "Sweet Corn ",
//     category: "Soup",
//     price: 15,
//     img: "https://img.freepik.com/free-photo/roasted-red-pepper-hummus-white-bowl-white-marble-background_123827-28767.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 17,
//     title: "Sweet Corn Veg. ",
//     category: "Soup",
//     price: 17,
//     img: "https://img.freepik.com/free-photo/chiken-soup-potato-spices-rice-side-view_140725-9103.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 18,
//     title: "Chili Bean ",
//     category: "Soup",
//     price: 19,
//     img: "https://img.freepik.com/free-photo/horizontal-view-tomato-soup-beans-garlic-wooden-cutting-board-spoon-mix-color-table_140725-86854.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 19,
//     title: "Palak Corn ",
//     category: "Soup",
//     price: 144,
//     img: "https://www.spiceupthecurry.com/wp-content/uploads/2016/06/corn-palak-curry-recipe-12.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 20,
//     title: "Green Peas ",
//     category: "Soup",
//     price: 133,
//     img: "https://img.freepik.com/free-photo/green-pea-soup-wooden-bowl_123827-21618.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 21,
//     title: "Hot-N-Sour ",
//     category: "Soup",
//     price: 155,
//     img: "https://img.freepik.com/free-photo/ukrainian-russian-national-red-soup-borsch-closeup_2829-13741.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 22,
//     title: "Tomato Corn Cheese ",
//     category: "Soup",
//     price: 122,
//     img: "https://healthyfitnessmeals.com/wp-content/uploads/2020/10/MEXICAN-CHARRED-SWEETCORN-SOUP_-7.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 23,
//     title: "Almond ",
//     category: "Soup",
//     price: 19,
//     img: "https://img.freepik.com/free-photo/dry-fruits-topping-oatmeal-bowl-placemat_23-2147872680.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 24,
//     title: "Brocoli Almond ",
//     category: "Soup",
//     price: 159,
//     img: "https://stemandspoon.com/wp-content/uploads/2023/03/broccoli-almond-soup-featured-720x720.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
 
//   {
//     id: 25,
//     title: "Mutter Samosa ",
//     category: "Starters ",
//     price: 144,
//     img: "https://img.freepik.com/free-photo/stuffed-samosas-beef-tacos-homemade-guacamole-generated-by-ai_188544-37402.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 26,
//     title: "Mutter Corm Samosa ",
//     category: "Starters ",
//     price: 19,
//     img: "https://cookingfromheart.com/wp-content/uploads/2018/08/Aloo-Samosa-6.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 27,
//     title: "Corn Paneer Samosa ",
//     category: "Starters ",
//     price: 13,
//     img: "https://i0.wp.com/www.sinamontales.com/dotcord/uploads/2015/11/corn-and-paneer-samosa-recipe.1024x1024.jpg?resize=1000%2C665&ssl=1",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 28,
//     title: "Mix Veg. Samosa ",
//     category: "Starters ",
//     price: 188,
//     img: "https://img1.exportersindia.com/product_images/bc-full/dir_90/2696270/mix-veg-samosa-1478507982-2534126.jpeg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 29,
//     title: "Cheese Paneer Samosa ",
//     category: "Starters ",
//     price: 133,
//     img: "https://images.squarespace-cdn.com/content/5ea3b22556f3d073f3d9cae4/1639765720513-GWUONGJA746IE3P2JAQC/Screen+Shot+2021-12-17+at+3.43.02+AM.png?format=1500w&content-type=image%2Fpng",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
 
//   {
//     id: 30,
//     title: "Cheese Ball ",
//     category: "Starters ",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/delicious-food-croquettes-close-up_23-2149202667.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 31,
//     title: "Veg. Balls ",
//     category: "Starters ",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/meatballs-green-peas-carrot-with-tomato-sauce-wooden-table_123827-31479.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 32,
//     title: "Petha Kaju Badam Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://www.shutterstock.com/image-photo/almond-halva-badam-halwa-highly-260nw-2171130871.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 33,
//     title: "Moong Dal halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/close-up-spicy-indian-food-dish_23-2148295015.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 34,
//     title: "Dry Fruit Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/traditional-azerbaijan-indian-turkish-sweet-dessert-halvah-with-nuts-top_114579-1311.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 35,
//     title: "Dudhi Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://www.nehascookbook.com/wp-content/uploads/2020/11/Pressure-cooker-dudhi-halwa-WS-500x500.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 36,
//     title: "Gajar Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://i0.wp.com/kalimirchbysmita.com/wp-content/uploads/2016/01/Gajar-ka-Halwa-03-1024x683.jpg?resize=1024%2C683",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 37,
//     title: "Kaju Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Sooji_Halwa.JPG/800px-Sooji_Halwa.JPG?20160710115419",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 38,
//     title: "Kaju Akrot Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://zeroguiltbyarchana.com/wp-content/uploads/2021/03/Akhrot-Halwa-scaled.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 39,
//     title: "Badam Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://kiipfit.com/wp-content/uploads/2024/09/badam-halwa-4.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 40,
//     title: "Pista Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://naturallynidhi.com/wp-content/uploads/2021/04/Quick-Atta-Badam-Halwa-Wheat-Almond-Halwa-Cover.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 41,
//     title: "Fresh Coconut Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://www.blendwithspices.com/wp-content/uploads/2023/03/coconut-halwa-recipe.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 42,
//     title: "Anjeer Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://images.news18.com/webstories/uploads/2024/10/anjeer-ka-halwa-fig-sheera-halva_466689-82442-2024-10-8a0ca695aeddcfd613b27a1edc092763.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 43,
//     title: "Rajwadi Halwa ",
//     category: "Sweet",
//     price: 15.99,
//     img: "https://img-global.cpcdn.com/recipes/530c2341818b5bdc/680x964cq70/%E0%A4%A6%E0%A4%A8%E0%A4%A6%E0%A4%B0-%E0%A4%AE%E0%A4%B0%E0%A4%B5%E0%A4%A1-%E0%A4%9A%E0%A4%B0%E0%A4%AE-danedaar-marwadi-churma-recipe-in-hindi-%E0%A4%B0%E0%A4%B8%E0%A4%AA-%E0%A4%AE%E0%A4%96%E0%A4%AF-%E0%A4%A4%E0%A4%B8%E0%A4%B5%E0%A4%B0.webp",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 44,
//     title: "Patties ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/triangled-shape-bourekas-baked-pie-with-sesame-seeds_140725-10794.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 45,
//     title: "Lilva Kachori ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/boiled-eggs-stir-fried-with-tamarind-sauce_1150-22276.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 46,
//     title: "Punjabi Samosa ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/high-angle-plate-with-pakistani-food_23-2148825158.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 47,
//     title: "Mutter Samosa ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/stuffed-samosas-beef-tacos-homemade-guacamole-generated-by-ai_188544-37402.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_country_boost&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 48,
//     title: "Paneer Samosa ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://images.squarespace-cdn.com/content/5ea3b22556f3d073f3d9cae4/1639765720513-GWUONGJA746IE3P2JAQC/Screen+Shot+2021-12-17+at+3.43.02+AM.png?format=1500w&content-type=image%2Fpng",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 49,
//     title: "Patra Samosa ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://4.bp.blogspot.com/-Skrr8QTzFuk/UXH6mReFONI/AAAAAAAAIZo/Leh6Vsyu6d0/s1600/IMG_6857.JPG",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 50,
//     title: "Chinese Samosa ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/deep-fried-samosas-dumplings-gourmet-appetizer-generated-by-ai_188544-13491.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 51,
//     title: "Mutter Ghughara ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/view-delicious-food-dish_23-2150777845.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 52,
//     title: "Tuver Ghughara ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/pumpkin-empanadillas-halloween-thanksgivings-day-wooden-table_123827-33801.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 53,
//     title: "Aloo Ghughara ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/view-delicious-food-dish_23-2150777843.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 54,
//     title: "Paneer Corn Ghughara ",
//     category: "Farshan",
//     price: 15.99,
//     img: "image/Paneer_Corn_Ghugara_Image.png",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 55,
//     title: "Veg. Cutlets ",
//     category: "Farshan",
//     price: 15.99,
//     img: "https://www.whiskaffair.com/wp-content/uploads/2020/09/Veg-Cutlet-2-3.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },

//   {
//     id: 56,
//     title: "Rajasthani Aloo",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/side-view-vegetable-ragout-with-potato-carrot-cauliflower-basil_141793-5151.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 57,
//     title: "Kashmiri Aloo ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/side-view-fried-eggplants-potatoes-with-chili-sauce-plate_141793-2640.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 58,
//     title: "Jodhpuri Aloo ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/top-view-chicken-soup-with-ingredients_140725-149720.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 59,
//     title: "Aloo Capsicum ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/meat-stew-plate-with-potatoes-pepper-herbs-onion-pomegranate_176474-6839.jpg?t=st=1744272069~exp=1744275669~hmac=b3ef856483611adc25214c4f5295c81bfcb882ef74e1a8350156f9289fc14972&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 60,
//     title: "Aloo Suki Bhaji ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/french-fries-potato-wedges_2829-11286.jpg?t=st=1744272149~exp=1744275749~hmac=af7b77103b359c2bebaf456829c730d4e979fe4738d42c28b7d12e4174a18340&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 61,
//     title: "Aloo Sukji Bhaji with Dry Fruits ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://hindi.dheivegam.com/wp-content/uploads/2023/06/Aloo-Mungfali-Sabji-Recipe-in-Hindi.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 62,
//     title: "Aloo Kaju ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "image/aloo_Kaju_Sabji.png",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 63,
//     title: "Aloo Chips ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://i.ytimg.com/vi/_O8FFw6Kwb0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBDs8hHjrEuNNVNW1UM7Eu4ss7TxQ",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 64,
//     title: "Aloo Chips with Dry Fruits ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://static.vecteezy.com/system/resources/previews/030/762/277/non_2x/mixed-dried-fruit-and-vegetable-chips-in-a-round-ceramic-plate-healthy-eating-photo.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 65,
//     title: "Gobi Mutter ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://akm-img-a-in.tosshub.com/aajtak/images/story/202212/gobhi_matar-sixteen_nine.jpg?size=948:533",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 66,
//     title: "Beigan Masala ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://myannoyingopinions.com/wp-content/uploads/2022/10/baingan-masala-with-mustard-small.jpg?w=584",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 67,
//     title: "Bharva Baigan ",
//     category: "Seasonal Vegetables",
//     price: 15.99,
//     img: "https://i.pinimg.com/736x/11/a0/7a/11a07a7f1cd31fa1476581b9dfee17fd.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 68,
//     title: "Chhole",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/bowl-filled-with-beans_23-2148746870.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 69,
//     title: "Chhole with Paneer ",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/bowl-filled-with-beans-top-view_23-2148746862.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 70,
//     title: "Rajma ",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/vertical-view-tomato-soup-brown-cutting-board-beans-mixed-color-table_140725-92025.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 71,
//     title: "Maath Usal ",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://holycowvegan.net/wp-content/uploads/2024/06/usal-sprouts-curry-2.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 72,
//     title: "Moong Usal",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0p8nVe8f0lf2UFVxUaVwQkWYi8aCMcta46fjCcZYn3FncnsPkGOypHlsZ_WkydGT2d0Y&usqp=CAU",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 73,
//     title: "Masoor Usal ",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/lentil-soup-with-vegetables-bowl-wooden-table_123827-30486.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 74,
//     title: "Green Peas Usal ",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://nikfoodamour.wordpress.com/wp-content/uploads/2019/02/snapseed-14.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 75,
//     title: "White Peas Usal ",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/high-angle-chickpeas-soup-concept_23-2148648570.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 76,
//     title: "Mix Usal ",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://india.neelamfoodland.in/cdn/shop/products/USAL_20MISAL_20MIX_2a6f8132-82ea-45e1-abb1-e6ee7b6af579_800x.jpg?v=1734379064",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 77,
//     title: "Chauli Usal ",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://www.archanaskitchen.com/images/archanaskitchen/1-Author/sibyl_sunitha/Maharashtrian_Chavali_Chi_Usal_Recipe_Black_eyed_peas_Curry_Recipe.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 78,
//     title: "Vaal Usal ",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://rustictadka.com/wp-content/uploads/2024/09/2-valache-birde-dalimbi-usal-Maharashtrian-traditional-curry-recipe-field-beans-vegan-vegetarian-keto-lunch-dinner-snacks-breakfast-easy-quick-simple-sprouts-rustic-tadka-viral.png",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 79,
//     title: "Deshi Vaal ",
//     category: "Khthol/Usal/Pulses",
//     price: 15.99,
//     img: "https://i.ytimg.com/vi/6YDcU4PoW5Y/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCqxT_Y_CYXKpz0NvBtO9cTrch-0Qv",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 80,
//     title: "Dal/Kadhi ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/lentil-soup-lemon-sumakh-top-view_140725-11284.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 81,
//     title: "Arhar Dal ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/top-view-delicious-lentil-soup-with-female-holding-plate-dark-bread-loafs-dark-surface_179666-35086.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 82,
//     title: "Arhar Dal with mango ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://assets.telegraphindia.com/telegraph/2022/Jun/1654151892_whatsapp-image-2022-06-02-at-12-00-34-pm.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 83,
//     title: "Chana Dal ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/bowl-filled-with-beans-top-view_23-2148746862.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 84,
//     title: "Gujarati Dal ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/top-close-up-view-lentil-soup-appetizing-lentil-soup-tomatoes-spices-lentil-herbs_140725-73527.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 85,
//     title: "Panchmel Dal ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/concept-tasty-food-sweet-potato-puree-top-view_185193-109283.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 86,
//     title: "Dal Fry ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/traditional-indian-soup-lentils-indian-dhal-spicy-curry-bowl-spices-herbs-rustic-black-wooden-table_2829-18717.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 87,
//     title: "Yellow Dal Tadka ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "http://img.freepik.com/free-photo/half-top-view-delicious-vegetable-soup-inside-round-plate-dark-desk_140725-49474.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 88,
//     title: "Lachko Dal ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/bowl-lentil-soup-black-wooden-table_140725-10682.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 89,
//     title: "Osaman ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/top-view-lentils-soup-inside-plates-light-surface-color-seed-plant-soup-food-dish_140725-108944.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 90,
//     title: "Dal Dhokli ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://i0.wp.com/binjalsvegkitchen.com/wp-content/uploads/2019/01/H1.jpg?fit=600%2C904&ssl=1",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 91,
//     title: "Dal Makhani ",
//     category: "Dal/Kadhi/Rice/Raita",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/top-view-delicious-food-table_23-2150857716.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 92,
//     title: "Papads",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/delicious-composition-nutritious-roti_23-2149034043.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 93,
//     title: "Fry Papad ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://dww3ueizok6z0.cloudfront.net/food/banner/9303-c71b112c332d7a28cdd57dfb206b19f57fe99e6f",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 94,
//     title: "Roasted Papad ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/tortilla-near-organic-sauce-chili-peppers_23-2148254377.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 95,
//     title: "Masala Papad ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/top-view-baked-bread-tasty-hot-brown-wooden-desk_140725-22323.jpg?t=st=1744346173~exp=1744349773~hmac=7d42292969fae3265f27968962be49feef932253d928a2386b8610681db16a5a&w=996",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 96,
//     title: "Khicha Papad ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://5.imimg.com/data5/SELLER/Default/2023/6/317813351/RO/JM/BI/156918706/jeera-rice-khichiya-papad-500x500.jpeg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 97,
//     title: "Papadi ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://5.imimg.com/data5/SELLER/Default/2020/12/ZV/SJ/SU/100261295/papadi-gathiya.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 98,
//     title: "Pickles ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/fresh-vegetable-dip-with-spicy-chili-pepper-seasoning-generated-by-ai_188544-43158.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 99,
//     title: "Mango Spicy ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/01/mango-pickle-recipe-500x375.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 100,
//     title: "Mango Sweet ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://www.yummytummyaarthi.com/wp-content/uploads/2014/06/first.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 101,
//     title: "Lemon Spicy ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://i0.wp.com/veenapatwardhan.com/pat-a-cake/wp-content/uploads/2024/05/Sweet-and-Spicy-Lime-Pickle.png?resize=500%2C400&ssl=1",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 102,
//     title: "Lemon Sweet ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://www.awesomecuisine.com/wp-content/uploads/2015/03/Sweet-Lime-Pickle.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 103,
//     title: "Mix Veg. ",
//     category: "Papad/Pickle",
//     price: 15.99,
//     img: "https://tiimg.tistatic.com/fp/1/007/098/mixed-spicy-vegetable-pickle-978.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 104,
//     title: "Salad",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/greek-salad-with-fresh-tomato-cucumber-red-onion-basil-feta-cheese-black-olives-italian-herbs_2829-4479.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 105,
//     title: "Green Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/close-up-view-delicious-vegan-salad-with-fresh-ingredients-plate_179666-47139.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 106,
//     title: "Macroni Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/roasted-chicken-legs-pasta-wood-piece_114579-72403.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 107,
//     title: "Pasta Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/rotini-pasta-salad-with-arugula-cherry-tomatoes-healthy-summer-dish_53876-103649.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 108,
//     title: "Mexican Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/top-view-appetizing-pozole-bowl_23-2149248632.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 109,
//     title: "Sprouted Beans Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://data.thefeedfeed.com/static/2020/03/26/15852537945e7d0da226d64.webp",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 110,
//     title: "Corn Apple Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://cdn.vegetariantimes.com/wp-content/uploads/2009/02/sweet-potato-salad-with-apple-and-avocado-feb-2009-crop.jpg?crop=1:1&width=1000",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 111,
//     title: "Potato Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://img.freepik.com/premium-photo/warm-potato-salad-with-bacon-onion-fresh-herbs-vinegar-dressing-bowl-german-kartoffelsalat_114420-3806.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 112,
//     title: "Corn Chana Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://pulses.org/nap/wp-content/uploads/2015/12/Charred-Chickpea-and-Corn-Salad.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 113,
//     title: "Aloo Chana Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://i.pinimg.com/736x/95/e5/ac/95e5ac7a05b994579369eb246d6b77c8.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 114,
//     title: "Tossed Green Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://img.freepik.com/free-photo/front-view-delicious-vegetable-salad-with-various-ingredients-dark-background_179666-47169.jpg?uid=R168699936&ga=GA1.1.1928394102.1727939130&semt=ais_hybrid&w=740",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
//   {
//     id: 115,
//     title: "Hawaiian Salad ",
//     category: "Salads/Sp.Salads/Chutney",
//     price: 15.99,
//     img: "https://www.indianveggiedelight.com/wp-content/uploads/2021/05/Sprouted-moong-salad-featured.jpg",
//     desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
//   },
 
// ];



// document.addEventListener("DOMContentLoaded", function () {
//   let menuContainer = document.getElementById("menu");
//   let loading = document.getElementById("loading");
//   let itemsPerPage = 30; // Number of items to load at a time
//   let currentIndex = 0; // Tracks the index of loaded items
//   let loadedMenu = []; // Stores loaded items for correct filtering & sorting

//   function loadMoreItems() {
//       if (currentIndex >= menu.length) {
//           loading.style.display = "none"; // Hide loading message when no more items
//           return;
//       }

//       loading.style.display = "block"; // Show loading message
      
//       setTimeout(() => { // Simulate network delay
//           let newItems = menu.slice(currentIndex, currentIndex + itemsPerPage);
//           loadedMenu = loadedMenu.concat(newItems); // Keep track of loaded items
          
//           display(loadedMenu); // Use original display function
//           currentIndex += itemsPerPage; // Update index
          
//           loading.style.display = "none"; // Hide loading message
//       }, 1000);
//   }

//   function handleScroll() {
//       let menuRect = menuContainer.getBoundingClientRect();
//       let windowHeight = window.innerHeight || document.documentElement.clientHeight;

//       // Load more items only when the user scrolls near the end of `#menu`
//       if (menuRect.bottom <= windowHeight + 50) {
//           loadMoreItems();
//       }
//   }

//   window.addEventListener("scroll", handleScroll);

//   // Initial load
//   loadMoreItems();
// });



// // ✅ Keeps your original function for search, filter, and sorting
// /* <strong>$${value.price}</strong>  */
// /* <button class="btn" data-id="all" onclick="AddtoCart(${index})">Add to Cart</button> */

// function display(menuItems) {
//   let dis = menuItems.map(function (value, index) {
//     return `
//       <div class="col-xl-3 col-lg-4 col-md-6">
//         <div class="wrap text-center">
//           <div class="imageContainer">
//             <img src="${value.img}" alt="image">
//           </div>
//           <h4>${value.title}</h4>
//           <button 
//             class="btn" 
//             data-id="all" 
//             data-title="${value.title}" 
//             onclick="AddtoCart(this)">
//             Add to Cart
//           </button>
//         </div>
//       </div>`;
//   });

//   const loadingDiv = document.createElement('div');
//   loadingDiv.id = 'loading';
//   loadingDiv.textContent = 'Loading more products...';

//   document.getElementById('menu').innerHTML = dis.join(' ');
//   document.getElementById('menu').appendChild(loadingDiv);
// }



// // DISPLAY BUTTON 
// let categories = menu.reduce(function(pre,value)
// {
//   if(pre.includes(value.category) == false)
//   {
//     pre.push(value.category);
//   }
//   return pre;
// },[]).map(function (value) {
//   return ` <button type="button" class="btn" data-id="all" onclick="filterData('${value}')">${value}</button>`
// })
// {/* <button type="button" class="btn" data-id="all" onclick="sortDataN('price','Desc')">High to Low</button>
// <button type="button" class="btn" data-id="all" onclick="sortDataN('price','Asc')">Low to High</button> */}
// document.getElementById('btn').innerHTML = `  
// <button type="button" class="btn" data-id="all" onclick="sortDataS('title','Asc')">A to Z</button>
// <button type="button" class="btn" data-id="all" onclick="sortDataS('title','Desc')">Z to A</button>` + categories.join(' ') + `<button type="button" class="btn" data-id="all" onclick="displayAll()">All</button>
// `

// // SEARCH FUNCTION 
// function searchItem() {
//   let SI = document.getElementById('searchItems').value.toLowerCase();
//   let filteredData = menu.filter(function (value) {
//       return value.title.toLowerCase().includes(SI);
//   });

//   display(filteredData);
// }

// // Prevent form submission on pressing Enter
// document.getElementById('searchItems').addEventListener("keydown", function (event) {
//   if (event.key === "Enter") {
//       event.preventDefault(); // Stop page refresh
//       searchItem(); // Call the search function
//   }
// });


// function filterData(clickCategory) {
//   let fD = menu.filter(function (value, index) {
//     return value.category == clickCategory // || clickCategory == "All"
//   });

//   display(fD);
// }

// function displayAll() {
//   display(menu);
// }


// function sortDataS(props, order) {
//   menu.sort(function (a, b) {
//     if (order == 'Desc') {
//       if (a[props] > b[props]) {
//         return -1;
//       }
//       else {
//         return 1;
//       }
//     }
//     else {
//       if (a[props] > b[props]) {
//         return 1;
//       }
//       else {
//         return -1;
//       }
//     }
//   })
//   display(menu);

// }

// // Sorting Methods 
// // function sortDataN(props, order) {
// //   menu.sort(function (a, b) {
// //     if (order == 'Desc') {
// //       return b[props] - a[props];
// //     }
// //     else {
// //       return a[props] - b[props];
// //     }
// //   })
// //   display(menu);

// // }

// // Load cart from local storage or initialize it
// let cart = JSON.parse(localStorage.getItem("cart")) || [];

// // Function to save cart to local storage
// function saveCart() {
//     localStorage.setItem("cart", JSON.stringify(cart));
// }

// // Function to update cart count
// function updateCartCount() {
//     document.getElementById('count').innerText = cart.length;  // Update the cart count badge
// }

// // Add to Cart function
// function AddtoCart(button) {
//   const title = button.getAttribute("data-title");
//   const selectedProduct = menu.find(item => item.title === title);

//   if (!selectedProduct) {
//     console.error("Product not found for title:", title);
//     return;
//   }

//   let obj = cart.find(value => value.items.id === selectedProduct.id);

//   if (!obj) {
//     cart.push({ items: selectedProduct, quantity: 1 });
//   } else {
//     obj.quantity += 1;
//   }

//   saveCart();
//   updateCartCount();
//   mapCartItem();
// }

// // Function to map cart items to UI
// function mapCartItem() {
//     let cartItemsHTML = cart.map((value, index) => {
//         return `
//         <div id="productImage">
//             <article class="menu-item">
//                 <img src="${value.items.img}" alt="menu item" class="photo" />
//                 <div class="item-info">
//                     <header>
//                         <h4>${value.items.title}</h4>
//                         <h4 class="price">${value.items.price}</h4>
//                     </header>
//                     <div id="productQuantity">
//                         <button class="_23FHuj" onclick="decQty(${index})"> – </button>
//                         <input type="text" class="_253qQJ" value="${value.quantity}" id="inp" readonly>
//                         <button class="_23FHuj" onclick="incQty(${index})"> + </button>
//                     </div>
//                 </div>
//             </article>
//         </div>`;
//     }).join("");

//     document.getElementById('totalAmount').innerHTML = cartItemsHTML;

//     totalprice(); // Update total price
// }



// // Function to clear the cart
// function clearCart() {
//   cart = []; // Empty the cart array
//   saveCart(); // Update local storage
//   updateCartCount(); // Reset cart count display
//   mapCartItem(); // Refresh the UI
// }


// // Increment quantity
// function incQty(index) {
//     cart[index].quantity += 1;
//     saveCart(); // Save updated cart
//     updateCartCount(); // Update cart count
//     mapCartItem();
// }

// // Decrement quantity
// function decQty(index) {
//     if (cart[index].quantity > 1) {
//         cart[index].quantity -= 1;
//     } else {
//         cart.splice(index, 1); // Remove item if quantity is 0
//     }
//     saveCart(); // Save updated cart
//     updateCartCount(); // Update cart count
//     mapCartItem();
// }

// // Calculate total price
// function totalprice() {
//     let total = cart.reduce((sum, item) => sum + (item.items.price * item.quantity), 0);
//     document.getElementById('amt').innerHTML = '<b>Total:</b> ' + total.toFixed(2);
// }

// // Load cart on page refresh
// window.onload = function () {
//     mapCartItem();   // Restore cart items
//     updateCartCount(); // Restore cart count
// };
