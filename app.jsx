import React, { useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { define, view, store, observable, observe } from "./src/index";

// const counter = store({
//   num: 0,
//   increment: () => {
//     counter.num++;
//   },
// });

const counter = store({
  num: 0,
  nested: {
    value: 4,
  },
  increment: () => {
    counter.num++;
  },
});

window.counter = counter;

const Foo = view(() => {
  return <button onClick={counter.increment}>{counter.num}</button>;
});

const App = view(({ counter }) => {
  const greeting = "Hello Function Component!";

  const myElemRef = useRef();

  const blah = useCallback((node) => {
    node.$.counter = new Proxy(counter, {
      set(target, propKey, value) {
        Reflect.set(target, propKey, value);
      },
    });
  }, []);

  // An object of different keys/values that are applied to the reactive state of a web component.
  // When the value is updated within the web component it also updates within the react component,
  // and vice-versa.
  const useWebComponentStores = (entries) => {
    console.log({ entries });
    return useCallback((node) => {
      Object.entries(entries).map(([key, store]) => {
        node.$[key] = new Proxy(store, {
          set(target, propKey, value) {
            Reflect.set(target, propKey, value);
          },
        });
      });
      // node.$[key] = new Proxy(key, {
      //   set(target, propKey, value) {
      //     Reflect.set(target, propKey, value);
      //   },
      // });
    }, []);
  };

  const useWebComponentStore = (key, store) => {
    return useCallback((node) => {
      node.$[key] = new Proxy(store, {
        set(target, propKey, value) {
          Reflect.set(target, propKey, value);
        },
      });
    }, []);
  };

  return (
    <div>
      <h1>
        {greeting} : {counter.num} : {counter.nested.value}
      </h1>
      <div onClick={() => console.log("click parent div")}>
        <my-elem
          // ref={blah}
          ref={useWebComponentStores({ counter })}
          // ref={useStore("counter", counter)}
          name={counter.num}
          onClick={() => console.log("click on my-elem", this)}
          style={{ background: "red", display: "block" }}
        >
          <Foo />
          Some light dom stuff
        </my-elem>
      </div>
      <Foo />
      <hr />
    </div>
  );
});

export default App;

ReactDOM.render(
  <React.StrictMode>
    <App counter={counter} />
  </React.StrictMode>,
  document.getElementById("app")
);
