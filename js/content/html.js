export default {
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
                            meaning: "título nível 1 (de heading 1)",
                            lines: [
                                "h1 vem de heading 1, ou título nível 1.",
                                "É o título mais importante de uma página.",
                                "Em HTML, os elementos ficam entre < e >."
                            ],
                            example: { code: "<h1>Olá!</h1>" }
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
                            meaning: "parágrafo (de paragraph)",
                            lines: [
                                "p vem de paragraph, ou parágrafo.",
                                "Serve para blocos de texto comuns.",
                                "É a tag mais usada para escrever conteúdo."
                            ],
                            example: { code: "<h1>Receita</h1>\n<p>Misture a farinha com o leite.</p>" }
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
                            meaning: "lista não ordenada (de unordered list)",
                            lines: [
                                "ul vem de unordered list, lista sem ordem.",
                                "Cada item da lista usa a tag li.",
                                "li vem de list item, item de lista."
                            ],
                            example: { code: "<ul>\n  <li>Pão</li>\n  <li>Leite</li>\n</ul>" }
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
                            type: "order",
                            question: "Monte uma lista com Arroz e depois Feijão",
                            lines: ["<ul>", "  <li>Arroz</li>", "  <li>Feijão</li>", "</ul>"]
                        },
                        {
                            type: "code",
                            question: "Crie uma lista com um item escrito Café",
                            expected: "<ul><li>Café</li></ul>"
                        }
                    ]
                }
            ]
        },
        {
            title: "Links e imagens",
            description: "Conecte páginas, mostre imagens e organize blocos",
            lessons: [
                {
                    id: "html-4",
                    title: "Links",
                    teach: [
                        {
                            term: "a",
                            meaning: "âncora (de anchor)",
                            lines: [
                                "a vem de anchor, que significa âncora.",
                                "A tag a cria um link para outra página.",
                                "O texto entre <a> e </a> é o que a pessoa clica."
                            ],
                            example: { code: "<a href=\"https://exemplo.com\">Visite o site</a>" }
                        },
                        {
                            term: "href",
                            meaning: "referência de hipertexto (de hypertext reference)",
                            lines: [
                                "href vem de hypertext reference.",
                                "É o atributo que guarda o endereço do link.",
                                "Atributos ficam dentro da tag de abertura: nome=\"valor\"."
                            ],
                            example: { code: "<p>Dúvidas? <a href=\"contato.html\">Fale conosco</a></p>" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Qual atributo guarda o endereço do link?",
                            options: ["href", "src", "link", "url"]
                        },
                        {
                            type: "blank",
                            question: "Complete o link para a Wikipédia",
                            code: "<a ___=\"https://wikipedia.org\">Wikipédia</a>",
                            placeholder: "digite o atributo",
                            answer: "href"
                        },
                        {
                            type: "code",
                            question: "Crie um link para https://python.org com o texto Python",
                            expected: "<a href=\"https://python.org\">Python</a>"
                        }
                    ]
                },
                {
                    id: "html-5",
                    title: "Imagens",
                    teach: [
                        {
                            term: "img",
                            meaning: "imagem (de image)",
                            lines: [
                                "img vem de image, imagem.",
                                "A tag img mostra uma imagem e não tem tag de fechamento.",
                                "O atributo src, de source (origem), indica o arquivo."
                            ],
                            example: { code: "<img src=\"gato.png\" alt=\"Um gato dormindo\">" }
                        },
                        {
                            term: "alt",
                            meaning: "alternativo (de alternative)",
                            lines: [
                                "alt vem de alternative, alternativo.",
                                "Descreve a imagem para quem usa leitor de tela.",
                                "Se a imagem não carregar, o texto do alt aparece no lugar, como no exemplo."
                            ],
                            example: { code: "<img src=\"praia.jpg\" alt=\"Praia com coqueiros\">" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Para que serve o atributo alt?",
                            options: ["Descrever a imagem", "Mudar o tamanho", "Criar um link", "Pintar a imagem"]
                        },
                        {
                            type: "blank",
                            question: "Complete com o atributo que indica o arquivo da imagem",
                            code: "<img ___=\"foto.jpg\" alt=\"Praia\">",
                            placeholder: "digite o atributo",
                            answer: "src"
                        },
                        {
                            type: "code",
                            question: "Mostre a imagem logo.png com o texto alternativo Logo do site",
                            expected: "<img src=\"logo.png\" alt=\"Logo do site\">"
                        }
                    ]
                },
                {
                    id: "html-6",
                    title: "Blocos com div",
                    teach: [
                        {
                            term: "div",
                            meaning: "divisão (de division)",
                            lines: [
                                "div vem de division, divisão.",
                                "Ela agrupa outros elementos em um bloco.",
                                "Sozinha não muda a aparência, mas organiza a página."
                            ],
                            example: { code: "<div>\n  <h2>Ana</h2>\n  <p>Estudante</p>\n</div>" }
                        },
                        {
                            term: "class",
                            meaning: "classe",
                            lines: [
                                "class significa classe.",
                                "Dá um nome ao elemento para estilizar com CSS depois.",
                                "Vários elementos podem ter a mesma classe."
                            ],
                            example: { code: "<div class=\"cartao\">\n  <h2>Leo</h2>\n  <p>Professor</p>\n</div>" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que a div faz?",
                            options: ["Agrupa outros elementos", "Cria um link", "Mostra uma imagem", "Cria um título"]
                        },
                        {
                            type: "blank",
                            question: "Complete para dar a classe menu à div",
                            code: "<div ___=\"menu\"></div>",
                            placeholder: "digite o atributo",
                            answer: "class"
                        },
                        {
                            type: "order",
                            question: "Monte um cartão com título e texto",
                            lines: ["<div class=\"cartao\">", "  <h2>Ana</h2>", "  <p>Estudante</p>", "</div>"]
                        },
                        {
                            type: "code",
                            question: "Crie uma div com a classe caixa e, dentro dela, um parágrafo com o texto Oi",
                            expected: "<div class=\"caixa\"><p>Oi</p></div>"
                        }
                    ]
                },
                {
                    id: "html-7",
                    title: "Desafio: menu e perfil",
                    challenge: true,
                    teach: [],
                    exercises: [
                        {
                            type: "code",
                            question: "Crie uma lista ul com dois itens. Cada item tem um link: Início para index.html e Contato para contato.html",
                            expected: "<ul><li><a href=\"index.html\">Início</a></li><li><a href=\"contato.html\">Contato</a></li></ul>"
                        },
                        {
                            type: "code",
                            question: "Monte um perfil: uma div com a classe perfil contendo a imagem ana.png (alt Ana) e um h2 com Ana Souza",
                            expected: "<div class=\"perfil\"><img src=\"ana.png\" alt=\"Ana\"><h2>Ana Souza</h2></div>"
                        }
                    ]
                }
            ]
        }
    ]
};
