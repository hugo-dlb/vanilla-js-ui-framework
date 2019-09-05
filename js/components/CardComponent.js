import AbstractComponent from './AbstractComponent.js';

export default class CardComponent extends AbstractComponent {

    constructor(parameters) {
        super({
            properties: {
                title: {},
                description: {},
                image: {}
            }
        }, parameters);
    }

    render() {
        return `
            <li id=${this.getId()}>
                <h3 ref="title">${this.getTitle()}</h3>
                <img src=${this.getImage()} width="100"/>
                <p>${this.getDescription()}</p>
            </li>
        `;
    }

    afterRender() {
        this.getDomRef().onclick = this.handleClick;
    }

    handleClick() {
        console.log('Hello world!');
    }
}