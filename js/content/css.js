// `sample` is the HTML the lesson's CSS is previewed on.
export default {
    id: "css",
    name: "CSS",
    icon: "{ }",
    description: "Estilize páginas com cores, layouts e animações modernas.",
    units: [
        {
            title: "Estilo",
            description: "Cores, tamanhos e fundos com CSS",
            lessons: [
                {
                    id: "css-1",
                    title: "Cor do texto",
                    sample: "<p>Texto do parágrafo</p>",
                    teach: [
                        {
                            term: "color",
                            meaning: "cor",
                            lines: [
                                "color significa cor em inglês.",
                                "Em CSS, color muda a cor do texto.",
                                "Você escolhe um elemento e dá uma cor."
                            ],
                            example: { code: "p { color: red; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que a propriedade color faz?",
                            options: ["Muda a cor do texto", "Muda o fundo", "Aumenta a letra", "Cria borda"]
                        },
                        {
                            type: "blank",
                            question: "Complete para pintar o texto de azul",
                            code: "p { ___: blue; }",
                            placeholder: "digite a propriedade",
                            answer: "color"
                        },
                        {
                            type: "code",
                            question: "Faça o texto de p ficar vermelho",
                            expected: "p { color: red; }"
                        }
                    ]
                },
                {
                    id: "css-2",
                    title: "Tamanho da letra",
                    sample: "<h1>Título da página</h1>",
                    teach: [
                        {
                            term: "font-size",
                            meaning: "tamanho da fonte",
                            lines: [
                                "font-size significa tamanho da fonte.",
                                "Em CSS, você define o tamanho em pixels (px).",
                                "font-size: 20px deixa o texto com 20 pixels."
                            ],
                            example: { code: "h1 { font-size: 40px; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Qual unidade usar para font-size?",
                            options: ["px", "kg", "cm", "ml"]
                        },
                        {
                            type: "blank",
                            question: "Complete para deixar o h1 com 32 pixels",
                            code: "h1 { font-___: 32px; }",
                            placeholder: "digite a parte que falta",
                            answer: "size"
                        },
                        {
                            type: "code",
                            question: "Deixe o texto de h1 com 24 pixels",
                            expected: "h1 { font-size: 24px; }"
                        }
                    ]
                },
                {
                    id: "css-3",
                    title: "Cor de fundo",
                    sample: "<p>Conteúdo da página</p>",
                    teach: [
                        {
                            term: "background",
                            meaning: "fundo",
                            lines: [
                                "background significa fundo em inglês.",
                                "background muda a cor de trás do elemento.",
                                "background: yellow deixa o fundo amarelo."
                            ],
                            example: { code: "body { background: black; color: white; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que background controla?",
                            options: ["O fundo do elemento", "A cor do texto", "A borda", "O tamanho"]
                        },
                        {
                            type: "blank",
                            question: "Complete para deixar o fundo do body preto",
                            code: "body { ___: black; }",
                            placeholder: "digite a propriedade",
                            answer: "background"
                        },
                        {
                            type: "code",
                            question: "Deixe o fundo do body amarelo",
                            expected: "body { background: yellow; }"
                        }
                    ]
                }
            ]
        },
        {
            title: "Caixas e layout",
            description: "Classes, espaços, bordas e elementos lado a lado",
            lessons: [
                {
                    id: "css-4",
                    title: "Classes",
                    sample: "<p class=\"destaque\">Importante</p>\n<p class=\"nota\">Nota de rodapé</p>\n<p>Texto normal</p>",
                    teach: [
                        {
                            term: ".classe",
                            lines: [
                                "Para estilizar uma classe, use um ponto antes do nome.",
                                ".destaque pega todo elemento com class=\"destaque\".",
                                "Assim você muda só alguns elementos, não todos."
                            ],
                            example: { code: ".destaque { color: orange; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Qual seletor pega os elementos com class=\"aviso\"?",
                            options: [".aviso", "#aviso", "aviso", "<aviso>"]
                        },
                        {
                            type: "blank",
                            question: "Complete o seletor da classe alerta",
                            code: "___alerta { color: red; }",
                            placeholder: "digite o símbolo",
                            answer: "."
                        },
                        {
                            type: "code",
                            question: "Deixe verde o texto dos elementos com a classe nota",
                            expected: ".nota { color: green; }"
                        }
                    ]
                },
                {
                    id: "css-5",
                    title: "Espaçamento",
                    sample: "<div class=\"caixa\">Caixa</div>\n<p>Vizinho de baixo</p>\n<span class=\"botao\">Botão</span>",
                    teach: [
                        {
                            term: "padding",
                            meaning: "preenchimento (espaço interno)",
                            lines: [
                                "padding significa preenchimento.",
                                "É o espaço entre o conteúdo e a borda do elemento.",
                                "padding: 20px dá 20 pixels de espaço por dentro."
                            ],
                            example: { code: ".caixa { padding: 20px; background: lightblue; }" }
                        },
                        {
                            term: "margin",
                            meaning: "margem (espaço externo)",
                            lines: [
                                "margin significa margem.",
                                "É o espaço do lado de fora, que afasta os outros elementos.",
                                "margin: 20px empurra os vizinhos para longe."
                            ],
                            example: { code: ".caixa { margin: 20px; background: lightblue; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Qual propriedade cria espaço DENTRO do elemento?",
                            options: ["padding", "margin", "border", "color"]
                        },
                        {
                            type: "blank",
                            question: "Complete para afastar o parágrafo 16px dos vizinhos",
                            code: "p { ___: 16px; }",
                            placeholder: "digite a propriedade",
                            answer: "margin"
                        },
                        {
                            type: "code",
                            question: "Dê 10px de padding aos elementos com a classe botao",
                            expected: ".botao { padding: 10px; }"
                        }
                    ]
                },
                {
                    id: "css-6",
                    title: "Bordas",
                    sample: "<div class=\"foto\">Foto</div>\n<p></p>\n<div class=\"caixa\">Caixa</div>",
                    teach: [
                        {
                            term: "border",
                            meaning: "borda",
                            lines: [
                                "border significa borda.",
                                "Ela tem três partes: espessura, estilo e cor.",
                                "O estilo solid é uma linha contínua; dashed é tracejada."
                            ],
                            example: { code: ".foto { border: 3px solid black; }\n.caixa { border: 2px dashed red; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Em border: 2px solid red, o que solid indica?",
                            options: ["O estilo da linha", "A cor", "A espessura", "O tamanho da caixa"]
                        },
                        {
                            type: "blank",
                            question: "Complete para a borda ser tracejada",
                            code: ".caixa { border: 1px ___ gray; }",
                            placeholder: "digite o estilo",
                            answer: "dashed"
                        },
                        {
                            type: "code",
                            question: "Coloque na classe caixa uma borda de 2px, contínua e azul",
                            expected: ".caixa { border: 2px solid blue; }"
                        }
                    ]
                },
                {
                    id: "css-7",
                    title: "Lado a lado",
                    sample: "<nav class=\"menu\"><span>Início</span><span>Sobre</span><span>Contato</span></nav>\n<p></p>\n<div class=\"linha\"><span>A</span><span>B</span><span>C</span></div>",
                    teach: [
                        {
                            term: "display",
                            meaning: "exibição",
                            lines: [
                                "display significa exibição.",
                                "display: flex coloca os filhos de um elemento lado a lado.",
                                "flex vem de flexible, flexível."
                            ],
                            example: { code: ".menu { display: flex; }" }
                        },
                        {
                            term: "gap",
                            meaning: "vão, espaço entre itens",
                            lines: [
                                "gap significa vão, espaço.",
                                "Com flex, gap define o espaço entre os itens.",
                                "gap: 16px separa cada item por 16 pixels."
                            ],
                            example: { code: ".menu { display: flex; gap: 16px; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que display: flex faz com os filhos do elemento?",
                            options: ["Coloca lado a lado", "Esconde todos", "Aumenta a letra", "Remove as bordas"]
                        },
                        {
                            type: "blank",
                            question: "Complete para colocar os itens do menu lado a lado",
                            code: ".menu { display: ___; }",
                            placeholder: "digite o valor",
                            answer: "flex"
                        },
                        {
                            type: "code",
                            question: "Faça a classe linha usar flex com gap de 8px",
                            expected: ".linha { display: flex; gap: 8px; }"
                        }
                    ]
                },
                {
                    id: "css-8",
                    title: "Desafio: botão",
                    challenge: true,
                    sample: "<a class=\"botao\">Começar</a>",
                    teach: [],
                    exercises: [
                        {
                            type: "code",
                            question: "Estilize a classe botao com fundo purple, texto white e padding de 12px",
                            expected: ".botao { background: purple; color: white; padding: 12px; }"
                        },
                        {
                            type: "code",
                            question: "Agora dê à classe botao uma borda de 2px, contínua e black, e margem de 8px",
                            expected: ".botao { border: 2px solid black; margin: 8px; }"
                        }
                    ]
                }
            ]
        }
    ]
};
