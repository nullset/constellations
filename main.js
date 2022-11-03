import {
  html,
  define,
  observe,
  unobserve,
  observable,
  raw,
  render,
  // foreign,
  // ref,
} from "./src/index";
import { keyboardNavigable } from "./src/mixins/keyboardNavigable";
import { tabbable, symbol as tabbableSym } from "./src/mixins/tabbable";
import DOMPurify from "dompurify";

// const Tabs = {
//   styles: `
//     :host nav {
//       display: inline-flex;
//       gap: 1rem;
//     }
//   `,
//   props: {
//     activeTab: { type: Number, default: 0 },
//   },
//   // constructorCallback() {
//   //   console.log("CONSTRUCTOR", this);
//   //   debugger;
//   // },
//   // componentWillLoad() {
//   //   return {
//   //     promise: new Promise((resolve, reject) => {
//   //       setTimeout(() => {
//   //         resolve("aoeu");
//   //       }, 3000);
//   //     }),
//   //     placeholder: html`FOO BAR`,
//   //     error: {
//   //       message: html`This is an error`,
//   //       callback: function () {
//   //         console.log("ERROR", this);
//   //       },
//   //     },
//   //   };
//   // },
//   // componentDidLoad() {
//   //   debugger;
//   // },
//   render() {
//     return html`
//       ${this.$.activeTab}
//       <nav part="tabs">
//         <slot name="tab"></slot>
//       </nav>
//       <div part="content">
//         <slot name="tab-content"></slot>
//       </div>
//     `;
//   },
// };
// define("bliss-tabs", [Tabs]);

const TabNumber = {
  props: {
    foo: { type: Number },
  },
  componentDidLoad() {
    const prevElem = this.previousElementSibling;
    // -- DOES NOT WORK
    // this.$.foo = prevElem.$.activeTab;

    // this.$.foo = observable(prevElem.$.activeTab);
    // debugger;

    observe(() => {
      // WORKS -- Make it a computed
      this.$.foo = prevElem.$.activeTab;
    });

    // this.$listen = function (savesTo, listenTo, path) {
    //   const paths = path.split(".");
    //   observe(() => {
    //     debugger;
    //     this.$[savesTo] = listenTo;
    //   });
    // };
    //
    // this.$listen("bar", prevElem, "$.activeTab");

    // debugger;
    Object.defineProperty(this.$, "baz", {
      get() {
        return prevElem.$.activeTab;
      },
    });

    this.$listen = (prop, state, origProp) => {
      Object.defineProperty(this.$, prop, {
        get() {
          return state[origProp];
        },
      });
    };

    this.$listen("moo", prevElem.$, "activeTab");

    // this.$.blah = observe(() => {
    //   return 44;
    // });
  },
  render() {
    return html`<b style="font-size: 4em">
      ${this.$.foo} <span style="color: red">${this.$.bar}</span>
    </b>`;
  },
};
define("bliss-tab-number", [TabNumber]);

const Tabs = {
  styles: `
    :host nav {
      display: inline-flex;
      gap: 1rem;
    }
  `,
  props: {
    activeTab: { type: Number, default: 0 },
  },
  render() {
    return html`
      ${this.$.activeTab}
      <nav part="tabs">
        <slot name="tab"></slot>
      </nav>
      <div part="content">
        <slot name="tab-content"></slot>
      </div>
    `;
  },
};
define("bliss-tabs", [Tabs]);

const Tab = {
  styles: `
    :host {
      border-bottom: 2px solid transparent;
      cursor: pointer;
    }
    :host([active]) {
      border-bottom-color: blueviolet;
    }
    :host([disabled]) {
      opacity: 0.5;
    }
  `,
  render() {
    return html`<slot></slot>`;
  },
  onclick(e) {
    if (!this.$.disabled) {
      this[tabbableSym].root.$.activeTab = this[tabbableSym].index;
    }
  },
};
define("bliss-tab", [tabbable("bliss-tabs"), keyboardNavigable(), Tab]);

const TabContent = {
  styles: `
  :host(:not([active])) {
    display: none;
  }
`,
  render() {
    return html`<slot></slot>`;
  },
};
define("bliss-tab-content", [tabbable("bliss-tabs"), TabContent]);

import { self as fooableSym, fooable } from "./src/mixins/fooable";
window.fb = fooableSym;

const MyElem = {
  props: {
    name: { type: String, default: "MySuperElem" },
  },
  constructorCallback() {
    console.log("constructorCallback: MyElem");
  },
  connectedCallback() {
    console.log("connectedCallback: MyElem");
  },
  render() {
    return html`<div>
      My elem: ${this.$.name} :: ${this.$[fooableSym].test}
    </div>`;
  },
  onclick() {
    this.$[fooableSym].test = this.$[fooableSym].test + 1;
  },
};

const cacheSym = Symbol("cacheSym");
const disconnectedCallbackSym = Symbol("disconnectedCallbackSym");

