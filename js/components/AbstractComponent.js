export default class AbstractComponent {

    /**
     * The AbstractComponent class is the core of the framework.
     * Every UI element should extend this class.
     */
    constructor() {
        this.id = this.generateUUID();
    }

    /**
     * The component rendering method.
     * This method should be overriden and should return valid HTML.
     * 
     * @returns {string} The component HTML content
     */
    render() {
        return '';
    }

    /**
     * Returns the trimmed component HTML content.
     */
    toString() {
        return this.render().trim();
    }

    /**
     * Creates an aggregation which is an array of Components.
     * Automatically creates get, set, add and delete methods for the given aggregation name.
     * 
     * @param {string} sAggregation The aggregation plural name (e.g "items")
     * @param {string} sDomRefId The DOM element id where the aggregation should be rendered
     */
    createAggregation(sAggregation, sDomRefId) {
        this[`_${sAggregation}`] = [];

        // Create getter method to get the aggregations array
        this[`get${this.capitalizeFirstLetter(sAggregation)}`] = () => {
            return this[`_${sAggregation}`];
        }
        
        // Create setter method to set the aggregations array
        this[`set${this.capitalizeFirstLetter(sAggregation)}`] = (aCards) => {
            aCards.toString = function() {
                return this.join('');
            };
            this[`_${sAggregation}`] = aCards;
            const oRef = document.getElementById(sDomRefId);
            if (oRef) {
                oRef.innerHTML = aCards.join('');
            }
        }

        // Create add method to add the given aggregation to the aggregations array
        this[`add${this.capitalizeFirstLetter(sAggregation).slice(0, -1)}`] = (oAggregation) => {
            this[`_${sAggregation}`].push(oAggregation);
            const oRef = document.getElementById(sDomRefId);
            if (oRef) {
                oRef.insertAdjacentHTML('beforeend', oAggregation);
            }
        }

        // Create remove method to remove the given aggregation from the aggregations array
        this[`remove${this.capitalizeFirstLetter(sAggregation).slice(0, -1)}`] = (oAggregation) => {
            const aAggregations = this[`_${sAggregation}`];
            for (let i = 0; i < aAggregations.length; i++) {
                const oCurrentAggregation = aAggregations[i];
                if (oCurrentAggregation === oAggregation) {
                    aAggregations.splice(i, 1)
                    break;
                }
            }
            const oRef = document.getElementById(sDomRefId);
            if (oRef) {
                oRef.parentNode.removeChild(oRef);
            }
        }
    }

    /**
     * Generates a uuid.
     * 
     * @returns {string} The uuid
     */
    generateUUID() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }

    /**
     * Retrieves a reference id based on the given name.
     * 
     * @returns {string} sReferenceName The reference id
     */
    getRefId(sReferenceName) {
        return `${this.id}-${sReferenceName}`;
    }

    /**
     * Retrieves a reference DOM element based on the given name.
     * 
     * @param {string} sReferenceName The reference name
     * @returns {Element} The DOM element
     */
    getRef(sReferenceName) {
        return document.getElementById(`${this.id}-${sReferenceName}`);
    }

    /**
     * Retrieves this instance reference in the DOM.
     * 
     * @returns {Element} This instance element
     */
    getDomRef() {
        return document.getElementById(this.id);
    }

    /**
     * Capitalizes the first character of a string.
     * 
     * @param {string} sString The string
     */
    capitalizeFirstLetter(sString) {
        return sString[0].toUpperCase() + sString.slice(1);
    }
}