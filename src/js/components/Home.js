import {select, templates,} from '../settings.js';
import utils from '../utils.js';


class Home {
  constructor(element){
    const thisHome = this;
    thisHome.render(element);
  }
  
  render(element){
    const thisHome = this;
    /* generate HTML based on template */
    const generatedHTML = templates.homePage();
    /* create element using utils.createElementFromHTML */
    thisHome.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const homeContainer = document.querySelector(select.containerOf.home);
    /* add element to menu */
    homeContainer.appendChild(thisHome.element);   
    
    thisHome.dom = {
      wrapper: element,
    };
  }

}
export default Home;