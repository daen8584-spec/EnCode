export default {
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
                            meaning: "imprimir",
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
                            mustInclude: ["print("],
                            solution: "print(\"Olá, mundo!\")"
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
                            mustInclude: ["nome =", "print(nome)"],
                            solution: "nome = \"Ana\"\nprint(nome)"
                        }
                    ]
                },
                {
                    id: "py-3",
                    title: "Texto e números",
                    teach: [
                        {
                            term: "string",
                            meaning: "texto (literalmente, um “fio” de letras)",
                            lines: [
                                "string é o nome que damos para texto.",
                                "Em Python, string fica entre aspas.",
                                "Pode usar aspas simples ou duplas."
                            ],
                            example: { code: "nome = \"Ana\"\ncor = 'azul'\nprint(nome)\nprint(cor)", output: "Ana\nazul" }
                        },
                        {
                            term: "int",
                            meaning: "inteiro",
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
                            mustInclude: ["+"],
                            solution: "print(5 + 3)"
                        }
                    ]
                },
                {
                    id: "py-4",
                    title: "Decisões",
                    teach: [
                        {
                            term: "if",
                            meaning: "se",
                            lines: [
                                "if significa se em inglês.",
                                "Serve para tomar decisões no código.",
                                "O bloco do if só roda se a condição for verdadeira."
                            ],
                            example: { code: "idade = 20\nif idade >= 18:\n    print(\"Maior\")", output: "Maior" }
                        },
                        {
                            term: "else",
                            meaning: "senão",
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
                            type: "order",
                            question: "Monte o código que mostra Menor",
                            lines: ["idade = 10", "if idade >= 18:", "    print(\"Maior\")", "else:", "    print(\"Menor\")"]
                        },
                        {
                            type: "code",
                            question: "Se 10 for maior que 5, mostre a palavra maior usando print.",
                            expected: "maior",
                            mustInclude: ["if"],
                            solution: "if 10 > 5:\n    print(\"maior\")"
                        }
                    ]
                },
                {
                    id: "py-5",
                    title: "Repetir ações",
                    teach: [
                        {
                            term: "for",
                            meaning: "para",
                            lines: [
                                "for significa para em inglês.",
                                "Serve para repetir algo várias vezes.",
                                "É como dizer: faça isso para cada item."
                            ],
                            example: { code: "for i in range(3):\n    print(i)", output: "0\n1\n2" }
                        },
                        {
                            term: "range",
                            meaning: "intervalo",
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
                            mustInclude: ["for", "range("],
                            solution: "for i in range(1, 4):\n    print(i)"
                        }
                    ]
                }
            ]
        },
        {
            title: "Listas e funções",
            description: "Guarde vários valores, repita ações e crie suas próprias funções",
            lessons: [
                {
                    id: "py-6",
                    title: "Listas",
                    teach: [
                        {
                            term: "list",
                            meaning: "lista",
                            lines: [
                                "list significa lista em inglês.",
                                "Uma lista guarda vários valores em ordem, entre [ ].",
                                "Cada item tem uma posição, e a contagem começa no 0."
                            ],
                            example: {
                                code: "frutas = [\"maçã\", \"banana\", \"uva\"]\nprint(frutas[0])\nprint(frutas[2])",
                                output: "maçã\nuva"
                            }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Qual é a posição do primeiro item de uma lista?",
                            options: ["0", "1", "-1", "A"]
                        },
                        {
                            type: "blank",
                            question: "Complete para mostrar verde",
                            code: "cores = [\"azul\", \"verde\"]\nprint(cores[___])",
                            placeholder: "digite a posição",
                            answer: "1"
                        },
                        {
                            type: "order",
                            question: "Monte o código que mostra cada nome da lista",
                            lines: ["nomes = [\"Ana\", \"Leo\"]", "for nome in nomes:", "    print(nome)"]
                        },
                        {
                            type: "code",
                            question: "Crie uma lista numeros com 10, 20 e 30 e mostre o segundo item.",
                            expected: "20",
                            mustInclude: ["numeros = [", "numeros[1]"],
                            solution: "numeros = [10, 20, 30]\nprint(numeros[1])"
                        }
                    ]
                },
                {
                    id: "py-7",
                    title: "Medir e adicionar",
                    teach: [
                        {
                            term: "len",
                            meaning: "comprimento (de length)",
                            lines: [
                                "len vem de length, que significa comprimento.",
                                "len() conta quantos itens uma lista tem.",
                                "Também funciona com texto: len(\"oi\") é 2."
                            ],
                            example: { code: "frutas = [\"maçã\", \"uva\"]\nprint(len(frutas))", output: "2" }
                        },
                        {
                            term: "append",
                            meaning: "acrescentar",
                            lines: [
                                "append significa acrescentar em inglês.",
                                "lista.append(x) coloca x no fim da lista.",
                                "A lista cresce sem precisar criar outra."
                            ],
                            example: {
                                code: "compras = []\ncompras.append(\"pão\")\ncompras.append(\"leite\")\nprint(compras)",
                                output: "['pão', 'leite']"
                            }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que len() faz?",
                            options: ["Conta quantos itens existem", "Apaga a lista", "Ordena a lista", "Junta duas listas"]
                        },
                        {
                            type: "blank",
                            question: "Complete para adicionar 4 no fim da lista",
                            code: "numeros = [1, 2, 3]\nnumeros.___(4)",
                            placeholder: "digite o método",
                            answer: "append"
                        },
                        {
                            type: "code",
                            question: "Crie uma lista vazia chamada tarefas, adicione \"estudar\" com append e mostre quantos itens ela tem.",
                            expected: "1",
                            mustInclude: ["append(", "len("],
                            solution: "tarefas = []\ntarefas.append(\"estudar\")\nprint(len(tarefas))"
                        }
                    ]
                },
                {
                    id: "py-8",
                    title: "Repetir enquanto",
                    teach: [
                        {
                            term: "while",
                            meaning: "enquanto",
                            lines: [
                                "while significa enquanto em inglês.",
                                "Repete o bloco enquanto a condição for verdadeira.",
                                "Cuidado: se a condição nunca ficar falsa, o laço não para."
                            ],
                            example: {
                                code: "contador = 1\nwhile contador <= 3:\n    print(contador)\n    contador = contador + 1",
                                output: "1\n2\n3"
                            }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que while significa em português?",
                            options: ["enquanto", "se", "para", "senão"]
                        },
                        {
                            type: "order",
                            question: "Monte a contagem regressiva que mostra 3, 2 e 1",
                            lines: ["n = 3", "while n > 0:", "    print(n)", "    n = n - 1"]
                        },
                        {
                            type: "code",
                            question: "Use while para mostrar 5, 4, 3, 2 e 1, um por linha.",
                            expected: "5\n4\n3\n2\n1",
                            mustInclude: ["while"],
                            solution: "n = 5\nwhile n > 0:\n    print(n)\n    n = n - 1"
                        }
                    ]
                },
                {
                    id: "py-9",
                    title: "Funções",
                    teach: [
                        {
                            term: "def",
                            meaning: "definir (de define)",
                            lines: [
                                "def vem de define, que significa definir.",
                                "Com def você cria uma função: um bloco de código com nome.",
                                "Depois é só chamar a função pelo nome, com ( )."
                            ],
                            example: { code: "def ola():\n    print(\"Olá!\")\n\nola()\nola()", output: "Olá!\nOlá!" }
                        },
                        {
                            term: "return",
                            meaning: "retornar, devolver",
                            lines: [
                                "return significa retornar, devolver.",
                                "A função devolve um valor para quem a chamou.",
                                "Você pode guardar esse valor ou mostrar com print."
                            ],
                            example: { code: "def dobro(n):\n    return n * 2\n\nprint(dobro(4))", output: "8" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que def faz?",
                            options: ["Cria uma função", "Apaga uma variável", "Repete um bloco", "Mostra algo na tela"]
                        },
                        {
                            type: "blank",
                            question: "Complete para a função devolver a soma",
                            code: "def soma(a, b):\n    ___ a + b",
                            placeholder: "digite a palavra-chave",
                            answer: "return"
                        },
                        {
                            type: "order",
                            question: "Monte o código que mostra 5",
                            lines: ["def soma(a, b):", "    return a + b", "print(soma(2, 3))"]
                        },
                        {
                            type: "code",
                            question: "Crie uma função triplo que retorna o número vezes 3 e mostre triplo(5).",
                            expected: "15",
                            mustInclude: ["def triplo(", "return"],
                            solution: "def triplo(n):\n    return n * 3\n\nprint(triplo(5))"
                        }
                    ]
                },
                {
                    id: "py-10",
                    title: "Desafio: tabuada",
                    challenge: true,
                    teach: [],
                    exercises: [
                        {
                            type: "order",
                            question: "Monte o programa que mostra só os números maiores que 2",
                            lines: ["for n in [1, 2, 3, 4]:", "    if n > 2:", "        print(n)"]
                        },
                        {
                            type: "code",
                            question: "Use for e range para mostrar a tabuada do 3, de 1 a 5, no formato 3 x 1 = 3. Dica: print aceita vários valores separados por vírgula.",
                            expected: "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15",
                            mustInclude: ["for", "range("],
                            solution: "for i in range(1, 6):\n    print(3, \"x\", i, \"=\", 3 * i)"
                        },
                        {
                            type: "code",
                            question: "Crie a lista notas com 7, 9 e 8. Use for para somar todas as notas e mostre o total.",
                            expected: "24",
                            mustInclude: ["notas = [", "for"],
                            solution: "notas = [7, 9, 8]\ntotal = 0\nfor n in notas:\n    total = total + n\nprint(total)"
                        }
                    ]
                }
            ]
        }
    ]
};
