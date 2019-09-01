import CardComponent from './CardComponent.js';
import CardListComponent from './CardListComponent.js';
import CardService from '../services/CardService.js';
import AbstractComponent from './AbstractComponent.js';

export default class AppComponent extends AbstractComponent {

    /**
     * The App class is the root of the Application.
     */
    constructor() {
        super({
            properties: {
                cardList: {
                    defaultValue: null
                }
            }
        });
    }

    init() {
        this.setCardList(new CardListComponent({
            loading: true
        }));
        CardService.getCards().then(aCardsData => {
            const aCards = [];
            aCardsData.forEach(oCard => aCards.push(new CardComponent(oCard)));
            this.getCardList().setCards(aCards);
            this.getCardList().setLoading(false);
        });
    }

    render() {
        return `
            <div id=${this.getId()} class="App">
                ${this.getCardList()}
            </div>
        `;
    }
}