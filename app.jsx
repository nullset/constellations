import React from "react";
import ReactDOM from "react-dom";
import { define, view, store } from "./src/index";

const counter = store({
  num: 0,
  increment: () => {
    debugger;
    counter.num++;
  },
});

const Foo = view(() => {
  return <button onClick={counter.increment}>{counter.num}</button>;
});

const App = view(({ counter }) => {
  const greeting = "Hello Function Component!";

  return (
    <div>
      <h1>
        {greeting} : {counter.num}
      </h1>
      <my-elem
        name={counter.num}
        onclick={counter.increment}
        style={{ background: "red", display: "block" }}
      >
        Some light dom stuff
      </my-elem>
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
