import {settings, select, classNames, templates} from './settings.js';
import utils from './utils.js';
import CartProduct from './components/CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
      
    //console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {
      wrapper: element,
      toggleTrigger: element.querySelector(select.cart.toggleTrigger),
      productList: element.querySelector(select.cart.productList),
      deliveryFee: element.querySelector(select.cart.deliveryFee),
      subtotalPrice: element.querySelector(select.cart.subtotalPrice), 
      totalPrice: element.querySelectorAll(select.cart.totalPrice),
      totalNumber: element.querySelector(select.cart.totalNumber),
      form: element.querySelector(select.cart.form),
      address: element.querySelector(select.cart.address),
      phone: element.querySelector(select.cart.phone),

    };

    //thisCart.dom.wrapper = element;
  }

  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      //thisProduct.element.classList.toggle('active');- initAccordion

    });
      
    thisCart.dom.productList.addEventListener('updated',function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove',function(event){
      thisCart.remove(event.detail.cartProduct);
      console.log('detail:', thisCart.remove);
    });
      
    thisCart.dom.form.addEventListener('submit',function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }
  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload= {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],

    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options);
      console.log('options', options);
      /*fetch(url, options)
        .then(function(response){
          return response.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse2:', parsedResponse);
        });*/
      
     
    }

     
    console.log('payload:', payload);
  }
    
  add(menuProduct){
    const thisCart = this;
    //console.log('adding product', menuProduct);


    /* generate HTML based on template z linii 87*/

    const generatedHTML = templates.cartProduct(menuProduct);
    //const generatedHTML = templates.menuProduct(thisProduct.data);

      
    /* create element using utilis.createElementFromHTML */

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      

    /* add element to manu */
    thisCart.dom.productList.appendChild(generatedDOM);

    /* add products */
    //thisCart.products.push(menuProduct);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }

  update(){
    const thisCart = this;
      
    let deliveryFee = settings.cart.defaultDeliveryFee;
      
    let totalNumber = 0;
    thisCart.totalNumber = 0;
      
    let subtotalPrice = 0;
    thisCart.subtotalPrice =0;

    for(let product of thisCart.products){
        
      totalNumber = totalNumber + product.amount;
      subtotalPrice = subtotalPrice + product.price;
    }
    if(totalNumber == 0){
      deliveryFee = 0;
    }
      
    thisCart.totalPrice = subtotalPrice + deliveryFee; 
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
      
    //thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      
    for(let totalPrice of thisCart.dom.totalPrice){
      totalPrice.innerHTML = thisCart.totalPrice;
    }
       

    console.log('totalPrice:', thisCart.totalPrice);
  }
  remove(outProduct){
    const thisCart = this;
    console.log('test:', thisCart);
    const thisCartToRemove = thisCart.products.indexOf(outProduct);
    //const CartToRemove = thisCart.products.indexOf(event);
    /* const indexOfTravel = categories.indexOf('travel');*/
    console.log('thisCartToRemove:', thisCartToRemove); 

    thisCart.products.splice(thisCartToRemove, 1);
    // categories.splice(indexOfFruits, 1);
    console.log('splice:', thisCart.products);
      
    thisCart.update();

      
  }
      
      
}

export default Cart;