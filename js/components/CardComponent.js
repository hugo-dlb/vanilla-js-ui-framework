import AbstractComponent from './AbstractComponent.js';

export default class CardComponent extends AbstractComponent {

    constructor(parameters) {
        super();
        this.title = parameters.title;
        this.description = parameters.description;
        this.image = parameters.image;
    }

    render() {
        return `
            <li id=${this.id}>
                <h3>${this.title}</h3>
                <img src=${this.image} width="100"/>
                <p>${this.description}</p>
            </li>
        `;
    }
}