// TODO: Can RenderElem import 3rd party libraries??
const RenderElem = {
  // shadowClosed: true,  // FIXME: if we set to true, then $ reactions don't seem to work.
  props: {
    slot: { type: String, default: undefined },
    isolate: { type: Boolean, default: false },
    bar: { type: Number, default: 33 },
    uuid: { type: String },
  },
  scopeStyles() {
    const host = this;
    this.uuid = `${this.tagName}--${Array.from(
      document.querySelectorAll(this.tagName)
    ).indexOf(this)}`;

    if (this.styles) {
      // Read the styles and scope them to this element instance.
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(this.styles);
      Object.values(sheet.cssRules).forEach((value) => {
        value.selectorText = value.selectorText.replace(
          /((?:(["'])(\\.|(?!\1)[^\\])*\1|\[(?:(["'])(\\.|(?!\2)[^\\])*\2|[^\]])*\]|\((?:(["'])(\\.|(?!\3)[^\\])*\3|[^)])*\)|[^,])+)/g,
          (match) => {
            match = match.trim();
            if (/^:host/.test(match)) {
              // Replace any :host or :host(...) values with correctly scoped CSS.
              return match.replace(
                /(:host)\((.*?)\)/,
                `${host.tagName.toLowerCase()}[uuid="${host.uuid}"]$2`
              );
            } else {
              // Otherwise scope all style rules by the uuid.
              return `${host.tagName.toLowerCase()}[uuid="${
                host.uuid
              }"] ${match}`;
            }
          }
        );
      });

      // FIXME: Technically this shouldn't be necessary, but is included to fix a bug in Safari 15.6 (and perhaps other versions).
      // While Safari does take the above code and correctly update the `selectorText` value, somehow it manges the scoped styling when applying it to the document and instead applies all of the styles to the `:root`, which is beyond broken, because it's both something that would not happen with the original selectors AND not happen with the updated selectors. ~IE~ ... I mean Safari ... should really up their game.
      let styles = "";
      Object.values(sheet.cssRules).forEach((value) => {
        styles += value.cssText;
      });
      const scopedSheet = new CSSStyleSheet();
      scopedSheet.replaceSync(styles);

      // Adopt the stylesheet so it is applied.
      host.getRootNode().adoptedStyleSheets = [scopedSheet];
    }
  },
  connectedCallback() {
    this[cacheSym] = undefined;
    this.$.refs = {};
    this.$.monkey = "Ceasar";

    this.scopeStyles();
  },

  disconnectedCallback() {
    // TODO: Test me!
    if (this[disconnectedCallbackSym]) this.disconnectedCallback.call(this);
  },
  handleSlotChange(e) {
    const script = e.target
      .assignedElements()
      .find((e) => e.tagName === "SCRIPT");
    if (!script) return;

    const text = script.innerText.trim();

    // If the script's text hasn't been updated, no need to re-render.
    if (this[cacheSym] === text) {
      script.remove();
      return;
    }

    // The script's text HAS been updated, so throw away existing DOM and re-render.
    // Note that state is maintained across re-rerenders, even if DOM is not.
    this[cacheSym] = text;

    const host = e.target.getRootNode().host;
    const frag = new DocumentFragment();

    // console.log({ text });
    // const obj = {
    //   render: new Function(
    //     "html",
    //     "observe",
    //     "unobserve",
    //     `return ${text};`
    //   ).call(host, html, observe, unobserve)(),
    // };
    const blissObj = new Function(
      "html",
      "observe",
      "unobserve",
      `return ${text};`
    ).call(host, html, observe, unobserve)();

    const proxiedHost = Object.assign(host, blissObj);

    // Bind all functions to have their `this` be the host element.
    Object.entries(blissObj).forEach(([key, value]) => {
      if (typeof value === "function") {
        proxiedHost[key] = proxiedHost[key].bind(proxiedHost);
      }
    });

    // Call any specified `connectedCallback` function.
    proxiedHost.connectedCallback && proxiedHost.connectedCallback();

    observe(() => {
      render(frag, proxiedHost.render.call(proxiedHost, html));
    });

    if (host.isolate) {
      const defaultSlot = e.target
        .getRootNode()
        .querySelector("slot:not([name])");
      defaultSlot.replaceChildren(frag);
      // Mut remove all innerHTML content or the shadow DOM default will not show.
      host.innerHTML = "";
    } else {
      host.replaceChildren(frag);
    }
  },
  styles: `
    :host([isolate]) *, :host([isolate]) *::before, :host([isolate]) *::after {
      all: initial;
      box-sizing: border-box;
    }
    * {
      color: orange;
      box-sizing: border-box;
    }
  `,
  render() {
    return html`
      <slot name="script" onslotchange=${this.handleSlotChange}></slot>
      <slot></slot>
    `;
  },
};
define("r-1", [RenderElem]);

const Sanitize = {
  connectedCallback() {
    const clone = this.content.cloneNode(true);
    const sanitized = DOMPurify.sanitize(clone, {
      CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: /^aha-/,
        allowCustomizedBuiltInElements: true,
      },
    });
    this.replaceWith(
      document.createRange().createContextualFragment(sanitized)
    );
  },
  render() {
    debugger;
    return html`<slot></slot>`;
  },
};
define("bliss-sanitize", [Sanitize], {
  extend: "template",
  baseClass: HTMLTemplateElement,
});
