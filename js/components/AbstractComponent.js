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
            this.createProperty(sProperty);
        });

        const oAggregations = oDescriptor.aggregations || {};
        Object.keys(oAggregations).forEach((sAggregation) => {
            this.createAggregation(sAggregation, oAggregations[sAggregation].ref);
        });

        const oEvents = oDescriptor.events || {};
        Object.keys(oEvents).forEach((sEvent) => {
            this.createEvent(sEvent);
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
            const aProperties = Object.keys(oProperties);
            const oAggregations = oDescriptor.aggregations || {};
            const aAggregations = Object.keys(oAggregations);
            const oEvents = oDescriptor.events || {};
            const aEvents = Object.keys(oEvents);

            if (aProperties.indexOf(sParameter) > -1 || aAggregations.indexOf(sParameter) > -1) {
                this[`_${sParameter}`] = oParameters[sParameter];
            } else if (aEvents.indexOf(sParameter) > -1) {
                const fnEvent = oParameters[sParameter];
                if (typeof fnEvent === 'function') {
                    this[`_${sParameter}`].push(fnEvent);
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
                oRef.insertAdjacentHTML('beforeEnd', oAggregation);
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
                oRef.removeChild(oAggregation.getDomRef());
            }
        }

        // Create insert at method to insert the given aggregation at the given index to the aggregations array
        this[`insert${this.capitalizeFirstLetter(sAggregation).slice(0, -1)}At`] = (iIndex, oAggregation) => {
            const aAggregations = this[`_${sAggregation}`];
            if (iIndex >= aAggregations.length) {
                const oPreviousAggregation = aAggregations[aAggregations.length - 1];
                const oRef = oPreviousAggregation.getDomRef();
                if (oRef) {
                    oRef.insertAdjacentHTML('afterEnd', oAggregation);
                }
                this[`_${sAggregation}`].push(oAggregation);
            } else {
                const oPreviousAggregation = aAggregations[iIndex];
                const oRef = oPreviousAggregation.getDomRef();
                if (oRef) {
                    oRef.insertAdjacentHTML('beforeBegin', oAggregation);
                }
                this[`_${sAggregation}`].splice(iIndex, 0, oAggregation);
            }
        }

        // Create remove at method to remove the aggregation at the given index from the aggregations array
        this[`remove${this.capitalizeFirstLetter(sAggregation).slice(0, -1)}At`] = (iIndex) => {
            const oAggregation = this[`_${sAggregation}`][iIndex];
            if (oAggregation) {
                this[`remove${this.capitalizeFirstLetter(sAggregation).slice(0, -1)}`](oAggregation);
            }
        }
    }

    /**
     * Creates an event which is an array of callbacks.
     * 
     * @param {string} sEvent The event name
     */
    createEvent(sEvent) {
        this[`_${sEvent}`] = [];
    }

    /**
     * Creates a property.
     * Automatically creates get and set methods.
     * 
     * @param {string} sProperty The property name
     */
    createProperty(sProperty) {
        const oDescriptor = this.descriptor;
        const oProperties = oDescriptor.properties || {};

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
                if (!bPreventRerendering) {
                    this.reRender();
                }
                return this;
            }
        }
    }

    fireEvent(sEvent, oData) {
        const oEvents = this.descriptor.events || {};
        const aEvents = Object.keys(oEvents);
        if (aEvents.indexOf(sEvent) > -1) {
            const aEventListeners = this[`_${sEvent}`];
            if (typeof aEventListeners instanceof Array) {
                aEventListeners.forEach(fnListener => fnListener(oData));
            }
        }
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
     * Capitalizes the first character of a string.
     * 
     * @param {string} sString The string
     */
    capitalizeFirstLetter(sString) {
        return sString[0].toUpperCase() + sString.slice(1);
    }
}