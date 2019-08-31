import CardComponent from './CardComponent.js';
import CardListComponent from './CardListComponent.js';
import CardService from '../services/CardService.js';

export default class AppComponent {

    /**
     * The App class is the root of the Application.
     * It is the only UI element that do not need to extend the AbstractComponent class.
     */
    constructor() {
        this.cardList = new CardListComponent().setLoading(true);
        CardService.getCards().then(aCardsData => {
            const aCards = [];
            aCardsData.forEach(oCard => aCards.push(new CardComponent(oCard)));
            this.cardList.setCards(aCards);
            this.cardList.setLoading(false);
        });
    }

    /**
     * Renders the App UI component
     */
    render() {
        return `
            ${this.cardList}
        `;
    }

    /**
     * Inserts this App instance in the given DOM element.
     * 
     * @param {Element} oDomRef The DOM element to insert the App in
     */
    placeAt(oDomRef) {
        oDomRef.innerHTML = this.render().trim();
    }
}