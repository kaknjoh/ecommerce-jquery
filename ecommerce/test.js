// Cart globalni niz koristi se za kupljenje i dodavanje podataka u local storage
let cart = [];

//buttons globalni niz buttona add to cart na svakom artiklu
let buttonsDOM = [];

//klasa Produkti ima samo jednu metodu koja kupi sve projekte kreirane u htmlu i uzima vrijednossti podataka image url, id , title proizvoda i cijenu
class Products {
  getProducts1() {
    let products = [];
    // Selektot svih produkata
    let productsDOM = [...document.querySelectorAll(".product")];

    let product = {};
    for (let i = 0; i < productsDOM.length + 1; i++) {
      // Selektor za dobijanje url za svaku od slika produkata
      product.image = $(".product" + i + " " + "img").attr("src");

      product.id = $(".product" + i + " " + "button").data("id");
      product.title = $(".product" + i + " " + "h3").text();
      product.price = $(".product" + i + " " + "h4").text();
      // es6 sintaksa za destructuring objekta
      const { title, price, id, image } = product;
      // dodavanje objekta u niz produkta
      products.push({ title, price, id, image });
    }
    console.log(products);
    return products;
  }
}

class UI {
  // Funkcija koja selektuje sve buttone za kupovinu odnoso add to cart
  getBagButtons() {
    // selektuje sve buttone i es6 sintaksom ih prebacuje u niz
    let buttons = [...document.querySelectorAll(".bag-btn")];

    buttonsDOM = buttons;
    // Dalje u kod logika se zasniva na tome da se za svaki button ispita da se nalazi vec nalazi u cartu, odnosno da li je snimljen od ranije ako jeste onda mu se postavlja svojstvo
    // da je disablan i text se posatavlja in cart, u suprotnom na klik se mijenja text iz add to cart u in cart i button se postavlja na disabled
    buttons.forEach((button) => {
      console.log("cart");
      console.log(cart);
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id == id);
      if (inCart) {
        console.log("in Cart");
        console.log(inCart);

        $(button).text("in cart");
        $(button).attr("disabled", true);
      } else {
        $(button).on("click", (event) => {
          $(event.target).text("in cart");
          $(event.target).attr("disabled", true);
          // cart item postaje objekat koji se dobija iz local storagea po idu te mu se jos dodatno dodaje i amount koji je u pocetku 1
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          // U postojeci niz cart se kopiraju svi prethodni elementi te se dodaju novi cartItem
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          this.setCartValues(cart);
          this.addCartItem(cartItem);

          this.showCart();
        });
      }
    });
  }
  /* Funckija za postavljanje vrijednosti produkta koji se nalaze u cartu, funckionise na nacin da se prode kroz sve elemente koji se nalaze u cartu,
 broji ukupan broj elemenata u cartu i ukupnu cijenu artikala u cartu, nakon toga se koristi selektor koji prikazuje izracunato u htmlu
*/
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      let price = parseFloat(item.price);
      tempTotal += price * item.amount;
      itemsTotal += item.amount;
    });
    console.log(tempTotal);
    $(".cart-total").text(parseFloat(tempTotal.toFixed(2)));
    $(".cart-items").text(itemsTotal);
  }
  // Funkcija koja dodaje klasu za prikaz i pozadinu cart
  showCart() {
    $(".cart-overlay").addClass("transparentBcg");
    $(".cart").addClass("showCart");
  }

  // Funkcija koja se poziva da inicijalizira vrijednosti koje su od ranije u cartu tako sto ih kupi iz localStorage te ih ponovo dodaje i postavlja u cart
  setupApp() {
    cart = Storage.getCart();
    console.log(cart);
    this.setCartValues(cart);
    this.populate(cart);
    $(".cart-btn").click(this.showCart);
    $(".close-cart").on("click", this.hideCart);
  }
  /* Funkcija koja se koristi kako bi se dodao novi element u cart, prima parametar produkta koji ce se dodati u cart, funcionise tako sto se dodaje isti onaj html za jedan produkt
  koji se nalazi u index.htmlu samo sto se sada vrijednosti kao sto su title, amount itd dodaju dinamicki od itema koji je poslan kao parametar
  Nakon toga se div appena u cart content div koji sadrzi sve produkte u cartu
*/

  addCartItem(item) {
    let div = $("<div></div>").addClass("cart-item").html(
      `<img src=${item.image} alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up"  data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down"  data-id=${item.id}></i>
            </div>`
    );
    $(".cart-content").append(div);
  }

  populate(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  // funkcija koja handla logiku unutar carta
  cartLogic() {
    // Klikom na dugme za zatvaranje zatvara se cart
    $(".clear-cart").click(this.clearCart);
    $(".cart-content").click((event) => {
      // Uslov koji se izvrsava ukoliko se klikne na remove tj ukoliko element na koji smo kliknuli posjeduje klasu remove-item
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        // Posto se je remove span element potrebno je obrisati 2 parent diva kako bi se obrisao div u kom se nalazi cjelokupan produkt
        $(removeItem).parent().parent().remove();
        // $(".cart-content").remove(remove);
        this.removeItem(id);
      }
      // Uslov koji se izvrsava kada klikne na dugme za povecavanje iznosa artikla
      else if (event.target.classList.contains("fa-chevron-up")) {
        console.log(event.target);
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        console.log(id);
        console.log(cart);
        let tempItem = cart.find((item) => item.id == id);

        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        $(addAmount).next().text(tempItem.amount);
      }
      // Uslov koji se izvrsava kada klikne na dugme za smanjenje  iznosa artikla, unutar uslova se nalazi jos jedan uslov koji je ispunjen ukoliko je amount jedan
      // a kliknute je opet dugme da se smanji iznos tada ce se produkt automatski removati
      else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id == id);

        if (tempItem.amount === 1) {
          $(lowerAmount).parent().parent().remove();
          this.removeItem(id);
        } else {
          tempItem.amount -= 1;
          Storage.saveCart(cart);
          this.setCartValues(cart);
          $(lowerAmount).prev().text(tempItem.amount);
        }
      }
    });
  }

  // Brise sve elemente iz carta

  clearCart = () => {
    let cartItems = cart.map((item) => item.id);
    $.each(cartItems, (key, id) => {
      this.removeItem(id);
    });
    $(".cart-content").empty();
    this.hideCart();
  };
  // Remova klase koje su prethodno dodane kako bi se prikazao kart
  hideCart() {
    $(".cart-overlay").removeClass("transparentBcg");
    $(".cart").removeClass("showCart");
  }
  // Remove jedan item iz carta na osnovu ida koji se proslijedi, te mijenja postavke buttona tog produkta izvan na carta iz in cart u add to cart
  removeItem(id) {
    cart = cart.filter((item) => item.id != id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    $(button).html(`<i class="fas fa-shopping-cart"></i>add to cart`);
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id == id);
  }
}

// local storage

// Klasa storage koja se koristi u radu sa localStorageom, sve metode unutar klase su staticki sto znaci pozivaju se po nazivu klase, odosno nije potrebna instanca objekta kako bi se funkcije pozvale
class Storage {
  static saveProduct(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id == id);
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}
// jquery ready event koji se prvi izvrsava prilikom loadanja DOM-a
$(document).ready(function () {
  const ui = new UI();
  const product = new Products();
  let products = product.getProducts1();
  ui.setupApp();

  Storage.saveProduct(products);
  ui.getBagButtons();
  ui.cartLogic();
});
