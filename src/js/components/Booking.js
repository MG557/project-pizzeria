import {select, templates, settings,} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking{
  constructor(element){
    const thisBooking = this;
    
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerInput.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerInput.maxDate);

    const params = {

      booking: [
        startDateParam,
        endDateParam,
      ],

      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData, params',params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking  + '?' 
                                           + params.booking.join('&'),
      
      eventsCurrent: settings.db.url + '/' + settings.db.event    + '?' 
                                           + params.eventsCurrent.join('&'),
      
      eventsRepeat:  settings.db.url + '/' + settings.db.event    + '?' 
                                           + params.eventsRepeat.join('&'),
    };
    //console.log('urls:', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),

        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        console.log('bookings:', bookings);
        console.log('eventsCurrent:', eventsCurrent);
        console.log('eventsRepeat:', eventsRepeat);

      });


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
  thisCartProduct.dom.amountWidgetElem.addEventListener(setiingupdatedsetiing, function() {
  thisCartProduct.processOrder();
  thisCartProduct.amount = thisCartProduct.amountWidget.value;
    
  thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value; 
  thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
  
  thisCartProduct.dom.price.innerHTML = thisCartProduct.price;*/

    thisBooking.datePickerInput = new DatePicker(thisBooking.dom.datePickerInput);

    thisBooking.hourPickerInput = new HourPicker(thisBooking.dom.hourPickerInput);
  }
}
export default Booking;