import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { store, view } from "@risingstack/react-easy-state";
// import retargetEvents from "react-shadow-dom-retarget-events";
import deepmerge from "deepmerge";

import { observable, observe, raw } from "@nx-js/observer-util";
import { render, html, svg } from "uhtml";

// Polyfills
import "construct-style-sheets-polyfill"; // Non-Chromium
import "@ungap/custom-elements"; // Safari

const RenderFn = ({ host }) => {
  useEffect(() => {
    ReactDOM.createPortal(host, document.body);
  });

  return (
    <div onClick={() => console.log("clicked on div")}>
      <h2>My Elem</h2>
      <h3>light DOM</h3>
      <slot></slot>
      <h3>shadow DOM</h3>
      <p>My elem: {host.$.name}</p>
      {/* <button onClick={handleClick}>change</button> */}
      {/* {ReactDOM.createPortal(<h1>Liftedup</h1>, document.body)} */}
    </div>
  );
};

// const Stars = new WeakMap();
// window.Stars = Stars;
// const Astrid = new WeakMap();
// window.Astrid = Astrid;
const Constellations = new Map();
window.Constellations = Constellations;

// TODO: We need to determine when a constellation will be defined. At connectedCallback is most likely. If that's the case though, then we need to cache it so it's not found on a second connectedCallback (say because the element is moved) then we don't end up with an empty state.

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

function pascalCaseToSnakeCase(str) {
  if (str === "tabIndex") return "tabindex";
  return str
    .replace(/([A-Z])/g, (m) => `-${m.toLocaleLowerCase()}`)
    .replace(/^-/, "");
}

