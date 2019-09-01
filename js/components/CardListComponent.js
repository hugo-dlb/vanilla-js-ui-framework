import AbstractComponent from './AbstractComponent.js';

export default class CardListComponent extends AbstractComponent {

    constructor(parameters) {
        super({
            properties: {
                loading: {
                    defaultValue: false
                }
            },
            aggregations: {
                cards: {
                    ref: 'cardList'
                }
            }
        }, parameters);
    }

    render() {
        return `
            <div id=${this.getId()} class="CardList">
                <div ref="loader" class="loader${this.getLoading() ? ' loading' : ''}">Loading...</div>
                <ul ref="cardList" class=${this.getLoading() ? 'hidden' : null}>
                    ${this.getCards()}
                </ul>
            </div>
        `;
    }

    /**
     * Sets the loading state of the list.
     * Overrides the default setter for improved rendering performance.
     * 
     * @param {boolean} bLoading True if the list is loading
     */
    setLoading(bLoading) {
        const oRef = this.getRef('loader');
        if (oRef) {
            if (bLoading) {
                oRef.classList.add('loading')
            } else {
                oRef.classList.remove('loading');
            }
        }
        this._loading = bLoading;
        return this;
    }
}