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
      
      
      console.log('new Product:', thisProduct);
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
        console.log(activeProduct);
        
        /*
        const select {
        all: {
          menuProducts: '#product-list > .product',
          menuProductsActive: '#product-list > .product.active',
          formInputs: 'input, select', 
        }}
          */
      
        
        
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
      console.log('processOrder:',thisProduct);
    }
  
    
    processOrder(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
      
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);

        // for every option in this category
        
        for(let optionId in param.options) {
        
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          console.log(optionId, option);

          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          console.log('optionSelected', optionSelected);

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
          console.log('optionImage', optionImage);
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

        param: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }

    prepareCartProductParams(){
    
      const thisProduct = this;
  
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
  
      // set price to default price
      //let price = thisProduct.data.price;
      const params = {};
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);
  
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        };
        
        
        // for every option in this category
          
        for(let optionId in param.options) {
          
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          console.log(optionId, option);
  
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          console.log('optionSelected', optionSelected);
  
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(optionSelected) {
            // option is selected
            params[paramId].option = option.label;
            
            /*if(option.default !== true) {
              // add option price to price variable
              price += option.price;
            }*/
          } 
  
          /*else {
            // check if the option is default
            if(option.default === true) {
              // reduce price variable
              price -= option.price;
            }
          }*/
          /*if(formData[paramId]) {
            if(option.default === true) {
              
              price += option.price;
            }
          }*/
           
          // IMAGE - DISPLAY
            
          // find option image ... //.paramId-optionId (.toppings-olives)
            
          /* const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          console.log('optionImage', optionImage);
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
              
          }*/
          
        }
      }
      return params;

      /* multiply price by amout */
      //price *= thisProduct.amountWidget.value;
      // price product per item
      //thisProduct.priceSingle = price;
      // update calculated price in the HTML
      //thisProduct.priceElem.innerHTML = price;
  
      
    }
  }
  
  
  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      
      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);

      thisWidget.getElements(element);
      //thisWidget.setValue(thisWidget.input.value);
      thisWidget.setValue(settings.amountWidget.defaultValue);
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
      
        
      /*if (thisWidget.value <= settings.amountWidget.defaultMin){
        thisWidget.value = settings.amountWidget.defaultMin;

      }
      
      if (thisWidget.value >= settings.amountWidget.defaultMax){
        thisWidget.value = settings.amountWidget.defaultMax;
      }*/
      
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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);

    }
  }
  
  // eslint-disable-next-line no-unused-vars
  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.product = [];

      thisCart.getElements(element);
      thisCart.initActions();
      
      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {
        wrapper: element,
        toggleTrigger: element.querySelector(select.cart.toggleTrigger),
        productList: element.querySelector(select.cart.productList),
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
    }
    add(menuProduct){
      const thisCart = this;
      console.log('adding product', menuProduct);


      /* generate HTML based on template z linii 87*/

      const generatedHTML = templates.cartProduct(menuProduct);
      //const generatedHTML = templates.menuProduct(thisProduct.data);

      
      
      /* create element using utilis.createElementFromHTML */

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      //thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      
      
      /* find menu container */
      //const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to manu */
      thisCart.dom.productList.appendChild(generatedDOM);

    }
  }
  

  const app = {
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
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
      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };
  
  app.init();
}