const defaultStyles = `
  :host {
    box-sizing: border-box;
  }
  :host:before,
  :host:after,
  :host *,
  :host *:before,
  :host *:after {
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

  // ----------------------------------------------------------------
  "componentWillRender",
  "componentDidRender",
];

// const globalContext = new Set();
// window.globalContext = globalContext;

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

const instanceLifecycles = new WeakMap();

function define(tagName, mixins, options = {}) {
  const { baseClass = HTMLElement, extend = undefined } = options;

  const mixinSymbols = new Set();
  // console.log({ tagName, mixins, mixinSymbols });
  // debugger;

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

  Object.entries(flattenedPrototype.props).forEach((item) => {
    const [propName, { attribute }] = item;
    const attributeName = attribute || pascalCaseToSnakeCase(propName);
    observedAttrs.add(attributeName);
    attributePropMap.set(attributeName, propName);
  });

  const componentStylesheets = constructStylesheets(prototypeChain);

  const createConstellationSym = Symbol("createConstellation");
  const supernovaSym = Symbol("supernova");

  class BlissElement extends baseClass {
    $ = store(Object.create(null));

    [isBlissElement] = true;

    static get observedAttributes() {
      return Array.from(observedAttrs);
    }

    handleEvent(e) {
      this["on" + e.type](e);
    }

    constructor() {
      super();

      this[createConstellationSym]();

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

    // Create a constellation of all elements which reference the internal state of this element.
    [createConstellationSym]() {
      if (!Constellations.has(this.$)) {
        Constellations.set(this.$, new Set([this]));
      }
    }

    // Associate a specific element's state with unique symbol, and store that reference within `this` element's state.
    cluster({ key, element }) {
      if (key in this.$)
        throw new Error(
          "Constellation cannot be created: Key already exists in state.\nPlease specify a different name for the key, or, alternately, use a Symbol instead for truly unique names."
        );

      if (!element)
        throw new Error(
          "Constellation cannot be created: Element could not be found."
        );

      if (element.$) {
        this.$[key] = element.$;
        Constellations.get(element.$).add(this);
      } else {
        console.error(
          new Error("Element specified is not a constellation element.")
        );
      }
    }

    // Delete this element from any constellation whose state the element was referencing.
    // Ensures that if no element is using an constellation's state, then the constellation is
    // destroyed. This prevents memory leaks when elements are being created/destroyed and
    // sharing lots of data.
    [supernovaSym]() {
      const entries = Constellations.entries();
      for (let [key, asterism] of entries) {
        asterism.delete(this);

        if (Constellations.get(key).size === 0) {
          Constellations.delete(key);
        }
      }
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

    triggerInstanceLifecycle(lifecycleEvent) {
      if (instanceLifecycles.has(this)) {
        const instanceFn = instanceLifecycles.get(this)[lifecycleEvent];
        if (instanceFn) instanceFn.call(this);
      }
    }

    setInstanceLifecycles(obj) {
      instanceLifecycles.set(this, obj);
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();

      this[createConstellationSym]();

      // Set implicit slot name.
      this.slot =
        this.getAttribute("is") ||
        (this.hasAttribute("slot")
          ? this.getAttribute("slot")
          : this.tagName.toLowerCase()
        ).replace(/^.*?-/, "");

      // Convert all props to reflected attributes.
      this.convertPropsToAttributes();

      this.triggerInstanceLifecycle("connectedCallback");

      this.fireEvent("connectedCallback");
      this.renderToRoot();
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) super.disconnectedCallback();
      this.fireEvent("disconnectedCallback");

      this[supernovaSym]();
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
        // if (value && stringIsObject.test(value)) {
        //   try {
        //     return JSON.parse(value);
        //   } catch (e) {
        //     console.error(e);
        //     return {};
        //   }
        // } else {
        //   return String(value);
        // }
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
      preBoundEvents.forEach((event) => {
        this.addEventListener(event, this);
      });
    }

    // Convert properties to strings and set on attributes.
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

        const attributeName = value.attribute || pascalCaseToSnakeCase(prop);

        // Observe update state keys, and set attributes appropriately.
        view(() => {
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

    // renderToRoot2() {
    //   if (this.shadow === false || !this.render) return;

    //   let rootNode =
    //     this.shadowRoot ||
    //     this.attachShadow({ mode: this.shadowClosed ? "closed" : "open" });
    //   rootNode.adoptedStyleSheets = componentStylesheets;

    //   observe(async () => {
    //     if (!this[componentHasLoaded]) {
    //       // `componentWillRender` can return a promise, which will then delay rendering until resolved.
    //       // `componentWillRender` can return either a bare promise, or an object with { promise, placeholder?, error?: {message?, callback?} } defined.
    //       // Placeholder will be shown until such time as promise resolves. Error will be shown if the promize ever rejects.
    //       if (this.componentWillRender) {
    //         const willLoad = this.componentWillRender();
    //         const promise = willLoad.promise || willLoad;
    //         const placeholder = willLoad.placeholder;
    //         const { message: errorMessage, callback: errorCallback } =
    //           willLoad.error;
    //         if (placeholder) {
    //           render(rootNode, placeholder);
    //         }
    //         try {
    //           await promise;
    //           this.fireEvent("componentWillRender");
    //         } catch (e) {
    //           if (errorMessage) render(rootNode, errorMessage);
    //           if (errorCallback) errorCallback.call(this);
    //           return;
    //         }
    //       }
    //     }

    //     render(rootNode, await this.render());

    //     if (!this[componentHasLoaded]) {
    //       queueMicrotask(() => {
    //         if (this.componentDidRender) this.componentDidRender();
    //         this[componentHasLoaded] = true;
    //         this.fireEvent("componentDidRender");
    //       });
    //     }
    //   });
    // }

    renderToRoot() {
      let rootNode =
        this.shadowRoot ||
        this.attachShadow({ mode: this.shadowClosed ? "closed" : "open" });

      // NOTE: This seems to make events fire twice all the time. Not exactly
      // retargetEvents(this.shadowRoot);

      observe(() => {
        ReactDOM.render(
          <React.StrictMode>
            {/* <RenderFn host={this} /> */}
            {/* {React.createElement(RenderFn, { host: this }, null)} */}

            {React.createElement(this.render, { host: this }, null)}
            {/* {this.render.call(this, { host: this })} */}
            {/* {RenderFn({ host: this })} */}
          </React.StrictMode>,
          rootNode
        );
      });
    }

    // Bliss elements are just "bags of state" that happen to render something on the screen.
    // Any bliss element can access any parent bliss element's publicly available methods, properties, etc.
    // by calling `elem.getContext(matcher)` where `matcher` is a valid CSS selector (tag name, id, class, etc.).
    // An element can have access to more than one parent node's contexts at any time.
    getContext(matcher) {
      if (typeof matcher === "string") {
        let node = this;
        let ctx;
        while (!ctx && node.parentElement) {
          node = node.parentElement;
          if (node[isBlissElement] && node.matches(matcher)) ctx = node;
        }
        if (node && document.documentElement !== node) return node;
        throw new Error(
          `A context that matches "${matcher}" could not be found for <${this.tagName.toLowerCase()}>.`
        );
      } else if (matcher.nodeType) {
        return matcher;
      }
    }
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
    // console.log({ key, value, symbol });
    if (typeof value === typeof Function) {
      if (lifecycleMethods.includes(key)) {
        const originalFn = BlissElement.prototype[key];
        BlissElement.prototype[key] = function (args) {
          if (originalFn) originalFn.call(this, args);
          value.call(this, args);
        };
      } else if (isAnEvent(key)) {
        // // If a mixin has an event defined on it, simply ignore it. The event will need to be moved
        // // outside of the symbol namespaced area, or, alternately, simply named something else and then
        // // called within the `on[event]` method outside the symbol namespaced area.
        // if (symbol) {
        //   console.warn(
        //     `Mixin ${symbol.toString()} has event "${key}" defined within its namespace. Events can only be defined outside of namespaced sections. Please move the event to the non-namespaced section of the mixin.`
        //   );
        //   return;
        // }
        // // Events are handled in a special way on HTMLElement. This is because HTMLElement is a function, not an object.
        // Object.defineProperty(BlissElement.prototype, key, {
        //   value: value,
        //   enumerable: true,
        //   configurable: true,
        // });
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

// export { define, html, svg, observable, observe, raw, render };
export { define, store, view };

// TODO: Need to ensure that:
// 1) Mixin methods can be overriden
// 2) Mixin methods can also be additive
