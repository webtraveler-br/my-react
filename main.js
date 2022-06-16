"use strict";

const TEXT = "TEXT_ELEMENT";

// cria um objeto elemento, com suas propriedades e elementos filhos.
// utiliza JSX como liguagem de template para a árvore dom.
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

// cria um objeto elemento representando texto
function createTextElement(text) {
  // texto é considerado um objeto elemento vazio, com a propriedade nodeValue a mais.
  // (não poderia ter sido passado diretamente ao pai?)

  // "React doesn’t wrap primitive values or create empty arrays when there aren’t children,
  // but we do it because it will simplify our code, and for our library we prefer simple code than performant code."
  return {
    type: TEXT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// criam o elemento dom, com suas devidas propriedades.
// pode criar um elemento dom de texto ou real.
function createDom(fiber) {
  const dom =
    fiber.type === TEXT
      ? document.createTextNode("")
      : document.createElement(fiber.type);


  // parece uma decisão ineficiente colocar children dentro de props
  // para ter que filtrar todas as propriedades depois,
  // se isso poderia ter sido evitado (talvez seja necessário mais para frente no tutorial,
  // considerando que estou somente no cap II de VI)
  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

// atribuirá o primeiro UnitOfWork ao callback (ainda não foi desenvolvido)
let nextUnitOfWork = null;
function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

// como o forEach da função render original poderia congelar o funcionamento da página,
// caso existam muitos elementos filhos, e o javascript é sincrono,
// é necessário criar um evento que será chamado sempre que o event loop
// estiver parado, executando pequenas quantidades da tarefa (nesse caso, renderização de elementos).
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // requestIdleCallback é como o setTimeOut, mas ao invés de executar após um determinado período,
  // ele executa o callback sempre que o event loop (call stack e task queue) estiver vázio,
  // passando o cronometro de execução como argumento da função
  requestIdleCallback(workLoop);
}

// seta o evento, na espera da primeira execução do render, e da pausa do event loop
requestIdleCallback(workLoop);

// executa a pesquisa na fiber tree, criando seus elementos dom a cada callback
function performUnitOfWork(fiber) {
  // cria o dom se não houver
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // adiciona o elemento dom ao seu pai imediatamente
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // cada fiber (parte da fiber tree) pode ter UM pai, filho e irmão
  // assim, o próximo elemento, por ordem de prioridade será:
  // filho, irmão.
  // quando não houver nenhum destes, volta na árvore a procura do próximo fiber,
  // voltar ao root significa que todos os elementos foram inseridos
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];

    // cria o objeto fiber, seu dom será criado na próxima rodada
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    // adiciona o único filho do pai
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      // adiciona um único irmão para cada filho
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  if (fiber.child) {
    // primeira prioridade é o filho
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      // segunda prioridade são os irmãos
      return nextFiber.sibling;
    }
    // volta na árvore até achar um irmão não explorado
    nextFiber = nextFiber.parent;
  }
}

// Objeto do framework Didact
const Didact = {
  createElement,
  render,
};

// criação de um elemento utilizando o Didact (sem JSX)
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
