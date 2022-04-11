import select from './settings.js';
import AmountWidget from './components/AmountWidget.js';


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

  
  }

}
export default CartProduct;