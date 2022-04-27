import {select, templates, settings, classNames,} from '../settings.js';
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
    thisBooking.initTables();
    
    
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
      tables: element.querySelectorAll(select.booking.tables),
      restaurantPlan: element.querySelector(select.booking.restaurantPlan),
      phone: element.querySelector(select.booking.phone),
      address: element.querySelector(select.booking.address),
      form: element.querySelector(select.booking.form),
      starters: element.querySelectorAll(select.booking.starter),
      tableSubmit: element.querySelector(select.booking.tableSubmit)
    };
    console.log('restaurantPlan', thisBooking.dom.restaurantPlan);
    
    
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
        //console.log('bookings:', bookings);
        //console.log('eventsCurrent:', eventsCurrent);
        //console.log('eventsRepeat:', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
 
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerInput.minDate;
    const maxDate = thisBooking.datePickerInput.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
         
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.date, item.hour, item.duration, item.table);

        }
      }
    }
    console.log('thisbooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }
  
  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop:', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerInput.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerInput.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

    }
  }

  
  
  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountElement = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmountElement = new AmountWidget(thisBooking.dom.hoursAmount);
   
    thisBooking.datePickerInput = new DatePicker(thisBooking.dom.datePickerInput);

    thisBooking.hourPickerInput = new HourPicker(thisBooking.dom.hourPickerInput);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      //thisBooking.initTables();
     
    });

    /*thisBooking.dom.restaurantPlan.addEventListener('click', function(){
      thisBooking.initTables();
    });
    console.log('widget restaur', thisBooking.dom.restaurantPlan);
    console.log('widget initTables', thisBooking.initTables);*/
  
    thisBooking.dom.tableSubmit.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });


  
  
  }

  initTables(){
    const thisBooking = this;

    thisBooking.dom.restaurantPlan.addEventListener('click', function(event){
      
      const inputTableElement = event.target;
      const table = inputTableElement.getAttribute(settings.booking.tableIdAttribute);
      let tableId = '';
      
      console.log('tableId', tableId);
      console.log('inputTableElement:', inputTableElement);
      
      if(table !== null){

        if(!inputTableElement.classList.contains(classNames.booking.tableBooked)){
          const tables = thisBooking.dom.tables;
          //const tables = thisBooking.element.querySelectorAll(select.booking.tables);
          console.log('table free');

          if(!inputTableElement.classList.contains(classNames.booking.tableSelected)){

            for(let table of tables){
              table.classList.remove(classNames.booking.tableSelected);
              tableId = '';
            }

            inputTableElement.classList.add(classNames.booking.tableSelected);

            const inputTableElemId = inputTableElement.getAttribute('data-table');
            tableId = inputTableElemId;
            thisBooking.tableId = parseInt(tableId);

            console.log('tableId:', tableId);

          } else if (inputTableElement.classList.contains(classNames.booking.tableSelected)){
            inputTableElement.classList.remove(classNames.booking.tableSelected);
          }
        }
        else {
          window.alert('Stolik niedostępny / table unavailable.');
        }
      }
    });
  }
 

  /* initAction(){
      const thisBook = this;

      thisBook.container.addEventListener('dblclick', function(event){
        event.preventDefault();
        const book = event.target.offsetParent;
      
        if(book.classList.contains(select.books.bookImage)){

          book.classList.toggle(className.bookClassImage);
          const bookImId = book.getAttribute(select.books.imageLink);

          if(favoriteBooks.includes(bookImId)){
          
            const idIndex = favoriteBooks.indexOf(bookImId);
            favoriteBooks.splice(idIndex, 1);
          }
          else{
            favoriteBooks.push(bookImId);
          }

          
        }
      });
      thisBook.bookFilter.addEventListener('click', function(event){
      //event.preventDefault();
        const bookFt = event.target;

        if(bookFt.tagName === 'INPUT' && bookFt.type === 'checkbox' && bookFt.name === 'filter'){
          if(bookFt.checked === true) {
            filters.push(bookFt.value);
          } else if (filters.includes(bookFt.value)){
            const idIndex = filters.indexOf(bookFt.value);
            filters.splice(idIndex, 1);
          }   
        }
        thisBook.filterBooks();
      });
    
    } */



  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      
      date: thisBooking.datePickerInput.value,
      hour: thisBooking.hourPickerInput.value,
      table: thisBooking.tableId,
      duration: parseInt(thisBooking.hoursAmountElement.value),
      ppl: parseInt(thisBooking.peopleAmountElement.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value
    };

    for (let starter of thisBooking.dom.starters){
      if (starter.checked == true){
        payload.starters.push(starter.value);
        console.log('payload starter', payload.starters);

      }
     
    }

    


    console.log('payload:', payload);

    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
    console.log('sendBooking:', thisBooking);
    
    
    
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse2:', parsedResponse);
        thisBooking.updateDOM();
      });

  }

}


        
       

  
       

  




export default Booking;