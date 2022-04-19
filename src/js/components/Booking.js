import {select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking{
  constructor(element){
    const thisBooking = this;
    
    thisBooking.render(element);
    thisBooking.initWidgets();
    
  }

  render(element){
    const thisBooking = this;

    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();
      
    /* create element using utilis.createElementFromHTML */
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
     
    /* find menu container */
    const bookingContainer = document.querySelector(select.containerOf.booking);

    /* add element to manu */
    bookingContainer.appendChild(thisBooking.element).innerHTML;

    thisBooking.dom = {
     
      wrapper: element,
      peopleAmount: element.querySelector(select.booking.peopleAmount),
      hoursAmount: element.querySelector(select.booking.hoursAmount),
      datePickerInput: element.querySelector(select.widgets.datePicker.wrapper),
      hourPickerInput: element.querySelector(select.widgets.hourPicker.wrapper),

    };
  }
  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountElement = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmountElement = new AmountWidget(thisBooking.dom.hoursAmount);
   
    /* thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
  thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function() {
  //thisCartProduct.processOrder();
  thisCartProduct.amount = thisCartProduct.amountWidget.value;
    
  //thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value; 
  thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
  
  thisCartProduct.dom.price.innerHTML = thisCartProduct.price;*/

    thisBooking.datePickerInput = new DatePicker(thisBooking.dom.datePickerInput);

    thisBooking.hourPickerInput = new HourPicker(thisBooking.dom.hourPickerInput);
  }


}
export default Booking;