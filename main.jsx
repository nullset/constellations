import React from "react";
import { define, view } from "./src/index";

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
  handleClick(e) {
    console.log(this, e);
    debugger;
  },
  render({ host }) {
    console.log(host);
    const handleClick = (e) => {
      console.log(this, e);
      debugger;
      // this.$.name = "foo";
    };
    const handleChange = (event) => setGreeting(event.target.value);
    return (
      <div>
        <slot></slot> = My elem: {this.$.name}{" "}
        <button onClick={handleClick}>change</button>
      </div>
    );
  },
  onclick() {},
};
define("my-elem", [MyElem]);
