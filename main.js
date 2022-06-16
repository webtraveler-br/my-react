const TEXT = "TEXT_ELEMENT";

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
    type: TEXT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// cria o elemento dom, e faz o mesmo recursivamente para cada filho,
// anexando-o ao container no final (não muito perfomante, muitos acessos ao dom)
// parece uma decisão ineficiente colocar children dentro de props
// para ter que filtrar todas as propriedades depois
// se isso poderia ter sido evitado (talvez seja necessário mais para frente no tutorial
// considerando que estou somente no cap II de VI)
function render(element, container) {
  const dom =
    element.type === TEXT
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach((child) => {
    render(child, dom);
  });
  container.appendChild(dom);
}

const Didact = {
  createElement,
  render,
};

// criação de um elemento utilizando o Didact
const elementWithoutJSX = Didact.createElement(
  "div",
  { id: "foo" },
  Didact.createElement("a", null, "bar"),
  Didact.createElement("b")
);

/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

const container = document.getElementById("root");
Didact.render(element, container);
