
class BaseWidget {
  constructor(wrapperElement, initalValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    
    //thisWidget.correctValue = initalValue;
    thisWidget.correctValue = initalValue;
  }  
  
  get value (){
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  // setValue (value) - stosujemy setera
  set value(value){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    /*TODO: Add validation */
    if(thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
       
    //thisWidget.correctValue = newValue;
    //thisWidget.input.value =thisWidget.correctValue;
    thisWidget.renderValue();
    
  }
  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value);
  }
  renderValue(){
    const thisWidget = this;
    //thisWidget.dom.wrapper.innerHTML =thisWidget.correctValue;
    thisWidget.dom.wrapper.innerHTML =thisWidget.value;
  }

  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  }

  announce(){
    const thisWidget = this;

    //const event = new Event('updated');
    const event = new CustomEvent('updated',{
      bubbles: true
    });

    thisWidget.dom.wrapper.dispatchEvent(event);

  }

}
export default BaseWidget;