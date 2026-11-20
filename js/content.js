// Exercise types:
//   choice — options[0] is the correct answer; options are shuffled when shown.
//   blank  — fill each ___ in `code` with `answer`.
//   code   — write code from scratch. Python compares printed output with `expected`;
//            HTML and CSS compare the result with `expected`. `mustInclude` lists code that must appear.

export const TRACKS = [
    {
        id: "python",
        name: "Python",
        icon: "py",
        description: "Aprenda lógica, automação e ciência de dados.",
        units: [
            {
                title: "Fundamentos",
                description: "Primeiros comandos e variáveis em Python",
                lessons: [
                    {
                        id: "py-1",
                        title: "Primeiro comando",
                        teach: [
                            {
                                term: "print",
                                lines: [
                                    "print vem do inglês e significa imprimir.",
                                    "Em Python, print() mostra algo na tela.",
                                    "É o primeiro comando que todo programador aprende."
                                ],
                                example: { code: "print(\"Oi\")", output: "Oi" }
                            }
                        ],
                        exercises: [
                            {
                                type: "choice",
                                question: "O que print() faz?",
                                options: ["Mostra algo na tela", "Guarda um valor", "Apaga a tela", "Fecha o programa"]
                            },
                            {
                                type: "blank",
                                question: "Complete o código para mostrar Olá, mundo!",
                                code: "___(\"Olá, mundo!\")",
                                placeholder: "digite o comando",
                                answer: "print"
                            },
                            {
                                type: "code",
                                question: "Use print com o texto Olá, mundo! (entre aspas).",
                                expected: "Olá, mundo!",
                                mustInclude: ["print("]
                            }
                        ]
                    },
                    {
                        id: "py-2",
                        title: "Caixas que guardam coisas",
                        teach: [
                            {
                                term: "variável",
                                lines: [
                                    "Uma variável é como uma caixa com nome.",
                                    "Você guarda um valor dentro e usa depois.",
                                    "Em Python não precisa declarar o tipo da caixa."
                                ],
                                example: { code: "nome = \"Ana\"\nprint(nome)", output: "Ana" }
                            }
                        ],
                        exercises: [
                            {
                                type: "choice",
                                question: "O que é uma variável?",
                                options: ["Uma caixa que guarda um valor", "Um comando de imprimir", "Um erro do Python", "Uma cor"]
                            },
                            {
                                type: "blank",
                                question: "Complete para criar a variável idade com o valor 25",
                                code: "idade ___ 25",
                                placeholder: "digite o operador",
                                answer: "="
                            },
                            {
                                type: "code",
                                question: "Crie uma variável chamada nome com o texto Ana (entre aspas) e mostre com print.",
                                expected: "Ana",
                                mustInclude: ["nome =", "print(nome)"]
                            }
                        ]
                    },
                    {
                        id: "py-3",
                        title: "Texto e números",
                        teach: [
                            {
                                term: "string",
                                lines: [
                                    "string é o nome que damos para texto.",
                                    "Em Python, string fica entre aspas.",
                                    "Pode usar aspas simples ou duplas."
                                ],
                                example: { code: "nome = \"Ana\"\ncor = 'azul'\nprint(nome)\nprint(cor)", output: "Ana\nazul" }
                            },
                            {
                                term: "int",
                                lines: [
                                    "int é abreviação de integer, número inteiro.",
                                    "Números ficam sem aspas.",
                                    "int e string são diferentes, mesmo parecidos."
                                ],
                                example: { code: "idade = 25\nprint(idade + 1)", output: "26" }
                            }
                        ],
                        exercises: [
                            {
                                type: "choice",
                                question: "Qual desses é uma string?",
                                options: ["'texto'", "42", "3.14", "True"]
                            },
                            {
                                type: "blank",
                                question: "Complete para juntar texto e número",
                                code: "idade = 25\nprint('Idade: ' + ___(idade))",
                                placeholder: "digite a função",
                                answer: "str"
                            },
                            {
                                type: "code",
                                question: "Mostre o resultado da soma de 5 com 3 usando print.",
                                expected: "8",
                                mustInclude: ["+"]
                            }
                        ]
                    },
                    {
                        id: "py-4",
                        title: "Decisões",
                        teach: [
                            {
                                term: "if",
                                lines: [
                                    "if significa se em inglês.",
                                    "Serve para tomar decisões no código.",
                                    "O bloco do if só roda se a condição for verdadeira."
                                ],
                                example: { code: "idade = 20\nif idade >= 18:\n    print(\"Maior\")", output: "Maior" }
                            },
                            {
                                term: "else",
                                lines: [
                                    "else significa senão em inglês.",
                                    "Roda quando o if é falso.",
                                    "É o plano B do seu código."
                                ],
                                example: {
                                    code: "idade = 10\nif idade >= 18:\n    print(\"Maior\")\nelse:\n    print(\"Menor\")",
                                    output: "Menor"
                                }
                            }
                        ],
                        exercises: [
                            {
                                type: "choice",
                                question: "O que if significa em português?",
                                options: ["se", "senão", "para", "enquanto"]
                            },
                            {
                                type: "blank",
                                question: "Complete a condição para verificar se é maior de idade",
                                code: "idade = 20\n___ idade >= 18:\n    print('Maior')",
                                placeholder: "digite a palavra-chave",
                                answer: "if"
                            },
                            {
                                type: "code",
                                question: "Se 10 for maior que 5, mostre a palavra maior usando print.",
                                expected: "maior",
                                mustInclude: ["if"]
                            }
                        ]
                    },
                    {
                        id: "py-5",
                        title: "Repetir ações",
                        teach: [
                            {
                                term: "for",
                                lines: [
                                    "for significa para em inglês.",
                                    "Serve para repetir algo várias vezes.",
                                    "É como dizer: faça isso para cada item."
                                ],
                                example: { code: "for i in range(3):\n    print(i)", output: "0\n1\n2" }
                            },
                            {
                                term: "range",
                                lines: [
                                    "range significa intervalo em inglês.",
                                    "range(3) cria a sequência 0, 1, 2.",
                                    "O último número fica de fora."
                                ],
                                example: { code: "for i in range(1, 4):\n    print(i)", output: "1\n2\n3" }
                            }
                        ],
                        exercises: [
                            {
                                type: "choice",
                                question: "Para que serve o for?",
                                options: ["Repetir algo várias vezes", "Guardar valores", "Mostrar na tela", "Tomar decisões"]
                            },
                            {
                                type: "blank",
                                question: "Complete o laço para contar de 0 a 2",
                                code: "for i in ___(3):\n    print(i)",
                                placeholder: "digite a função",
                                answer: "range"
                            },
                            {
                                type: "code",
                                question: "Use um for com range para mostrar os números 1, 2 e 3, um por linha.",
                                expected: "1\n2\n3",
                                mustInclude: ["for", "range("]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "html",
        name: "HTML",
        icon: "</>",
        description: "Estruture páginas web com marcação semântica e acessível.",
        units: [
            {
                title: "Estrutura",
                description: "Tags básicas para montar páginas web",
                lessons: [
                    {
                        id: "html-1",
                        title: "Primeiro título",
                        teach: [
                            {
                                term: "h1",
                                lines: [
                                    "h1 vem de heading 1, ou título nível 1.",
                                    "É o título mais importante de uma página.",
                                    "Em HTML, os elementos ficam entre < e >."
                                ],
                                example: { code: "<h1>Olá!</h1>", output: "Olá! (em letras grandes)" }
                            }
                        ],
                        exercises: [
                            {
                                type: "choice",
                                question: "O que h1 significa em HTML?",
                                options: ["Título principal", "Parágrafo", "Imagem", "Link"]
                            },
                            {
                                type: "blank",
                                question: "Complete a tag para criar um título",
                                code: "<___>Olá</___>",
                                placeholder: "digite a tag",
                                answer: "h1"
                            },
                            {
                                type: "code",
                                question: "Escreva uma tag h1 com o texto Olá, mundo!",
                                expected: "<h1>Olá, mundo!</h1>"
                            }
                        ]
                    },
                    {
                        id: "html-2",
                        title: "Parágrafos",
                        teach: [
                            {
                                term: "p",
                                lines: [
                                    "p vem de paragraph, ou parágrafo.",
                                    "Serve para blocos de texto comuns.",
                                    "É a tag mais usada para escrever conteúdo."
                                ],
                                example: { code: "<p>Este é um texto.</p>", output: "Este é um texto." }
                            }
                        ],
                        exercises: [
                            {
                                type: "choice",
                                question: "Qual tag cria um parágrafo?",
                                options: ["p", "h1", "div", "span"]
                            },
                            {
                                type: "blank",
                                question: "Complete a tag de parágrafo",
                                code: "<___>Texto aqui</___>",
                                placeholder: "digite a tag",
                                answer: "p"
                            },
                            {
                                type: "code",
                                question: "Escreva um parágrafo com o texto Bom dia",
                                expected: "<p>Bom dia</p>"
                            }
                        ]
                    },
                    {
                        id: "html-3",
                        title: "Listas",
                        teach: [
                            {
                                term: "ul",
                                lines: [
                                    "ul vem de unordered list, lista sem ordem.",
                                    "Cada item da lista usa a tag li.",
                                    "li vem de list item, item de lista."
                                ],
                                example: { code: "<ul>\n  <li>Pão</li>\n  <li>Leite</li>\n</ul>", output: "• Pão\n• Leite" }
                            }
                        ],
                        exercises: [
                            {
                                type: "choice",
                                question: "Qual tag cria um item de lista?",
                                options: ["li", "ul", "list", "item"]
                            },
                            {
                                type: "blank",
                                question: "Complete a tag do item",
                                code: "<ul><___>Item</___></ul>",
                                placeholder: "digite a tag",
                                answer: "li"
                            },
                            {
                                type: "code",
                                question: "Crie uma lista com um item escrito Café",
                                expected: "<ul><li>Café</li></ul>"
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
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
                        teach: [
                            {
                                term: "color",
                                lines: [
                                    "color significa cor em inglês.",
                                    "Em CSS, color muda a cor do texto.",
                                    "Você escolhe um elemento e dá uma cor."
                                ],
                                example: { code: "p { color: red; }", output: "Texto do parágrafo em vermelho" }
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
                        teach: [
                            {
                                term: "font-size",
                                lines: [
                                    "font-size significa tamanho da fonte.",
                                    "Em CSS, você define o tamanho em pixels (px).",
                                    "font-size: 20px deixa o texto com 20 pixels."
                                ],
                                example: { code: "h1 { font-size: 40px; }", output: "Título gigante" }
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
                        teach: [
                            {
                                term: "background",
                                lines: [
                                    "background significa fundo em inglês.",
                                    "background muda a cor de trás do elemento.",
                                    "background: yellow deixa o fundo amarelo."
                                ],
                                example: { code: "body { background: black; }", output: "Fundo da página preto" }
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
            }
        ]
    }
];

for (const track of TRACKS) {
    track.lessons = track.units.flatMap((unit) => unit.lessons);
    track.lessons.forEach((lesson, i) => {
        Object.assign(lesson, { track, previous: track.lessons[i - 1], next: track.lessons[i + 1] });
    });
}

export const findTrack = (id) => TRACKS.find((track) => track.id === id) ?? TRACKS[0];

export const findLesson = (id) => TRACKS.flatMap((track) => track.lessons).find((lesson) => lesson.id === id);
