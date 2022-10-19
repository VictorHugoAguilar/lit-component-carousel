import { LitElement, html, css, noChange } from "./node_modules/lit-element/lit-element.js";
import { animate } from "./node_modules/@lit-labs/motion/animate.js";
import { styleMap } from "./node_modules/lit-html/directives/style-map.js";
import { styles } from "./style.js";

/**
 * `vhaa-carousel`
 *
 * @customElement
 * @polymer
 * @demo
 *
 */
export class VhaaCarousel extends LitElement {
    static get properties() {
        return {
            selected: { type: Number },
        };
    }

    /**
     * Instance of the element is created/upgraded. Use: initializing state,
     * set up event listeners, create shadow dom.
     * @constructor
     */
    constructor() {
        super();
        this.selected = 0;
    }

    static get styles() {
        return [styles, css``];
    }

    get selectedSlot() {
        // console.log("selectedSlot", this.__selectedSlot);
        return (this.__selectedSlot ??= this.renderRoot?.querySelector('slot[name="selected"]') ?? null);
    }

    get previousSlot() {
        // console.log("previousSlot", this.__previousSlot);
        return (this.__previousSlot ??= this.renderRoot?.querySelector('slot[name="previous"]') ?? null);
    }

    left = 0;
    selectedInternal = 0;

    get maxSelected() {
        // console.log("maxSelected", this.childElementCount - 1);
        return this.childElementCount - 1;
    }

    hasValidSelected() {
        return this.selected >= 0 && this.selected <= this.maxSelected;
    }

    /**
     * Implement to describe the element's DOM using lit-html.
     * Use the element current props to return a lit-html template result
     * to render into the element.
     */
    render() {
        const p = this.selectedInternal;
        const s = (this.selectedInternal = this.hasValidSelected() ? this.selected : this.selectedInternal);
        const shouldMove = this.hasUpdated && s !== p;
        const atStart = p === 0;
        const toStart = s === 0;
        const atEnd = p === this.maxSelected;
        const toEnd = s === this.maxSelected;
        const shouldAdvance = shouldMove && (atEnd ? toStart : atStart ? !toEnd : s > p);
        const delta = (shouldMove ? Number(shouldAdvance) || -1 : 0) * 100;
        this.left -= delta;
        const animateLeft = `${this.left}%`;
        const selectedLeft = `${-this.left}%`;
        const previousLeft = `${-this.left - delta}%`;
        const w = 100 / this.childElementCount;
        const indicatorLeft = `${w * s}%`;
        const indicatorWidth = `${w}%`;

        return html`
            <div class="fit" ${animate()} @click=${this.clickHandler} style=${styleMap({ left: animateLeft })}>
                <div class="fit" style=${shouldMove ? styleMap({ left: previousLeft }) : noChange}>
                    <slot name="previous"></slot>
                </div>
                <div class="fit selected" style=${shouldMove ? styleMap({ left: selectedLeft }) : noChange}>
                    <slot name="selected"></slot>
                </div>
            </div>
            <div class="bar">
                <div
                    class="indicator"
                    ${animate()}
                    style=${styleMap({
                        left: indicatorLeft,
                        width: indicatorWidth,
                    })}
                ></div>
            </div>
        `;
    }

    previous = -1;

    async updated(changedProperties) {
        // ("updated", changedProperties);
        if ((changedProperties.has("selected") || this.previous === -1) && this.hasValidSelected()) {
            this.updateSlots();
            this.previous = this.selected;
        }
    }

    updateSlots() {
        // unset old slot state
        this.selectedSlot.assignedElements()[0]?.removeAttribute("slot");
        this.previousSlot.assignedElements()[0]?.removeAttribute("slot");
        // set slots
        this.children[this.previous]?.setAttribute("slot", "previous");
        this.children[this.selected]?.setAttribute("slot", "selected");
    }

    clickHandler(e) {
        // console.log("(Number(!e.shiftKey) ", Number(!e.shiftKey) || -1);
        const i = this.selected + (Number(!e.shiftKey) || -1);
        // console.log("clickHandler = i", i);
        this.selected = i > this.maxSelected ? 0 : i < 0 ? this.maxSelected : i;
        const change = new CustomEvent("change", {
            detail: this.selected,
            bubbles: true,
            composed: true,
        });
        // console.log("clickHandler", this.selected);
        this.dispatchEvent(change);
    }
}

customElements.define("vhaa-carousel", VhaaCarousel);
