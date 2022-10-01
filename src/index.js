import { observable, observe, unobserve, raw } from "@nx-js/observer-util";
import { render, html, svg } from "uhtml";
import deepmerge from "deepmerge";

// Polyfills
import "construct-style-sheets-polyfill"; // Non-Chromium constructed stylesheets
import "@ungap/custom-elements"; // Make Safari able to extend in-built elements.

// Hidden variables
const isBlissElement = Symbol("isBlissElement");
const componentHasLoaded = Symbol("componentHasLoaded");

// List of shadowDOM-able native elements from https://javascript.info/shadow-dom
const nativeShadowDOMable = [
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "BODY",
  "DIV",
  "FOOTER",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "MAIN",
  "NAV",
  "P",
  "SECTION",
  "SPAN",
].reduce((acc, tag) => {
  acc[tag] = true;
  return acc;
}, {});

function camelCaseToKebabCase(str) {
  if (str === "tabIndex") return "tabindex";
  return str
    .replace(/([A-Z])/g, (m) => `-${m.toLocaleLowerCase()}`)
    .replace(/^-/, "");
}

const defaultStyles = `
  :host {
    box-sizing: border-box;
  }
  :host::before,
  :host::after,
  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }
  :host([disabled]) {
    cursor: not-allowed;
  }
`;

function constructStylesheets(prototypes) {
  return prototypes
    .slice(0)
    .reduce((acc, { styles }) => {
      if (!styles) return acc;
      const rules = [defaultStyles, styles]
        .flat(Infinity)
        .map((s) => {
          return s.toString();
        })
        .join("");

      const sheet = new CSSStyleSheet();
      sheet.replaceSync(rules);

      acc.push(sheet);
      return acc;
    }, [])
    .flat(Infinity);
}

const eventRegex = new RegExp("^on([a-z])", "i");
function isAnEvent(name) {
  return eventRegex.test(name);
}

const lifecycleMethods = [
  // "onUnmount",
  // "onAdopted",
  "constructorCallback",
  "connectedCallback",
  "disconnectedCallback",
  "adoptedCallback",
  "initialRenderCallback",

  // ----------------------------------------------------------------
  "componentWillLoad",
  "componentDidLoad",
];

window.mixins = {};

function mixin(name, logic) {
  return {
    symbol: Symbol(name),
    mixin: Object.assign(Object.create(null), logic),
  };
}

// == mixin ==
// {symbol, logic, lifecycleMethods }
// When building prototypeChain
// { [symbol]: logic }

