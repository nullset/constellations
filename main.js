import { html, define, observe, observable, raw } from "./src/index";
// import {
//   symbol as keyboardNavigableSymbol,
//   mixin as keyboardNavigable,
// } from "./src/mixins/keyboardNavigable";

// import {
//   // tabbableSymbol,
//   tabbable,
//   tabsElementSymbol,
//   self as tabbableSym,
// } from "./src/mixins/tabbable";

// const Tabs = {
//   styles: `
//     :host nav {
//       display: inline-flex;
//     }
//   `,
//   props: {
//     activeTab: { type: Number },
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
//   connectedCallback() {
//     observe(() => {
//       this.$.activeTab = this.$.activeTab ?? 0;
//     });
//   },
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

// const Tab = {
//   styles: `
//     :host {
//       border-bottom: 2px solid transparent;
//       cursor: pointer;
//     }
//     :host([active]) {
//       border-bottom-color: blueviolet;
//     }
//     :host([disabled]) {
//       opacity: 0.5;
//     }
//     :host(:not(:nth-of-type(1))) {
//       margin-left: 1rem;
//     }
//   `,
//   render() {
//     return html`<slot></slot>`;
//   },
//   onclick(e) {
//     if (!this.$.disabled) {
//       this[tabbableSym].tabsElement.$.activeTab = this[tabbableSym].$.index;
//     }
//   },
// };
// define("bliss-tab", [Tab], {
//   // mixins: [tabbable("bliss-tabs"), keyboardNavigable],
// });

// const TabContent = {
//   connectedCallback() {
//     console.log(tabbableSym, this[tabbableSym]);
//     debugger;
//     observe(() => {
//       const activeIsNotHost =
//         this[tabbableSym].tabsElement.$.activeTab !== this[tabbableSym].$.index;
//       this.$.hidden = activeIsNotHost;
//     });
//   },
//   render() {
//     return html`<slot></slot>`;
//   },
// };
// // define("bliss-tab-content", TabContent, {
// //   mixins: [tabbable("bliss-tabs")],
// // });
// define("bliss-tab-content", [tabbable("bliss-tabs"), TabContent]);

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
    return html`<div>My elem: ${this.$[fooableSym].test}</div>`;
  },
  onclick() {
    this.$[fooableSym].test = this.$[fooableSym].test + 1;
  },
};
define("my-elem", [fooable(), MyElem]);

const myElemSym = Symbol("MyElem");
const OtherElem = {
  props: {
    name: { type: String, default: "OtherElem" },
  },
  connectedCallback() {
    this.constellate({ key: "MyElem", element: this.previousElementSibling });
  },
  render() {
    const state = this.previousElementSibling.$;
    return html`Other: ${state[fooableSym].test}`;
  },
};
define("other-elem", [OtherElem]);

const ThirdElem = {
  props: {
    name: { type: String, default: "ThirdElem" },
  },
  connectedCallback() {
    // this.constellate({ key: "MyElem", element: this.previousElementSibling });
  },
  render() {
    // const state = this.previousElementSibling.$;
    return html`Third ELEM `;
  },
};
define("third-elem", [OtherElem, ThirdElem]);

const EverythingElem = {
  props: {
    slot: { type: String, default: undefined },
    bar: { type: Number, default: 33 },
  },
  connectedCallback() {
    this.$.monkey = "Ceasar";
  },
  handleSlotChange(e) {
    function myTag(strings, ...placeholders) {
      debugger;
    }

    const host = e.target.getRootNode().host;

    e.target.assignedElements().forEach((template) => {
      const clone = template.content.cloneNode(true);
      const xs = clone.querySelectorAll("x");
      xs.forEach((x) => {
        let text = x.innerText.trim();
        text = /^return\s/.test(text) ? text : `return ${text}`;
        const func = new Function("html", text);
        const elems = func.call(host, html);
        elems ? x.replaceWith(elems) : x.remove();
      });

      host.appendChild(clone);
    });

    // e.target.assignedElements().forEach((template) => {
    //   debugger;
    //   const clone = template.content.cloneNode(true);
    //   let walker = document.createTreeWalker(clone, NodeFilter.SHOW_ALL);

    //   let node = walker.firstNode();

    //   // const scripts = clone.querySelectorAll("script");
    //   // Array.from(scripts).map((script) => {
    //   //   // myTag`${myTag`script.text)}`;
    //   //   // const func = new Function("`${script.text}`");
    //   //   // console.log(myTag(func.call(this)));
    //   //   // const h = html.call(script.text);
    //   //   const text = myTag`${script.text}`;
    //   //   debugger;
    //   //   // // const func = new Function(script.text);
    //   //   // script.text = `
    //   //   //   const script = document.currentScript;
    //   //   //   const host = script.getRootNode().host;
    //   //   //   debugger;
    //   //   //   const func = new Function(${script.text});
    //   //   //   func.call(host);
    //   //   //   alert(1);
    //   //   // `;
    //   //   // return script;
    //   // });

    //   // debugger;
    //   // host.append(clone);
    // });
  },
  handleScriptSlotChange(e) {
    // function myTag(strings, ...placeholders) {
    //   const N = placeholders.length;
    //   let out = '';
    //   for (let i=0; i<N;i++) {
    //    out += strings[i] + placeholders[i];
    //   }
    //   out += strings[N];
    //   return out;
    // }

    const host = e.target.getRootNode().host;

    const script = e.target.assignedElements()[0].text;
    // const func = new Function("env", script)(this);
    const func = new Function(script);
    func.call(host);
  },
  render() {
    return html`
      <slot name="render" onslotchange=${this.handleSlotChange}></slot>
      <slot name="script" onslotchange=${this.handleScriptSlotChange}></slot>
      <slot></slot>
    `;
  },
};
define("e-e", [EverythingElem]);
