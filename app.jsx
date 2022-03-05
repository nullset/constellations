import React from "react";
import ReactDOM from "react-dom";
import { define, view, store } from "./src/index";

const counter = store({
  num: 0,
  increment: () => {
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
      <div onClick={() => console.log("click parent div")}>
        <my-elem
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