function define(tagName, mixins = [], options = {}) {
  const { baseClass = HTMLElement, extend = undefined } = options;

  const mixinSymbols = new Set();

  // Add a default mixin that creates observable attributes for `hidden` and `disabled`.
  let prototypeChain = new Set([
    {
      props: {
        hidden: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
      },
    },
    ...mixins.map((mixin) => {
      if (Array.isArray(mixin)) {
        const [sym, mix] = mixin;
        mixinSymbols.add(sym);
        // TODO remove windows.mixins
        window.mixins[sym] = sym;
        return mix;
      } else {
        return mixin;
      }
    }),
  ]);

  // Add the specified web component to the prototype chain.
  // prototypeChain.push(componentObj);
  prototypeChain = Array.from(prototypeChain);
  const flattenedPrototype = deepmerge.all(prototypeChain);

  // TODO: Need to handle mixin pre-bound events
  const preBoundEvents = Object.keys(flattenedPrototype).reduce((acc, key) => {
    if (isAnEvent(key) && !lifecycleMethods.includes(key)) {
      acc.push(key.replace(eventRegex, "$1"));
    }
    return acc;
  }, []);

  const observedAttrs = new Set();
  const attributePropMap = new Map();

  // Covert props names to snake case attribute names (unless otherwise specified by an `attribute` in the props hash).
  Object.entries(flattenedPrototype.props).forEach((item) => {
    const [propName, { attribute }] = item;
    const attributeName = attribute || camelCaseToKebabCase(propName);
    observedAttrs.add(attributeName);
    attributePropMap.set(attributeName, propName);
  });

  const componentStylesheets = constructStylesheets(prototypeChain);

  class BlissElement extends baseClass {
    // Create element's external observable state.
    $ = observable(Object.create(null));

    [isBlissElement] = true;

    static get observedAttributes() {
      return Array.from(observedAttrs);
    }

    handleEvent(e) {
      this["on" + e.type](e);
    }

    constructor() {
      super();

      // Create each mixins' private internal state.
      mixinSymbols.forEach((sym) => {
        this[sym] = { $: observable(Object.create(null)) };
      });

      // // Convert attr prop values to correct typecast values.
      // Object.values(attributePropMap).forEach((propName) => {
      //   this.setStateValue(propName, this[propName]);
      // });

      // Do not render to shadow root if we are extending a native element and the element is not shadowDOM-able.
      if (!/-/.test(this.tagName) && !nativeShadowDOMable[this.tagName])
        this.shadow = false;

      this.bindEvents();
      if (this.constructorCallback) this.constructorCallback();
      this[componentHasLoaded] = false;
    }

    setStateValue(name, value) {
      const { type = String } = flattenedPrototype.props[name];
      let convertedValue = this.typecastValue(type, value);
      this.$[name] = convertedValue;
    }

    fireEvent(eventName, detail = {}) {
      const event = new CustomEvent(
        `${this.tagName.toLowerCase()}:${eventName}`,
        {
          detail: Object.assign(detail, { element: this }),
        }
      );
      this.dispatchEvent(event);
      document.dispatchEvent(event);
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();

      // Convert all props to reflected attributes.
      this.convertPropsToAttributes();

      this.fireEvent("connectedCallback");
      this.renderToRoot();
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) super.disconnectedCallback();
      this.fireEvent("disconnectedCallback");
    }

    adoptedCallback() {
      if (super.adoptedCallback) super.adoptedCallback();
      this.fireEvent("adoptedCallback");
    }

    typecastValue(type, value) {
      if (type === Boolean) {
        return [null, undefined, false, "false"].includes(value) ? false : true;
      } else if (type === Number) {
        return Number(value);
      } else if (type === BigInt) {
        return BigInt(value);
      } else {
        let val;
        try {
          val = JSON.parse(value);
        } catch (e) {
          val = String(value);
        }
        return val;
      }
    }

    // Update state when attributes change.
    attributeChangedCallback(name, oldValue, newValue) {
      if (super.attributeChangedCallback) super.attributeChangedCallback();

      const propName = attributePropMap.get(name);
      this.setStateValue(propName, newValue);
      const { type = String } = flattenedPrototype.props[propName];
      let convertedValue = this.typecastValue(type, newValue);
      this.$[propName] = convertedValue;
    }

    // Any event (essentially any property or attribute that starts with "on...")
    // is pre-bound so that its "this" is the custom element's host node.
    bindEvents() {
      // TODO: i'm sure there was a reason, but why???
      preBoundEvents.forEach((event) => {
        this.addEventListener(event, this);
      });
    }

    // Convert properties to strings and set as attributes.
    // Based on `$` (state) so values are reactive.
    convertPropsToAttributes() {
      Object.entries(flattenedPrototype.props).forEach(([prop, value]) => {
        const converter = value.type || String;
        if (converter === Function) return;

        // Set initial prop values based on default value of prop.
        if (typeof this[prop] === "undefined") {
          this[prop] = this.typecastValue(converter, value.default);
        }

        if (value.reflect === false) return;

        const attributeName = value.attribute || camelCaseToKebabCase(prop);

        // Observe update state keys, and set attributes appropriately.
        observe(() => {
          let convertedValue =
            this.$[prop] == null
              ? null
              : this.typecastValue(converter, this.$[prop]); //converter(this.$[prop]);

          if (convertedValue == null || convertedValue === false) {
            this.removeAttribute(attributeName);
          } else if (convertedValue === true) {
            this.setAttribute(attributeName, "");
          } else if (converter === Array) {
            convertedValue = Array.from(this.$[prop]);
            this.setAttribute(attributeName, JSON.stringify(convertedValue));
          } else {
            this.setAttribute(attributeName, convertedValue);
          }
        });

        // Set inintial default values.
        this.$[prop] =
          typeof this[prop] === "undefined"
            ? flattenedPrototype.props[prop].default
            : this[prop];
      });
    }

    renderToRoot() {
      if (this.shadow === false || !this.render) return;

      let rootNode =
        this.shadowRoot ||
        this.attachShadow({ mode: this.shadowClosed ? "closed" : "open" });
      rootNode.adoptedStyleSheets = componentStylesheets;

      observe(async () => {
        if (!this[componentHasLoaded]) {
          // `componentWillLoad` can return a promise, which will then delay rendering until resolved.
          // `componentWillLoad` can return either a bare promise, or an object with { promise, placeholder?, error?: {message?, callback?} } defined.
          // Placeholder will be shown until such time as promise resolves. Error will be shown if the promize ever rejects.
          if (this.componentWillLoad) {
            const willLoad = this.componentWillLoad();
            const promise = willLoad.promise || willLoad;
            const placeholder = willLoad.placeholder;
            const { message: errorMessage, callback: errorCallback } =
              willLoad.error;
            if (placeholder) {
              render(rootNode, placeholder);
            }
            try {
              await promise;
              this.fireEvent("componentWillLoad");
            } catch (e) {
              if (errorMessage) render(rootNode, errorMessage);
              if (errorCallback) errorCallback.call(this);
              return;
            }
          }
        }

        render(rootNode, await this.render());

        if (!this[componentHasLoaded]) {
          queueMicrotask(() => {
            if (this.componentDidLoad) this.componentDidLoad();
            this[componentHasLoaded] = true;
            this.fireEvent("componentDidLoad");
            if (this.initialRenderCallback) this.initialRenderCallback();
          });
        }
      });
    }

    // // Bliss elements are just "bags of state" that happen to render something on the screen.
    // // Any bliss element can access any parent bliss element's publicly available methods, properties, etc.
    // // by calling `elem.getContext(matcher)` where `matcher` is a valid CSS selector (tag name, id, class, etc.).
    // // An element can have access to more than one parent node's contexts at any time.
  }

  // Build up our web component's prototype.
  Reflect.ownKeys(flattenedPrototype).forEach((key) => {
    const value = flattenedPrototype[key];
    if (typeof key === "symbol") {
      const mixinProto = value;
      Reflect.ownKeys(mixinProto).forEach((mixinKey) => {
        const value = mixinProto[mixinKey];
        buildProperty({ key: mixinKey, value, symbol: key });
      });
    } else {
      buildProperty({ key, value });
    }
  });

  function buildProperty({ key, value, symbol }) {
    console.log({ key, value, symbol });
    if (typeof value === typeof Function) {
      if (lifecycleMethods.includes(key)) {
        const originalFn = BlissElement.prototype[key];
        BlissElement.prototype[key] = function (args) {
          if (originalFn) originalFn.call(this, args);
          value.call(this, args);
        };
      } else if (isAnEvent(key)) {
        // If a mixin has an event defined on it, simply ignore it. The event will need to be moved
        // outside of the symbol namespaced area, or, alternately, simply named something else and then
        // called within the `on[event]` method outside the symbol namespaced area.
        if (symbol) {
          console.warn(
            `Mixin ${symbol.toString()} has event "${key}" defined within its namespace. Events can only be defined outside of namespaced sections. Please move the event to the non-namespaced section of the mixin.`
          );
          return;
        }

        // Events are handled in a special way on HTMLElement. This is because HTMLElement is a function, not an object.

        Object.defineProperty(BlissElement.prototype, key, {
          value: value,
          enumerable: true,
          configurable: true,
        });
      } else {
        BlissElement.prototype[key] = value;
      }
    } else {
      BlissElement.prototype[key] = value;
    }
  }

  // Create getter/setter for any observed attribute, and make `$[prop] === this[prop]`.
  Object.keys(flattenedPrototype.props).forEach((key) => {
    if (flattenedPrototype.props[key] != null) {
      Object.defineProperty(BlissElement.prototype, key, {
        get() {
          return this.$[key];
        },
        set(value) {
          this.$[key] = value;
          return value;
        },
        enumerable: true,
        configurable: true,
      });
    }
  });

  customElements.define(tagName, BlissElement, { extends: extend });
}

export { define, html, svg, observable, observe, unobserve, raw, render };

// TODO: Need to ensure that:
// 1) Mixin methods can be overriden
// 2) Mixin methods can also be additive
