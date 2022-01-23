import { html, define, observe, observable, raw } from "./src/index";
import {
  symbol as keyboardNavigableSymbol,
  mixin as keyboardNavigable,
} from "./src/mixins/keyboardNavigable";

import {
  tabbableSymbol,
  tabbable,
  tabsElementSymbol,
} from "./src/mixins/tabbable";

const Tabs = {
  styles: `
    :host nav {
      display: inline-flex;
    }
  `,
  props: {
    activeTab: { type: Number },
  },
  // constructorCallback() {
  //   console.log("CONSTRUCTOR", this);
  //   debugger;
  // },
  // componentWillLoad() {
  //   return {
  //     promise: new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         resolve("aoeu");
  //       }, 3000);
  //     }),
  //     placeholder: html`FOO BAR`,
  //     error: {
  //       message: html`This is an error`,
  //       callback: function () {
  //         console.log("ERROR", this);
  //       },
  //     },
  //   };
  // },
  // componentDidLoad() {
  //   debugger;
  // },
  connectedCallback() {
    observe(() => {
      this.$.activeTab = this.$.activeTab ?? 0;
    });
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
define("bliss-tabs", Tabs);

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
    :host(:not(:nth-of-type(1))) {
      margin-left: 1rem;
    }
  `,
  render() {
    return html`<slot></slot>`;
  },
  onclick(e) {
    if (!this.$.disabled) {
      this[tabsElementSymbol].$.activeTab = this[tabbableSymbol].index;
    }
  },
};
define("bliss-tab", Tab, {
  mixins: [tabbable("bliss-tabs"), keyboardNavigable],
});

const TabContent = {
  connectedCallback() {
    observe(() => {
      const activeIsNotHost =
        this[tabsElementSymbol].$.activeTab !== this[tabbableSymbol].index;
      this.$.hidden = activeIsNotHost;
    });
  },
  render() {
    return html`<slot></slot>`;
  },
};
define("bliss-tab-content", TabContent, { mixins: tabbable("bliss-tabs") });

const AlertButton = {
  onclick() {
    alert("You have been alerted");
  },
};
define("bliss-alert-button", AlertButton, {
  base: HTMLButtonElement,
  extend: "button",
});

// const Foo = (mixins) => {
//   const {m}
//   return {}
// }

const Clicky = {
  name: "Clicky",
  $: observable({ name: "Clicky" }),
  foo() {
    alert("Clicky:FOO");
  },
};
function useMixin(mixin) {
  const sym = Symbol();
  // window.sym = sym;
  return function (obj) {
    obj[sym] = mixin;
    return sym;
  };
}

const useClicky = useMixin(Clicky);

// console.log(useClicky({ a: "apple" }));

// const Box = ((host = Object.create(null)) => {
//   host.name = "box";
//   console.log("this", host);
//   const clicky = useClicky(host);
//   return host;
// })();

function component(args) {
  const host = Object.create(null, ...args);
}

// const Box = ((baseElement = HTMLElement) => {
//   const host = Object.create(null);
//   host.name = "box";
//   console.log("this", host);
//   const clicky = useClicky(host);
//   return Object.assign(Object.create(null), baseElement, mixins, host);
// })(mixins);

// console.log(Box);

// function Box() {
//   useMixin(obj, Clicky);

//   // return Object.assign(Object.create(null), obj, {
//   //   foo: 4,
//   //   // [isClicky]: Clicky,
//   // });
// }

// // const Box = useMixin(Clicky, {
// //   name: "Box",
// // });

// window.box = Box;
// debugger;
