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
  render() {
    function handleClick(e) {
      debugger;
      // this.$.name = "foo";
    }
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
