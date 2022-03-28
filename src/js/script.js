/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
  
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    //API
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };
  
  class Product{
    constructor(id, data){
      const thisProduct = this;
      
      thisProduct.id = id;
      thisProduct.data = data;
      
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      
      
      //console.log('new Product:', thisProduct);
    }
  
    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      
      /* create element using utilis.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
     
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to manu */
      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;
      /*thisProduct.dom = {
        
        accordionTrigger: thisProduct.element.querySelector(select.menuProduct.clickable),
        form: thisProduct.element.querySelector(select.menuProduct.form),
        formInputs: thisProduct.form.querySelectorAll(select.all.formInputs),
        cartButton: thisProduct.element.querySelector(select.menuProduct.cartButton),
        priceElem: thisProduct.element.querySelector(select.menuProduct.priceElem),
        imageWrapper:thisProduct.element.querySelector(select.menuProduct.imageWrapper),
        amountWidgetElem: thisProduct.element.querySelector(select.menuProduct.amountWidget),
      };*/
      
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      
      
    }
    
    initAccordion(){
      const thisProduct = this;
      
      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //const clickableTrigger = document.querySelectorAll(select.menuProduct.clickable);
      /* START: add event listener to clickable trigger on event click */
      //clickableTrigger.addEventListener('click', function(event) {
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        
        /* find active product (product that has active class) */
        //const activeProduct = document.querySelectorAll(classNames.menuProduct.wrapperActive);
        //const activeProduct = document.querySelector(classNames.menuProduct.wrapperActive);
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        //console.log(activeProduct);
         
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if( activeProduct && activeProduct != thisProduct.element ) {
          
          activeProduct.classList.remove('active');
        }

        /* toggle active class on thisProduct.element */
        
        thisProduct.element.classList.toggle('active');
        
      });
  
    }

    initOrderForm(){
      const thisProduct = this;
      
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
      //console.log('processOrder:',thisProduct);
    }
  
    
    processOrder(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
      
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        
        for(let optionId in param.options) {
        
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //console.log('optionSelected', optionSelected);

          // check if there is param with a name of paramId in formData and if it includes optionId
          if(optionSelected) {
          // check if the option is not default
           
            if(option.default !== true) {
            // add option price to price variable
              price += option.price;
            }
          } 

          else {
            // check if the option is default
            if(option.default === true) {
            // reduce price variable
              price -= option.price;

            }
          }
          if(formData[paramId]) {
            if(option.default === true) {
            
              price += option.price;
            }
          }
          
          // IMAGE - DISPLAY
          
          // find option image ... //.paramId-optionId (.toppings-olives)
          
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //console.log('optionImage', optionImage);
          // add class active
          
          if (optionImage) {
            //optionImage.classList.add('active');
           
            // add & remove class ('active')
           
            if(optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            else if(formData[paramId]){
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
            
          }
          
        }
      }
      /* multiply price by amout */
      price *= thisProduct.amountWidget.value;
      // price product per item
      thisProduct.priceSingle = price / thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;

    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      
      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }
    
    addToCart(){
      const thisProduct = this;
      //app.cart.add(thisProduct);
      app.cart.add(thisProduct.prepareCartProduct());
      
      
    }
    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value, 

        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }

    prepareCartProductParams(){
    
      const thisProduct = this;
  
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);
  
      
      const params = {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);
  
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        };
        
        
        // for every option in this category
          
        for(let optionId in param.options) {
          
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);
  
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //console.log('optionSelected', optionSelected);
  
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(optionSelected) {
            // option is selected
            params[paramId].options[optionId] = option.label;
          } 
        }
      }
      return params; 
    }
  }
  
  
  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      
      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);

      thisWidget.getElements(element);
      //thisWidget.setValue(thisWidget.input.value);
      //thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }
    
    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /*TODO: Add validation */
      if (thisWidget.value !== newValue && 
        !isNaN(newValue) &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax  
      ){
        thisWidget.value = newValue;
      }
       
      //thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;
      
      thisWidget.announce();


    }
    initActions(){
      const thisWidget = this;
      

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
        
      });
           
      
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
        
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
        
      });
      
    }
    announce(){
      const thisWidget = this;

      //const event = new Event('updated');
      const event = new CustomEvent('updated',{
        bubbles: true
      });

      thisWidget.element.dispatchEvent(event);

    }
  }
  
  
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
  
 
  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;
     

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price,
      thisCartProduct.params = menuProduct.params,

      
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      
      
      //console.log('new CartProduct', thisCartProduct);
    }
    
    getElements(element){
      const thisCartProduct = this;
      
      thisCartProduct.dom = {

        wrapper: element,
        amountWidgetElem: element.querySelector(select.cartProduct.amountWidget),
        price: element.querySelector(select.cartProduct.price),
        edit: element.querySelector(select.cartProduct.edit),
        remove: element.querySelector(select.cartProduct.remove),
        //thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
        

      };
    }
    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
      
      thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function() {
        //thisCartProduct.processOrder();
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        
        //thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value; 
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        
        
        
       
        //thisProduct.priceElem.innerHTML = price;
        //amount: thisProduct.amountWidget.value,
        //priceSingle: thisProduct.priceSingle,
        //price: thisProduct.priceSingle * thisProduct.amountWidget.value, 
    
      
      });
    }
    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
      thisCartProduct.dom.wrapper.remove();

      console.log('remove:',thisCartProduct);
    }
    initActions(){
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
        
      });

      thisCartProduct.dom.remove.addEventListener('click',function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });

    }

    getData(){
      const thisCartProduct = this;
    
      const productSummary= {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        priceSingle: thisCartProduct.priceSingle,
        price: thisCartProduct.price,
        name: thisCartProduct.name,
        params: thisCartProduct.params,
      };
      return productSummary;

      /*const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value, 

        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;*/
    }

  }

  const app = {
   
    initData: function(){
      const thisApp = this;
      //thisApp.data = dataSource;
      thisApp.data = {};
      
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          /* save parsedResponse as thisApp.data.products*/
          thisApp.data.products = parsedResponse;

          /* execute initMenu method*/
          thisApp.initMenu();

        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },
    
    initCart: function(){
      const thisApp = this;
  
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    
    },
    
    initMenu: function(){
      //const testProduct = new Product();
      //console.log('testProduct:', testProduct);
      
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        //new Product(productData, thisApp.data.products[productData]);
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
    
    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      
      thisApp.initData();
      //thisApp.initMenu();
      thisApp.initCart();
    },
  };
  
  app.init();
}
