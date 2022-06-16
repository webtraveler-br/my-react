function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "object" ? child : createTextElement(child);
      }),
    },
  };
}

// texto é considerado um objeto elemento vazio, com a propriedade nodeValue a mais
// (não poderia ter sido passado diretamente ao pai?)

// React doesn’t wrap primitive values or create empty arrays when there aren’t children,
// but we do it because it will simplify our code, and for our library we prefer simple code than performant code.
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

const Didact = {
  createElement,
};

/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

// criação de um elemento utilizando o Didact
const elementWithoutJSX = Didact.createElement(
  "div",
  { id: "foo" },
  Didact.createElement("a", null, "bar"),
  Didact.createElement("b")
);
