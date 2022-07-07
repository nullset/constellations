import React, { useCallback, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { define, view, observe } from "./src/index";

const MyElem = {
  props: {
    foo: { type: String, value: "MySuperElem" },
    // counter: { type: Object },
  },
  // constructorCallback() {
  //   console.log("constructorCallback: MyElem");
  // },
  // connectedCallback() {
  //   console.log("connectedCallback: MyElem");
  // },
  // handleClick(e) {
  //   console.log(this, e);
  //   debugger;
  // },
  // onclick() {
  //   debugger;
  //   console.log("click on <my-elem>");
  // },
  render({ host }) {
    // debugger;
    const handleClick = (e) => {
      console.log(host, e);
      // debugger;
      // this.$.name = "foo";
    };

    // FIXME: This throws an error.
    // host.onclick = () => {
    //   console.log("my elem : click");
    // };

    // const handleChange = (event) => setGreeting(event.target.value);
    host.onclick = () => {
      console.log("host.onclick", this);
    };

    useEffect(() => {
      ReactDOM.createPortal(host, document.body);
    });

    if (host.$.foo === 0) {
      return <div>I am zero</div>;
    } else {
      return (
        <div onClick={() => console.log("clicked on div")}>
          <h2>My Elem</h2>
          <h3>light DOM</h3>
          <slot></slot>
          <h3>shadow DOM</h3>
          <p>My elem: {host.$.name}</p>
          <button onClick={handleClick}>change</button>
          <h3>Children</h3>
          {/* {ReactDOM.createPortal(<h1>Liftedup</h1>, document.body)} */}
        </div>
      );
    }
  },
};
define("my-elem", [MyElem]);

const Portal = {
  props: {
    active: { type: Boolean, value: false },
  },
  connectedCallback() {
    // observe(() => {
    //   if (this.active) {
    //     this.childNodes.forEach((child) => {
    //       ReactDOM.render(
    //         ReactDOM.createPortal(<div>{child}</div>, document.body),
    //         this.shadowRoot
    //       );
    //     });
    //   } else {
    //   }
    // });
  },
  handleSlotChange(e) {
    debugger;
  },
  render({ host, children, active }) {
    const slotRef = useCallback((slot) => {
      slot.onslotchange = (e) => {
        const clones = Array.from(host.childNodes).map((node) => {
          const clone = node.cloneNode(true);
          ["mouse"];
          clone.onclick = (event) => {
            const eventOpts = Object.create(null);

            // const keys = [
            //   "altKey",
            //   "bubbles",
            //   "button",
            //   "buttons",
            //   "cancelable",
            //   "clientX",
            //   "clientY",
            //   "composed",
            //   "ctrlKey",
            //   "detail",
            //   "height",
            //   "isPrimary",
            //   "metaKey",
            //   "modifierAltGraph",
            //   "modifierCapsLock",
            //   "modifierFn",
            //   "modifierFnLock",
            //   "modifierHyper",
            //   "modifierNumLock",
            //   "modifierScrollLock",
            //   "modifierSuper",
            //   "modifierSymbol",
            //   "modifierSymbolLock",
            //   "movementX",
            //   "movementY",
            //   "pointerId",
            //   "pointerType",
            //   "pressure",
            //   "relatedTarget",
            //   "screenX",
            //   "screenY",
            //   "shiftKey",
            //   "tangentialPressure",
            //   "tiltX",
            //   "tiltY",
            //   "twist",
            //   "view",
            //   "width",
            // ];
            // keys.forEach((key) => (eventOpts[key] = event[key]));

            function EventModifier(evt, obj = {}) {
              const proxy = new Proxy(evt, {
                get: (target, prop) => obj[prop] || target[prop],
              });
              return new evt.constructor(evt.type, proxy);
            }

            const clonedEvent = EventModifier(event);
            node.dispatchEvent(clonedEvent);
          };
          const reflectedEvent = new MouseEvent("");
          portalRef.current.append(clone);
        });
        // portalRef.current.append(clones);
      };
    }, []);

    const portalRef = useRef();
    return (
      <>
        <slot ref={slotRef}></slot>
        {ReactDOM.createPortal(<div ref={portalRef} />, document.body)}
      </>
    );

    // if (host.active) {
    //   // const foo = <div>{Array.from(children).map((child) => child)}</div>;
    //   requestAnimationFrame(() => {
    //     debugger;
    //   });
    //   return ReactDOM.createPortal(<div />, document.body);
    // } else {
    //   return <slot></slot>;
    // }
    return;

    debugger;
    // return host.active ? (
    //   ReactDOM.createPortal(host, document.body)
    // ) : (
    return <slot></slot>;
    // );
    console.log({ children: host.children });
    // const slotRef = useCallback((slot) => {
    //   contents = <div>FOOO TBOBABTTH</div>;
    //   console.log(contents);
    // }, []);

    // let contents = <slot ref={slotRef}></slot>;
    // return contents;
  },
  // render({ host }) {
  //   ReactDOM.createPortal(host.children, document.body);
  //   return null;
  //   // const projectedElem = host.children;
  //   // return host.$.active
  //   //   ? ReactDOM.createPortal(projectedElem, document.body)
  //   //   : projectedElem;
  // },
};
define("aha-portal", [Portal]);

const Basic = {
  props: {
    portaled: { type: Boolean, value: false },
  },
  render({ host }) {
    return (
      <div id="basic">
        <slot></slot>
      </div>
    );
  },
};
define("aha-basic", [Basic]);

// const NoShadow = {
//   render({ host, children }) {
//     console.log(children);

//     return <div></div>;
//   },
// };
// define("no-shadow", [NoShadow]);
