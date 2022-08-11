- A class is just an array of different mixins, all smashed together.
- Each mixin should define a unique `Symbol()` for the mixin's own internal name and state.
  - If no Symbol is defined, then generate one automatically (essentially becomes impossible to access at this point).
- Each mixin can access the "master" state (element.$), or its own internal state (element[SymbolName].$).
- Each state object is an observable.

### Mixins

##### Keyboard navigable

Automatically manages tabindex. If element has a `disabled` property, the tabindex is set to -1 (only programatically focusable). If there is no `disabled` property set, the tabindex is set to 0 (programatically and keyboard focusable).
