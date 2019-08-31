import AbstractComponent from './AbstractComponent.js';

export default class CardListComponent extends AbstractComponent {

    constructor(parameters) {
        super();
        parameters = parameters || {};
        this.loading = parameters.loading || false;
        this.createAggregation('cards', this.getRefId('cardList'));
        this.setCards(parameters.cards || []);
    }

    render() {
        return `
            <div id=${this.id} class="CardList">
                <div id=${this.getRefId('loader')} class="loader${this.loading ? ' loading' : ''}">Loading...</div>
                <ul id=${this.getRefId('cardList')} class=${this.loading ? 'hidden' : null}>
                    ${this.getCards().toString()}
                </ul>
            </div>
        `;
    }

    setLoading(bLoading) {
        const oRef = this.getRef('loader');
        if (oRef) {
            if (bLoading) {
                oRef.classList.add('loading')
            } else {
                oRef.classList.remove('loading');
            }
        }
        this.loading = bLoading;
        return this;
    }
}