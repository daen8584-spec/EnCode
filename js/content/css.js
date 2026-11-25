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
                            answer: "color",
                            hint: "Em inglês, \"cor\".",
                            explain: "color muda a cor do texto."
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
                            answer: "size",
                            hint: "font-??? quer dizer tamanho da fonte. Como se diz tamanho em inglês?",
                            explain: "font-size muda o tamanho da letra."
                        },
                        {
                            type: "code",
                            question: "Deixe o texto de h1 com 24 pixels e na cor blue",
                            expected: "h1 { font-size: 24px; color: blue; }"
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
                            answer: "background",
                            accept: ["background-color"],
                            hint: "Em inglês, \"fundo\".",
                            explain: "background pinta o fundo. background-color também funciona."
                        },
                        {
                            type: "code",
                            question: "Deixe o fundo do body amarelo",
                            expected: "body { background: yellow; }"
                        },
                        {
                            type: "code",
                            question: "Deixe o p com fundo black e texto white",
                            expected: "p { background: black; color: white; }"
                        }
                    ]
                },
                {
                    id: "css-m1",
                    title: "Máquinas quebradas",
                    machine: true,
                    sample: "<h1>Cinema do Bit</h1>\n<p>Promoção de pipoca!</p>",
                    teach: [],
                    exercises: [
                        {
                            type: "choice",
                            question: "p { color red; } não funciona. O que está faltando?",
                            options: ["Os dois pontos entre color e red", "Um ponto antes do p", "Aspas em red", "Uma tag <p>"]
                        },
                        {
                            type: "fix",
                            machine: "Letreiro Colorido",
                            story: "O letreiro deveria ficar vermelho, mas continua preto.",
                            question: "Conserte o letreiro.",
                            broken: "p { color red; }",
                            expected: "p { color: red; }",
                            hint: "entre a propriedade e o valor vão dois pontos."
                        },
                        {
                            type: "fix",
                            machine: "Telão do Cinema",
                            story: "O título deveria ficar grande, com 40 pixels, mas continua pequeno.",
                            question: "Conserte o telão.",
                            broken: "h1 { font-size: 40; }",
                            expected: "h1 { font-size: 40px; }",
                            hint: "tamanhos precisam de uma unidade, como px."
                        },
                        {
                            type: "fix",
                            machine: "Letreiro do Cinema",
                            story: "O título deveria ficar branco num fundo preto, mas só o fundo mudou.",
                            question: "Conserte o letreiro do título.",
                            broken: "h1 { background: black; colour: white; }",
                            expected: "h1 { background: black; color: white; }",
                            hint: "em CSS a cor do texto se escreve color."
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
                            answer: ".",
                            hint: "Classes começam com um símbolo bem pequeno antes do nome.",
                            explain: "O ponto (.) diz que alerta é uma classe."
                        },
                        {
                            type: "code",
                            question: "Deixe verde o texto dos elementos com a classe nota",
                            expected: ".nota { color: green; }"
                        },
                        {
                            type: "code",
                            question: "Deixe a classe destaque com texto red e letra de 20px",
                            expected: ".destaque { color: red; font-size: 20px; }"
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
                            answer: "margin",
                            hint: "É o espaço por FORA da caixa, que afasta os vizinhos.",
                            explain: "margin cria espaço por fora da caixa, longe dos vizinhos."
                        },
                        {
                            type: "code",
                            question: "Dê 10px de padding aos elementos com a classe botao",
                            expected: ".botao { padding: 10px; }"
                        },
                        {
                            type: "blank",
                            question: "Complete para dar espaço por dentro da caixa amarela",
                            code: ".caixa {\n  background: yellow;\n  ___: 12px;\n}",
                            placeholder: "digite a propriedade",
                            answer: "padding",
                            hint: "É o espaço por DENTRO da caixa, entre a borda e o conteúdo.",
                            explain: "padding cria espaço por dentro da caixa."
                        },
                        {
                            type: "code",
                            question: "Deixe a classe caixa com fundo lightblue, padding de 12px e margin de 8px",
                            expected: ".caixa { background: lightblue; padding: 12px; margin: 8px; }"
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
                            answer: "dashed",
                            hint: "Em inglês, \"tracejada\". A borda contínua é solid e a pontilhada é dotted.",
                            explain: "dashed faz a borda tracejada, com risquinhos."
                        },
                        {
                            type: "code",
                            question: "Coloque na classe caixa uma borda de 2px, contínua e azul",
                            expected: ".caixa { border: 2px solid blue; }"
                        },
                        {
                            type: "choice",
                            question: "Em .foto { border: 4px dashed orange; padding: 8px; }, o que fica laranja?",
                            options: ["A borda", "O texto", "O fundo", "O espaço de dentro"]
                        },
                        {
                            type: "code",
                            question: "Deixe a classe foto com borda de 3px, tracejada e black, e padding de 10px",
                            expected: ".foto { border: 3px dashed black; padding: 10px; }"
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
                            answer: "flex",
                            accept: ["inline-flex"],
                            hint: "É o display que coloca os itens lado a lado. Quatro letras.",
                            explain: "display: flex coloca os itens lado a lado."
                        },
                        {
                            type: "code",
                            question: "Faça a classe linha usar flex com gap de 8px",
                            expected: ".linha { display: flex; gap: 8px; }"
                        },
                        {
                            type: "blank",
                            question: "Complete para afastar os itens do menu",
                            code: ".menu {\n  display: flex;\n  ___: 16px;\n  background: lightblue;\n}",
                            placeholder: "digite a propriedade",
                            answer: "gap",
                            hint: "Em inglês, \"vão\": o espaço entre os itens do flex.",
                            explain: "gap cria espaço entre os itens do flex."
                        },
                        {
                            type: "code",
                            question: "Faça a classe menu usar flex com gap de 12px, fundo black e texto white",
                            expected: ".menu { display: flex; gap: 12px; background: black; color: white; }"
                        }
                    ]
                },
                {
                    id: "css-m2",
                    title: "Máquinas quebradas",
                    machine: true,
                    sample: "<div class=\"caixa\">Presente</div>\n<p></p>\n<div class=\"prateleira\"><span>Bola</span><span>Pião</span><span>Pipa</span></div>",
                    teach: [],
                    exercises: [
                        {
                            type: "choice",
                            question: "caixa { padding: 10px; } não muda a div com class=\"caixa\". Por quê?",
                            options: ["Falta o ponto antes de caixa", "padding não existe", "Falta px", "A div precisa de um id"]
                        },
                        {
                            type: "fix",
                            machine: "Caixa de Presentes",
                            story: "A caixa deveria ter espaço por dentro e uma borda verde, mas nada aparece.",
                            question: "Conserte a caixa.",
                            broken: "caixa { padding: 16px; border: 2px solid green; }",
                            expected: ".caixa { padding: 16px; border: 2px solid green; }",
                            hint: "para estilizar uma classe, comece com um ponto."
                        },
                        {
                            type: "fix",
                            machine: "Prateleira de Brinquedos",
                            story: "Os brinquedos deveriam ficar lado a lado, mas estão grudados e empilhados.",
                            question: "Conserte a prateleira.",
                            broken: ".prateleira { display: block; gap: 12px; }",
                            expected: ".prateleira { display: flex; gap: 12px; }",
                            hint: "para colocar lado a lado, use display: flex."
                        },
                        {
                            type: "fix",
                            machine: "Vitrine de Presentes",
                            story: "A caixa deveria ter padding de 16px e texto vermelho, mas nada mudou.",
                            question: "Conserte a vitrine.",
                            broken: ".caixa { padding: 16px color: red; }",
                            expected: ".caixa { padding: 16px; color: red; }",
                            hint: "cada propriedade termina com ponto e vírgula."
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
                            type: "choice",
                            question: "Num botão, qual propriedade cria espaço entre o texto e a borda?",
                            options: ["padding", "margin", "gap", "width"]
                        },
                        {
                            type: "blank",
                            question: "Complete para deixar o texto do botão branco",
                            code: ".botao {\n  background: purple;\n  ___: white;\n}",
                            placeholder: "digite a propriedade",
                            answer: "color"
                        },
                        {
                            type: "code",
                            question: "Estilize a classe botao com fundo purple, texto white e padding de 12px",
                            expected: ".botao { background: purple; color: white; padding: 12px; }"
                        },
                        {
                            type: "code",
                            question: "Agora dê à classe botao uma borda de 2px, contínua e black, e margem de 8px",
                            expected: ".botao { border: 2px solid black; margin: 8px; }"
                        },
                        {
                            type: "code",
                            question: "Faça a classe botao ter letra de 20px, padding de 16px e fundo green",
                            expected: ".botao { font-size: 20px; padding: 16px; background: green; }"
                        }
                    ]
                }
            ]
        },
        {
            title: "Texto com estilo",
            description: "Alinhar, engrossar, arredondar e medir",
            lessons: [
                {
                    id: "css-9",
                    title: "Alinhar",
                    sample: "<h1>Placar</h1>\n<p class=\"placar\">3 x 2</p>\n<p class=\"data\">Sábado</p>",
                    teach: [
                        {
                            term: "text-align",
                            meaning: "alinhamento do texto",
                            lines: [
                                "text-align significa alinhamento do texto.",
                                "Com center, o texto fica no meio.",
                                "Também existem left (esquerda) e right (direita)."
                            ],
                            example: { code: "h1 { text-align: center; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Qual valor centraliza o texto?",
                            options: ["center", "middle", "left", "top"]
                        },
                        {
                            type: "blank",
                            question: "Complete para alinhar o texto à direita",
                            code: "p { text-align: ___; }",
                            placeholder: "digite o valor",
                            answer: "right",
                            hint: "Em inglês, \"direita\".",
                            explain: "text-align: right alinha o texto à direita."
                        },
                        {
                            type: "code",
                            question: "Centralize o texto da classe placar",
                            expected: ".placar { text-align: center; }"
                        },
                        {
                            type: "choice",
                            question: "Com h1 { text-align: center; color: blue; }, o que acontece com o h1?",
                            options: ["Fica centralizado e azul", "Só fica azul", "Fica à direita", "Ganha fundo azul"]
                        },
                        {
                            type: "code",
                            question: "Centralize o h1 e deixe a letra dele com 40px",
                            expected: "h1 { text-align: center; font-size: 40px; }"
                        }
                    ]
                },
                {
                    id: "css-10",
                    title: "Negrito",
                    sample: "<p>Texto comum</p>\n<p class=\"aviso\">Atenção!</p>",
                    teach: [
                        {
                            term: "font-weight",
                            meaning: "peso da fonte",
                            lines: [
                                "font-weight significa peso da fonte.",
                                "Com bold, o texto fica em negrito.",
                                "Com normal, ele volta ao peso comum."
                            ],
                            example: { code: "p { font-weight: bold; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que font-weight: bold faz?",
                            options: ["Deixa o texto em negrito", "Aumenta o tamanho", "Muda a cor", "Centraliza"]
                        },
                        {
                            type: "blank",
                            question: "Complete a propriedade do peso da fonte",
                            code: ".aviso { font-___: bold; }",
                            placeholder: "digite a parte que falta",
                            answer: "weight",
                            hint: "font-??? quer dizer peso da fonte. Como se diz peso em inglês?",
                            explain: "font-weight controla o peso da letra: normal ou negrito."
                        },
                        {
                            type: "code",
                            question: "Deixe em negrito o texto da classe aviso",
                            expected: ".aviso { font-weight: bold; }"
                        },
                        {
                            type: "blank",
                            question: "Complete para o aviso ficar vermelho e em negrito",
                            code: ".aviso {\n  color: red;\n  font-weight: ___;\n}",
                            placeholder: "digite o valor",
                            answer: "bold",
                            accept: ["700"],
                            hint: "Em inglês, \"negrito\".",
                            explain: "font-weight: bold deixa o texto em negrito."
                        },
                        {
                            type: "choice",
                            question: "Quantas propriedades tem .aviso { color: red; font-weight: bold; font-size: 18px; }?",
                            options: ["3", "1", "2", "4"]
                        },
                        {
                            type: "code",
                            question: "Deixe a classe aviso em negrito, com texto white e fundo red",
                            expected: ".aviso { font-weight: bold; color: white; background: red; }"
                        }
                    ]
                },
                {
                    id: "css-11",
                    title: "Cantos redondos",
                    sample: "<div class=\"cartao\">Cartão</div>\n<p></p>\n<span class=\"selo\">Novo</span>",
                    teach: [
                        {
                            term: "border-radius",
                            meaning: "raio da borda",
                            lines: [
                                "border-radius significa raio da borda.",
                                "Ele arredonda os cantos do elemento.",
                                "Quanto maior o número, mais redondo."
                            ],
                            example: { code: ".cartao { border-radius: 16px; background: lightblue; padding: 12px; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que border-radius muda?",
                            options: ["Os cantos do elemento", "A cor do texto", "O tamanho da letra", "A posição"]
                        },
                        {
                            type: "blank",
                            question: "Complete para arredondar os cantos",
                            code: ".cartao { border-___: 20px; }",
                            placeholder: "digite a parte que falta",
                            answer: "radius",
                            hint: "border-??? quer dizer raio da borda. Como se diz raio em inglês?",
                            explain: "border-radius arredonda os cantos."
                        },
                        {
                            type: "code",
                            question: "Arredonde em 12px os cantos da classe selo",
                            expected: ".selo { border-radius: 12px; }"
                        },
                        {
                            type: "choice",
                            question: "Qual código faz um selo com borda azul e cantos redondos?",
                            options: [
                                ".selo { border: 2px solid blue; border-radius: 12px; }",
                                ".selo { border-radius: blue; }",
                                ".selo { border: 12px round; }",
                                ".selo { radius: 12px; }"
                            ]
                        },
                        {
                            type: "blank",
                            question: "Complete para arredondar o cartão amarelo",
                            code: ".cartao {\n  background: yellow;\n  padding: 16px;\n  ___: 8px;\n}",
                            placeholder: "digite a propriedade",
                            answer: "border-radius",
                            hint: "Duas palavras ligadas por hífen: borda + raio.",
                            explain: "border-radius arredonda os cantos da caixa."
                        },
                        {
                            type: "code",
                            question: "Deixe a classe cartao com fundo lightblue, padding de 20px e cantos de 16px",
                            expected: ".cartao { background: lightblue; padding: 20px; border-radius: 16px; }"
                        }
                    ]
                },
                {
                    id: "css-12",
                    title: "Largura",
                    sample: "<div class=\"barra\">Barra</div>\n<p></p>\n<div class=\"faixa\">Faixa</div>",
                    teach: [
                        {
                            term: "width",
                            meaning: "largura",
                            lines: [
                                "width significa largura.",
                                "Define o quanto o elemento ocupa na horizontal.",
                                "width: 200px deixa o elemento com 200 pixels de largura."
                            ],
                            example: { code: ".barra { width: 200px; background: orange; }" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que width controla?",
                            options: ["A largura", "A altura", "A cor", "A borda"]
                        },
                        {
                            type: "blank",
                            question: "Complete com a propriedade da largura",
                            code: ".faixa { ___: 150px; }",
                            placeholder: "digite a propriedade",
                            answer: "width",
                            hint: "Em inglês, \"largura\".",
                            explain: "width define a largura da caixa."
                        },
                        {
                            type: "code",
                            question: "Deixe a classe faixa com 300px de largura",
                            expected: ".faixa { width: 300px; }"
                        },
                        {
                            type: "choice",
                            question: "Em .barra { width: 200px; padding: 10px; }, o que tem 200px?",
                            options: ["A largura da barra", "O espaço de dentro", "A altura da barra", "O tamanho da letra"]
                        },
                        {
                            type: "blank",
                            question: "Complete para a faixa laranja ter 250px de largura",
                            code: ".faixa {\n  ___: 250px;\n  background: orange;\n}",
                            placeholder: "digite a propriedade",
                            answer: "width",
                            hint: "Em inglês, \"largura\".",
                            explain: "width define a largura: 250px."
                        },
                        {
                            type: "code",
                            question: "Deixe a classe barra com 200px de largura, fundo green, texto white e centralizado",
                            expected: ".barra { width: 200px; background: green; color: white; text-align: center; }"
                        }
                    ]
                },
                {
                    id: "css-m3",
                    title: "Máquinas quebradas",
                    machine: true,
                    sample: "<p class=\"placar\">2 x 1</p>\n<button class=\"botao\">Jogar de novo</button>",
                    teach: [],
                    exercises: [
                        {
                            type: "choice",
                            question: "Por que .titulo { text-align: centre; } não centraliza?",
                            options: ["O valor certo é center", "Falta px", "text-align não existe", "Falta o ponto"]
                        },
                        {
                            type: "fix",
                            machine: "Placar Torto",
                            story: "O placar deveria aparecer no meio, mas está encostado na esquerda.",
                            question: "Conserte o placar.",
                            broken: ".placar { text-align: centre; }",
                            expected: ".placar { text-align: center; }",
                            hint: "em CSS, centro se escreve center."
                        },
                        {
                            type: "fix",
                            machine: "Botão Quadrado",
                            story: "O botão deveria ter cantos redondos de 10px, mas continua quadrado.",
                            question: "Conserte o botão.",
                            broken: ".botao { border-radios: 10px; }",
                            expected: ".botao { border-radius: 10px; }",
                            hint: "confira como se escreve border-radius."
                        },
                        {
                            type: "fix",
                            machine: "Botão Gordinho",
                            story: "O botão deveria ter 150px de largura e texto em negrito, mas só o negrito funcionou.",
                            question: "Conserte o botão gordinho.",
                            broken: ".botao { widht: 150px; font-weight: bold; }",
                            expected: ".botao { width: 150px; font-weight: bold; }",
                            hint: "confira as letras de width."
                        },
                        {
                            type: "fix",
                            machine: "Placar Apagado",
                            story: "O placar deveria ter fundo preto e números brancos, mas os números sumiram.",
                            question: "Conserte o placar apagado.",
                            broken: ".placar { background: black; color: black; }",
                            expected: ".placar { background: black; color: white; }",
                            hint: "o texto e o fundo estão da mesma cor."
                        }
                    ]
                }
            ]
        }
    ]
};
