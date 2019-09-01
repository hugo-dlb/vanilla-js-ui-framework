export default class AbstractComponent {

    /**
     * The AbstractComponent class is the core of the framework.
     * Every UI element should extend this class.
     */
    constructor(oDescriptor, oParameters) {
        this.applyDescriptor(oDescriptor);
        this.applyParameters(oParameters);
        this.init();
    }

    /**
     * Creates the component properties getter and setters, aggregations and
     * events based on the given descriptor object.
     * 
     * @param {any} oDescriptor The component descriptor containing the properties,
     * aggregations and events
     */
    applyDescriptor(oDescriptor) {
        oDescriptor = oDescriptor || {};
        this.descriptor = oDescriptor;
        const oProperties = oDescriptor.properties || {};

        // Adds the id property if it is not defined
        if (oProperties.id === undefined) {
            oProperties.id = {
                defaultValue: this.generateUUID()
            };
        }

        Object.keys(oProperties).forEach((sProperty) => {

            // Initialize the property
            this[`_${sProperty}`] = oProperties[sProperty].defaultValue || null;

            // Create getter method
            if (this[`get${this.capitalizeFirstLetter(sProperty)}`] === undefined) {
                this[`get${this.capitalizeFirstLetter(sProperty)}`] = () => {
                    return this[`_${sProperty}`];
                }
            }

            // Create setter method
            if (this[`set${this.capitalizeFirstLetter(sProperty)}`] === undefined) {
                this[`set${this.capitalizeFirstLetter(sProperty)}`] = (oValue) => {
                    this[`_${sProperty}`] = oValue;
                    const bPreventRerendering = oProperties[sProperty].preventRerendering;
                    if (bPreventRerendering !== undefined && !bPreventRerendering) {
                        this.reRender();
                    }
                    return this;
                }
            }
        });

        const oAggregations = oDescriptor.aggregations || {};
        Object.keys(oAggregations).forEach((sAggregation) => {
            this.createAggregation(sAggregation, oAggregations[sAggregation].ref);
        });
    }

    /**
     * Populates the component with the given parameters.
     * 
     * @param {any} oParameters The component parameters
     */
    applyParameters(oParameters) {
        oParameters = oParameters || {};

        for (const sParameter of Object.keys(oParameters)) {
            const oDescriptor = this.descriptor;
            const oProperties = oDescriptor.properties || {};

            for (const sProperty of Object.keys(oProperties)) {
                if (sParameter === sProperty) {
                    this[`_${sProperty}`] = oParameters[sParameter];
                    break;
                }
            }
        }

    }

    /**
     * The component inititialization method.
     * UI Components should be created here.
     */
    init() { }

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
     * Rerenders the component.
     */
    reRender() {
        const oRef = this.getDomRef();
        if (oRef) {
            oRef.outerHTML = this.toString();
        }
    }

    /**
     * Inserts the component in the given DOM element.
     * 
     * @param {Element} oDomRef The DOM element
     */
    placeAt(oDomRef) {
        oDomRef.innerHTML = this.toString();
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
     * @param {string} sDomRef The DOM element reference name where the aggregation should be rendered
     */
    createAggregation(sAggregation, sDomRef) {
        this[`_${sAggregation}`] = [];

        // Create getter method to get the aggregations array
        this[`get${this.capitalizeFirstLetter(sAggregation)}`] = () => {
            return this[`_${sAggregation}`];
        }

        // Create setter method to set the aggregations array
        this[`set${this.capitalizeFirstLetter(sAggregation)}`] = (aAggregations) => {
            aAggregations.toString = function () {
                return this.join('');
            };
            this[`_${sAggregation}`] = aAggregations;
            const oRef = this.getRef(sDomRef);
            if (oRef) {
                oRef.innerHTML = aAggregations.join('');
            }
        }

        // Create add method to add the given aggregation to the aggregations array
        this[`add${this.capitalizeFirstLetter(sAggregation).slice(0, -1)}`] = (oAggregation) => {
            this[`_${sAggregation}`].push(oAggregation);
            const oRef = this.getRef(sDomRef);
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
            const oRef = this.getRef(sDomRef);
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
     * Retrieves a reference DOM element based on the given reference name.
     * 
     * @param {string} sReferenceName The reference name
     * @returns {Element} The DOM element
     */
    getRef(sReferenceName) {
        const oRef = this.getDomRef();
        if (oRef) {
            return oRef.querySelector(`[ref=${sReferenceName}]`);
        }
        return null;
    }

    /**
     * Retrieves this instance reference in the DOM.
     * 
     * @returns {Element} This instance element
     */
    getDomRef() {
        return document.getElementById(this.getId());
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