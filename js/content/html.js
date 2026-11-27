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
                            answer: "h1",
                            hint: "É a tag do título principal: a letra h seguida do número 1.",
                            explain: "<h1> é o título mais importante da página."
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
                            answer: "p",
                            hint: "É só uma letra, a primeira de parágrafo.",
                            explain: "<p> cria um parágrafo de texto."
                        },
                        {
                            type: "code",
                            question: "Escreva um título h1 com Diário e, embaixo, um parágrafo com o texto Bom dia",
                            expected: "<h1>Diário</h1><p>Bom dia</p>"
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
                            answer: "li",
                            hint: "Duas letras, de list item (item da lista).",
                            explain: "<li> é cada item dentro da lista <ul>."
                        },
                        {
                            type: "order",
                            question: "Monte uma lista com Arroz e depois Feijão",
                            lines: ["<ul>", "  <li>Arroz</li>", "  <li>Feijão</li>", "</ul>"]
                        },
                        {
                            type: "code",
                            question: "Crie um título h1 com Lanche e, embaixo, uma lista com um item escrito Café",
                            expected: "<h1>Lanche</h1><ul><li>Café</li></ul>"
                        }
                    ]
                },
                {
                    id: "html-m1",
                    title: "Máquinas quebradas",
                    machine: true,
                    teach: [],
                    exercises: [
                        {
                            type: "choice",
                            question: "A placa <h1>Bem-vindos<h1> deixa a página toda gigante. Qual é o erro?",
                            options: [
                                "A tag de fechamento precisa de uma barra: </h1>",
                                "h1 não existe",
                                "Falta um parágrafo",
                                "O texto precisa de aspas"
                            ]
                        },
                        {
                            type: "fix",
                            machine: "Placa da Escola",
                            story: "A placa deveria mostrar só o título grande, mas o parágrafo também ficou gigante.",
                            question: "Conserte a placa.",
                            broken: "<h1>Escola do Bit<h1>\n<p>Aulas todos os dias</p>",
                            expected: "<h1>Escola do Bit</h1><p>Aulas todos os dias</p>",
                            hint: "para fechar uma tag, use uma barra: </h1>."
                        },
                        {
                            type: "fix",
                            machine: "Lista de Compras",
                            story: "Os itens deveriam aparecer com bolinhas, mas o Leite saiu torto e sem bolinha.",
                            question: "Conserte a lista.",
                            broken: "<ul>\n  <li>Pão</li>\n  <i>Leite</i>\n</ul>",
                            expected: "<ul><li>Pão</li><li>Leite</li></ul>",
                            hint: "cada item da lista usa a tag li."
                        },
                        {
                            type: "fix",
                            machine: "Mural da Turma",
                            story: "O mural deveria ter um título e uma lista com Lápis e Caderno, mas os itens não aparecem como lista.",
                            question: "Conserte o mural.",
                            broken: "<h1>Material</h1>\n<ul>\n  <p>Lápis</p>\n  <p>Caderno</p>\n</ul>",
                            expected: "<h1>Material</h1><ul><li>Lápis</li><li>Caderno</li></ul>",
                            hint: "cada item de uma lista usa a tag li."
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
                            answer: "href",
                            hint: "É o atributo que guarda o endereço do link.",
                            explain: "href diz para onde o link leva."
                        },
                        {
                            type: "code",
                            question: "Crie um link para https://python.org com o texto Python",
                            expected: "<a href=\"https://python.org\">Python</a>"
                        },
                        {
                            type: "code",
                            question: "Crie um título h1 com Meus jogos e, embaixo, um link Xadrez para xadrez.html",
                            expected: "<h1>Meus jogos</h1><a href=\"xadrez.html\">Xadrez</a>"
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
                            answer: "src",
                            hint: "Três letras, de source (origem).",
                            explain: "src diz qual arquivo de imagem mostrar."
                        },
                        {
                            type: "code",
                            question: "Mostre a imagem logo.png com o texto alternativo Logo do site",
                            expected: "<img src=\"logo.png\" alt=\"Logo do site\">"
                        },
                        {
                            type: "order",
                            question: "Monte um cartão com título, foto e frase",
                            lines: ["<h1>Meu gato</h1>", "<img src=\"gato.png\" alt=\"Gato\">", "<p>Ele se chama Bolinha</p>"]
                        },
                        {
                            type: "code",
                            question: "Crie um link para fotos.html cujo conteúdo é a imagem foto.png com o texto alternativo Fotos",
                            expected: "<a href=\"fotos.html\"><img src=\"foto.png\" alt=\"Fotos\"></a>"
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
                            answer: "class",
                            hint: "É o atributo que dá um nome de grupo para o CSS usar depois.",
                            explain: "class=\"menu\" dá um nome para a div, que o CSS pode usar."
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
                        },
                        {
                            type: "code",
                            question: "Crie uma div com a classe card contendo um h1 com Bit e um parágrafo com Professor",
                            expected: "<div class=\"card\"><h1>Bit</h1><p>Professor</p></div>"
                        }
                    ]
                },
                {
                    id: "html-m2",
                    title: "Máquinas quebradas",
                    machine: true,
                    teach: [],
                    exercises: [
                        {
                            type: "choice",
                            question: "O link <a herf=\"jogos.html\">Jogos</a> não leva a lugar nenhum. Qual é o erro?",
                            options: [
                                "O atributo href está escrito errado",
                                "Falta uma imagem",
                                "O texto do link está errado",
                                "Links precisam de aspas simples"
                            ]
                        },
                        {
                            type: "fix",
                            machine: "Portal de Jogos",
                            story: "O portal deveria levar para a página de jogos, mas o clique não faz nada.",
                            question: "Conserte o link.",
                            broken: "<a herf=\"jogos.html\">Jogos</a>",
                            expected: "<a href=\"jogos.html\">Jogos</a>",
                            hint: "o atributo do endereço se escreve href."
                        },
                        {
                            type: "fix",
                            machine: "Álbum de Fotos",
                            story: "A foto não carrega e ninguém sabe o que ela mostra.",
                            question: "Conserte o nome do atributo e adicione o texto alternativo Praia.",
                            broken: "<img scr=\"praia.png\">",
                            expected: "<img src=\"praia.png\" alt=\"Praia\">",
                            hint: "src indica o arquivo, e alt descreve a imagem."
                        },
                        {
                            type: "fix",
                            machine: "Galeria",
                            story: "A foto deveria levar para galeria.html, mas o link fechou antes da imagem.",
                            question: "Conserte a galeria.",
                            broken: "<a href=\"galeria.html\"></a>\n<img src=\"foto.png\" alt=\"Foto\">",
                            expected: "<a href=\"galeria.html\"><img src=\"foto.png\" alt=\"Foto\"></a>",
                            hint: "a imagem precisa ficar entre <a> e </a>."
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
                            type: "choice",
                            question: "Num menu feito com lista, onde fica a tag a?",
                            options: ["Dentro de cada li", "Fora da ul", "Dentro do href", "Depois de </ul>"]
                        },
                        {
                            type: "order",
                            question: "Monte o cartão de jogo",
                            lines: ["<div class=\"jogo\">", "<h2>Xadrez</h2>", "<a href=\"xadrez.html\">Jogar</a>", "</div>"]
                        },
                        {
                            type: "code",
                            question: "Crie uma lista ul com dois itens. Cada item tem um link: Início para index.html e Contato para contato.html",
                            expected: "<ul><li><a href=\"index.html\">Início</a></li><li><a href=\"contato.html\">Contato</a></li></ul>"
                        },
                        {
                            type: "code",
                            question: "Monte um perfil: uma div com a classe perfil contendo a imagem ana.png (alt Ana) e um h2 com Ana Souza",
                            expected: "<div class=\"perfil\"><img src=\"ana.png\" alt=\"Ana\"><h2>Ana Souza</h2></div>"
                        },
                        {
                            type: "code",
                            question: "Crie uma div com a classe galeria contendo duas imagens: sol.png (alt Sol) e lua.png (alt Lua)",
                            expected: "<div class=\"galeria\"><img src=\"sol.png\" alt=\"Sol\"><img src=\"lua.png\" alt=\"Lua\"></div>"
                        }
                    ]
                }
            ]
        },
        {
            title: "Botões e seções",
            description: "Destaques, botões, campos e as partes de uma página",
            lessons: [
                {
                    id: "html-8",
                    title: "Destaques",
                    teach: [
                        {
                            term: "strong",
                            meaning: "forte",
                            lines: [
                                "strong significa forte.",
                                "Deixa o texto em destaque, em negrito.",
                                "Use para as palavras mais importantes."
                            ],
                            example: { code: "<p>Hoje tem <strong>prova</strong>!</p>" }
                        },
                        {
                            term: "em",
                            meaning: "ênfase (de emphasis)",
                            lines: [
                                "em vem de emphasis, ênfase.",
                                "Deixa o texto inclinado, em itálico.",
                                "Use para dar um tom diferente a uma palavra."
                            ],
                            example: { code: "<p>Eu <em>adoro</em> programar.</p>" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Qual tag deixa o texto em negrito?",
                            options: ["strong", "em", "p", "ul"]
                        },
                        {
                            type: "blank",
                            question: "Complete para dar ênfase à palavra lanche",
                            code: "<p>Não esqueça o <___>lanche</___>!</p>",
                            placeholder: "digite a tag",
                            answer: "em",
                            hint: "Duas letras, de emphasis (ênfase).",
                            explain: "<em> dá ênfase ao texto, que aparece em itálico."
                        },
                        {
                            type: "code",
                            question: "Escreva um parágrafo com o texto Muito importante, com a palavra importante dentro de strong",
                            expected: "<p>Muito <strong>importante</strong></p>"
                        },
                        {
                            type: "order",
                            question: "Monte a lista com o segundo item em negrito",
                            lines: ["<ul>", "<li>Lápis</li>", "<li><strong>Caderno</strong></li>", "</ul>"]
                        },
                        {
                            type: "code",
                            question: "Crie um h1 com Recado e um parágrafo Não esqueça o lanche, com a palavra lanche dentro de em",
                            expected: "<h1>Recado</h1><p>Não esqueça o <em>lanche</em></p>"
                        }
                    ]
                },
                {
                    id: "html-9",
                    title: "Botões",
                    teach: [
                        {
                            term: "button",
                            meaning: "botão",
                            lines: [
                                "button significa botão.",
                                "Cria um botão que a pessoa pode clicar.",
                                "O texto entre as tags aparece no botão."
                            ],
                            example: { code: "<button>Jogar</button>" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Qual tag cria um botão?",
                            options: ["button", "bottom", "click", "input"]
                        },
                        {
                            type: "blank",
                            question: "Complete a tag do botão",
                            code: "<___>Enviar</___>",
                            placeholder: "digite a tag",
                            answer: "button",
                            hint: "Em inglês, \"botão\".",
                            explain: "<button> cria um botão que dá para clicar."
                        },
                        {
                            type: "order",
                            question: "Monte um cartão com o título Quiz e depois o botão Começar",
                            lines: ["<div>", "  <h2>Quiz</h2>", "  <button>Começar</button>", "</div>"]
                        },
                        {
                            type: "code",
                            question: "Crie um botão com o texto Curtir",
                            expected: "<button>Curtir</button>"
                        },
                        {
                            type: "blank",
                            question: "Complete o cartão com um botão",
                            code: "<div class=\"jogo\">\n  <h2>Pega-pega</h2>\n  <___>Jogar</___>\n</div>",
                            placeholder: "digite a tag",
                            answer: "button",
                            hint: "Em inglês, \"botão\".",
                            explain: "<button> cria um botão que dá para clicar."
                        },
                        {
                            type: "code",
                            question: "Crie uma div com a classe quiz contendo um parágrafo Pronto? e um botão Sim",
                            expected: "<div class=\"quiz\"><p>Pronto?</p><button>Sim</button></div>"
                        }
                    ]
                },
                {
                    id: "html-10",
                    title: "Campos",
                    teach: [
                        {
                            term: "input",
                            meaning: "entrada",
                            lines: [
                                "input significa entrada.",
                                "Cria um campo para a pessoa digitar.",
                                "Assim como img, não tem tag de fechamento."
                            ],
                            example: { code: "<input placeholder=\"Seu nome\">" }
                        },
                        {
                            term: "placeholder",
                            meaning: "texto de exemplo (que guarda o lugar)",
                            lines: [
                                "placeholder significa algo que guarda o lugar.",
                                "É o texto clarinho que aparece antes de digitar.",
                                "Ele some quando a pessoa começa a escrever."
                            ],
                            example: { code: "<input placeholder=\"Digite seu apelido\">" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que o placeholder mostra?",
                            options: ["Um texto de exemplo dentro do campo", "Uma imagem", "Um botão", "Um link"]
                        },
                        {
                            type: "blank",
                            question: "Complete com o atributo do texto de exemplo",
                            code: "<input ___=\"Seu email\">",
                            placeholder: "digite o atributo",
                            answer: "placeholder",
                            hint: "É o texto de exemplo que aparece clarinho dentro do campo. Começa com place.",
                            explain: "placeholder mostra um exemplo dentro do campo antes de a pessoa digitar."
                        },
                        {
                            type: "code",
                            question: "Crie um campo com o texto de exemplo Sua cidade",
                            expected: "<input placeholder=\"Sua cidade\">"
                        },
                        {
                            type: "choice",
                            question: "Qual destas tags não tem tag de fechamento?",
                            options: ["input", "button", "p", "div"]
                        },
                        {
                            type: "order",
                            question: "Monte o cadastro do clube",
                            lines: ["<h2>Entrar no clube</h2>", "<input placeholder=\"Seu nome\">", "<button>Entrar</button>"]
                        },
                        {
                            type: "code",
                            question: "Crie uma div com a classe busca contendo um campo com o texto de exemplo Procurar e um botão Ir",
                            expected: "<div class=\"busca\"><input placeholder=\"Procurar\"><button>Ir</button></div>"
                        }
                    ]
                },
                {
                    id: "html-11",
                    title: "Partes da página",
                    teach: [
                        {
                            term: "header",
                            meaning: "cabeçalho",
                            lines: [
                                "header significa cabeçalho.",
                                "É a parte de cima da página, com título e menu.",
                                "Ajuda a organizar a página em partes."
                            ],
                            example: { code: "<header>\n  <h1>Meu blog</h1>\n</header>" }
                        },
                        {
                            term: "footer",
                            meaning: "rodapé",
                            lines: [
                                "footer significa rodapé.",
                                "É a parte de baixo da página.",
                                "Costuma ter contatos e informações finais."
                            ],
                            example: { code: "<footer>\n  <p>Feito por Ana</p>\n</footer>" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Onde fica o footer?",
                            options: ["Na parte de baixo da página", "No topo", "No meio", "Fora da página"]
                        },
                        {
                            type: "blank",
                            question: "Complete com a parte de cima da página",
                            code: "<___>\n  <h1>Clube de Leitura</h1>\n</___>",
                            placeholder: "digite a tag",
                            answer: "header",
                            hint: "Em inglês, \"cabeçalho\": a parte de cima da página.",
                            explain: "<header> é o cabeçalho, a parte de cima da página."
                        },
                        {
                            type: "code",
                            question: "Crie um footer com um parágrafo escrito Fim da página",
                            expected: "<footer><p>Fim da página</p></footer>"
                        },
                        {
                            type: "blank",
                            question: "Complete com a parte de baixo da página",
                            code: "<header>\n  <h1>Clube do Bit</h1>\n</header>\n<p>Bem-vindos!</p>\n<___>\n  <p>Feito pela turma</p>\n</___>",
                            placeholder: "digite a tag",
                            answer: "footer",
                            hint: "Em inglês, \"rodapé\": a parte de baixo, o pé da página.",
                            explain: "<footer> é o rodapé, a parte de baixo da página."
                        },
                        {
                            type: "order",
                            question: "Monte o topo da página com título e menu",
                            lines: [
                                "<header>",
                                "<h1>Jogos</h1>",
                                "<ul>",
                                "<li><a href=\"xadrez.html\">Xadrez</a></li>",
                                "</ul>",
                                "</header>"
                            ]
                        },
                        {
                            type: "code",
                            question: "Monte uma página: um header com o h1 Meu blog, depois um parágrafo Olá! e um footer com um parágrafo Tchau",
                            expected: "<header><h1>Meu blog</h1></header><p>Olá!</p><footer><p>Tchau</p></footer>"
                        }
                    ]
                },
                {
                    id: "html-m3",
                    title: "Máquinas quebradas",
                    machine: true,
                    teach: [],
                    exercises: [
                        {
                            type: "choice",
                            question: "<button>Enviar</buton> está errado. O que aconteceu?",
                            options: [
                                "A tag de fechamento foi escrita errado",
                                "button não existe",
                                "Falta um atributo",
                                "Botões não podem ter texto"
                            ]
                        },
                        {
                            type: "fix",
                            machine: "Botão Mágico",
                            story: "O botão deveria terminar depois de Abracadabra, mas o resto da página entrou nele.",
                            question: "Conserte o botão.",
                            broken: "<button>Abracadabra</buton>\n<p>Fim do show</p>",
                            expected: "<button>Abracadabra</button><p>Fim do show</p>",
                            hint: "a tag de fechamento precisa ser igual à de abertura."
                        },
                        {
                            type: "fix",
                            machine: "Cadastro do Clube",
                            story: "O campo deveria mostrar o texto de exemplo Seu apelido, mas aparece vazio.",
                            question: "Conserte o campo.",
                            broken: "<input placehold=\"Seu apelido\">",
                            expected: "<input placeholder=\"Seu apelido\">",
                            hint: "o atributo do texto de exemplo é placeholder."
                        },
                        {
                            type: "fix",
                            machine: "Barra de Busca",
                            story: "O campo deveria mostrar Buscar jogo como exemplo, mas o texto apareceu fora dele.",
                            question: "Conserte a barra de busca.",
                            broken: "<input>Buscar jogo</input>",
                            expected: "<input placeholder=\"Buscar jogo\">",
                            hint: "input não tem conteúdo: o texto de exemplo vai no atributo placeholder."
                        },
                        {
                            type: "fix",
                            machine: "Rodapé Fujão",
                            story: "O recado Até amanhã deveria ficar no rodapé, mas fugiu dele.",
                            question: "Conserte o rodapé.",
                            broken: "<footer></footer>\n<p>Até amanhã</p>",
                            expected: "<footer><p>Até amanhã</p></footer>",
                            hint: "o parágrafo precisa ficar entre <footer> e </footer>."
                        }
                    ]
                }
            ]
        }
    ]
};
