import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { define, view } from "./src/index";

const MyElem = {
  props: {
    name: { type: String, default: "MySuperElem" },
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

    return (
      <div onClick={() => console.log("clicked on div")}>
        <h2>My Elem</h2>
        <h3>light DOM</h3>
        <slot></slot>
        <h3>shadow DOM</h3>
        <p>My elem: {host.$.name}</p>
        <button onClick={handleClick}>change</button>
        <h3>Children</h3>
        {host.chilren}
        {/* {ReactDOM.createPortal(<h1>Liftedup</h1>, document.body)} */}
      </div>
    );
  },
};
define("my-elem", [MyElem]);
