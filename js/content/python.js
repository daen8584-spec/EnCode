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
                            answer: "print",
                            hint: "É o comando que mostra coisas na tela. Em inglês, significa imprimir.",
                            explain: "print() mostra na tela o que está dentro dos parênteses."
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
                            answer: "=",
                            hint: "Em Python, um único sinal guarda o valor dentro da variável.",
                            explain: "O sinal = guarda o valor 25 dentro da caixa idade."
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
                            meaning: "texto (literalmente, um \"fio\" de letras)",
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
                            answer: "str",
                            hint: "O + só junta texto com texto. Qual comando transforma um número em texto?",
                            explain: "str() transforma o número 25 no texto '25', e aí o + consegue juntar os dois."
                        },
                        {
                            type: "code",
                            question: "Mostre o resultado da soma de 5 com 3 usando print.",
                            expected: "8",
                            mustInclude: ["+"],
                            solution: "print(5 + 3)"
                        },
                        {
                            type: "code",
                            question: "Crie idade = 10 e mostre a frase Tenho 10 anos usando print com o texto e a variável separados por vírgula.",
                            expected: "Tenho 10 anos",
                            mustInclude: ["idade =", "print("],
                            solution: "idade = 10\nprint(\"Tenho\", idade, \"anos\")"
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
                            lines: ["else significa senão em inglês.", "Roda quando o if é falso.", "É o plano B do seu código."],
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
                            answer: "if",
                            hint: "Em inglês, \"se\". É a palavra que começa uma condição.",
                            explain: "if testa a condição: se idade >= 18 for verdade, o código de dentro roda."
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
                            answer: "range",
                            hint: "É o comando que cria uma sequência de números para o for.",
                            explain: "range(3) cria os números 0, 1 e 2, um para cada volta do laço."
                        },
                        {
                            type: "code",
                            question: "Use um for com range para mostrar os números 1, 2 e 3, um por linha.",
                            expected: "1\n2\n3",
                            mustInclude: ["for", "range("],
                            solution: "for i in range(1, 4):\n    print(i)"
                        },
                        {
                            type: "order",
                            question: "Monte o código que mostra só o número 2",
                            lines: ["for i in range(1, 4):", "    if i == 2:", "        print(i)"]
                        }
                    ]
                },
                {
                    id: "py-m1",
                    title: "Máquinas quebradas",
                    machine: true,
                    teach: [],
                    exercises: [
                        {
                            type: "choice",
                            question: "A Máquina de Recados trava com print(\"Oi). O que está errado?",
                            options: [
                                "Faltam as aspas no final do texto",
                                "print está escrito errado",
                                "Faltam dois pontos",
                                "O texto é grande demais"
                            ]
                        },
                        {
                            type: "fix",
                            machine: "Máquina de Recados",
                            story: "Ela deveria dar bom dia para a turma, mas trava antes de falar.",
                            question: "Conserte o código para a máquina mostrar Bom dia, turma!",
                            broken: "print(\"Bom dia, turma!)",
                            expected: "Bom dia, turma!",
                            hint: "todo texto precisa abrir e fechar aspas.",
                            mustInclude: ["print("],
                            solution: "print(\"Bom dia, turma!\")"
                        },
                        {
                            type: "fix",
                            machine: "Contador de Estrelas",
                            story: "Ele deveria contar 1, 2 e 3, mas não sai nada por causa de uma letra.",
                            question: "Conserte o contador para mostrar 1, 2 e 3.",
                            broken: "for i in range(1, 4):\n    Print(i)",
                            expected: "1\n2\n3",
                            hint: "Python diferencia letras maiúsculas e minúsculas.",
                            mustInclude: ["for"],
                            solution: "for i in range(1, 4):\n    print(i)"
                        },
                        {
                            type: "fix",
                            machine: "Porteiro do Clube",
                            story: "Ele deveria deixar entrar quem tem 12 anos ou mais, mas está travado.",
                            question: "Conserte o porteiro para mostrar Pode entrar.",
                            broken: "idade = 15\nif idade >= 12\n    print(\"Pode entrar\")",
                            expected: "Pode entrar",
                            hint: "toda linha com if termina com dois pontos.",
                            mustInclude: ["if"],
                            solution: "idade = 15\nif idade >= 12:\n    print(\"Pode entrar\")"
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
                            answer: "1",
                            accept: ["-1"],
                            hint: "As posições da lista começam em 0, não em 1.",
                            explain: "\"azul\" está na posição 0 e \"verde\" na posição 1."
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
                        },
                        {
                            type: "code",
                            question: "Crie a lista pontos com 3, 8 e 5. Use for para mostrar só os pontos maiores que 4.",
                            expected: "8\n5",
                            mustInclude: ["for", "if"],
                            solution: "pontos = [3, 8, 5]\nfor p in pontos:\n    if p > 4:\n        print(p)"
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
                            answer: "append",
                            hint: "Em inglês, \"acrescentar\". É o método que coloca um item no fim da lista.",
                            explain: "numeros.append(4) coloca o 4 no fim da lista."
                        },
                        {
                            type: "code",
                            question: "Crie uma lista vazia chamada tarefas, adicione \"estudar\" com append e mostre quantos itens ela tem.",
                            expected: "1",
                            mustInclude: ["append(", "len("],
                            solution: "tarefas = []\ntarefas.append(\"estudar\")\nprint(len(tarefas))"
                        },
                        {
                            type: "blank",
                            question: "Complete para testar o tamanho da lista",
                            code: "amigos = [\"Ana\", \"Leo\"]\namigos.append(\"Bia\")\nif ___(amigos) > 2:\n    print(\"Turma cheia\")",
                            placeholder: "digite a função",
                            answer: "len",
                            hint: "É a função que conta quantos itens a lista tem. Vem de length, que quer dizer tamanho.",
                            explain: "len(amigos) conta os itens: são 3 amigos, mais que 2."
                        },
                        {
                            type: "code",
                            question: "Crie a lista vazia cesta. Use for com range(3) para adicionar \"maçã\" três vezes e mostre quantos itens a cesta tem.",
                            expected: "3",
                            mustInclude: ["for", "append(", "len("],
                            solution: "cesta = []\nfor i in range(3):\n    cesta.append(\"maçã\")\nprint(len(cesta))"
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
                        },
                        {
                            type: "blank",
                            question: "Complete para a vida diminuir a cada volta",
                            code: "vidas = 3\nwhile vidas > 0:\n    print(\"Vidas:\", vidas)\n    vidas = vidas ___ 1",
                            placeholder: "digite o sinal",
                            answer: "-",
                            hint: "Para a vida diminuir, que conta você faz com o 1?",
                            explain: "vidas - 1 tira uma vida a cada volta, até chegar a 0."
                        },
                        {
                            type: "code",
                            question: "Crie pulos = 0. Use while para somar 1 em pulos enquanto for menor que 4 e depois mostre pulos.",
                            expected: "4",
                            mustInclude: ["while"],
                            solution: "pulos = 0\nwhile pulos < 4:\n    pulos = pulos + 1\nprint(pulos)"
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
                            answer: "return",
                            hint: "É a palavra que faz a função devolver um resultado. Em inglês, \"retornar\".",
                            explain: "return devolve o resultado de a + b para quem chamou a função."
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
                        },
                        {
                            type: "code",
                            question: "Crie a função maior(a, b) que usa if para devolver o maior dos dois números. Mostre maior(7, 3).",
                            expected: "7",
                            mustInclude: ["def maior(", "if", "return"],
                            solution: "def maior(a, b):\n    if a > b:\n        return a\n    return b\n\nprint(maior(7, 3))"
                        }
                    ]
                },
                {
                    id: "py-m2",
                    title: "Máquinas quebradas",
                    machine: true,
                    teach: [],
                    exercises: [
                        {
                            type: "choice",
                            question: "nomes = [\"Ana\", \"Leo\"] e print(nomes[2]) dá erro. Por quê?",
                            options: [
                                "A lista só tem as posições 0 e 1",
                                "Listas não usam colchetes",
                                "print não aceita listas",
                                "Leo está escrito errado"
                            ]
                        },
                        {
                            type: "fix",
                            machine: "Robô das Frutas",
                            story: "Ele deveria mostrar a primeira fruta da lista, mas mostra a segunda.",
                            question: "Conserte o robô para mostrar maçã.",
                            broken: "frutas = [\"maçã\", \"uva\", \"pera\"]\nprint(frutas[1])",
                            expected: "maçã",
                            hint: "a primeira posição de uma lista é 0.",
                            mustInclude: ["frutas["],
                            solution: "frutas = [\"maçã\", \"uva\", \"pera\"]\nprint(frutas[0])"
                        },
                        {
                            type: "fix",
                            machine: "Foguete de Papel",
                            story: "A contagem deveria ir de 3 até 1, mas nunca para!",
                            question: "Conserte a contagem para mostrar 3, 2 e 1.",
                            broken: "n = 3\nwhile n > 0:\n    print(n)",
                            expected: "3\n2\n1",
                            hint: "dentro do while, algo precisa mudar para o laço parar.",
                            mustInclude: ["while"],
                            solution: "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1"
                        },
                        {
                            type: "fix",
                            machine: "Calculadora Dobradora",
                            story: "Ela deveria mostrar o dobro de 7, mas mostra None.",
                            question: "Conserte a função para mostrar 14.",
                            broken: "def dobro(n):\n    n * 2\n\nprint(dobro(7))",
                            expected: "14",
                            hint: "a função precisa devolver o resultado com return.",
                            mustInclude: ["return"],
                            solution: "def dobro(n):\n    return n * 2\n\nprint(dobro(7))"
                        },
                        {
                            type: "fix",
                            machine: "Contador de Figurinhas",
                            story: "Ele deveria contar quantas figurinhas tem no álbum, mas sempre mostra 0.",
                            question: "Conserte o contador para mostrar 3.",
                            broken: "album = [\"leão\", \"gato\", \"sapo\"]\ntotal = 0\nfor figurinha in album:\n    total = total + 0\nprint(total)",
                            expected: "3",
                            hint: "a cada figurinha, o total precisa aumentar 1.",
                            mustInclude: ["for"],
                            solution: "album = [\"leão\", \"gato\", \"sapo\"]\ntotal = 0\nfor figurinha in album:\n    total = total + 1\nprint(total)"
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
                            type: "choice",
                            question: "O que aparece com for i in range(1, 4): print(i * 2)?",
                            options: ["2, 4 e 6", "1, 2 e 3", "2, 4, 6 e 8", "1, 4 e 9"]
                        },
                        {
                            type: "blank",
                            question: "Complete para guardar só os números grandes",
                            code: "numeros = [4, 12, 7, 20]\ngrandes = []\nfor n in numeros:\n    if n > 10:\n        grandes.___(n)\nprint(grandes)",
                            placeholder: "digite o método",
                            answer: "append"
                        },
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
                        },
                        {
                            type: "code",
                            question: "Use while para mostrar 2, 4, 6 e 8, um por linha (some 2 a cada volta).",
                            expected: "2\n4\n6\n8",
                            mustInclude: ["while"],
                            solution: "n = 2\nwhile n <= 8:\n    print(n)\n    n = n + 2"
                        }
                    ]
                }
            ]
        },
        {
            title: "Decisões e números",
            description: "Mais caminhos para decidir e funções prontas do Python",
            lessons: [
                {
                    id: "py-11",
                    title: "Mais caminhos",
                    teach: [
                        {
                            term: "elif",
                            meaning: "senão se (de else if)",
                            lines: [
                                "elif é a junção de else e if: senão se.",
                                "Ele testa outra condição quando o if é falso.",
                                "Você pode usar quantos elif precisar."
                            ],
                            example: {
                                code: "nota = 7\nif nota >= 9:\n    print(\"Ótimo\")\nelif nota >= 6:\n    print(\"Bom\")\nelse:\n    print(\"Vamos treinar\")",
                                output: "Bom"
                            }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que elif significa?",
                            options: ["senão se", "enquanto", "para cada", "e também"]
                        },
                        {
                            type: "blank",
                            question: "Complete para testar outra condição",
                            code: "temperatura = 25\nif temperatura > 30:\n    print(\"Calor\")\n___ temperatura > 20:\n    print(\"Agradável\")",
                            placeholder: "digite a palavra-chave",
                            answer: "elif",
                            hint: "É a junção de else com if: \"senão, se\".",
                            explain: "elif testa outra condição quando a primeira deu falso."
                        },
                        {
                            type: "order",
                            question: "Monte o código que mostra Prata",
                            lines: ["pontos = 5", "if pontos > 8:", "    print(\"Ouro\")", "elif pontos > 3:", "    print(\"Prata\")"]
                        },
                        {
                            type: "code",
                            question: "Crie idade = 15. Se for menor que 12 mostre criança; senão, se for menor que 18, mostre adolescente.",
                            expected: "adolescente",
                            mustInclude: ["elif"],
                            solution: "idade = 15\nif idade < 12:\n    print(\"criança\")\nelif idade < 18:\n    print(\"adolescente\")"
                        },
                        {
                            type: "blank",
                            question: "Complete a função que diz o clima",
                            code: "def clima(graus):\n    if graus > 30:\n        return \"calor\"\n    ___ graus > 15:\n        return \"agradável\"\n    return \"frio\"\n\nprint(clima(20))",
                            placeholder: "digite a palavra-chave",
                            answer: "elif",
                            hint: "É a junção de else com if: \"senão, se\".",
                            explain: "elif testa outra condição quando a primeira deu falso: 20 não é maior que 30, mas é maior que 15."
                        },
                        {
                            type: "code",
                            question: "Crie notas = [9, 6, 3]. Use for e mostre ótimo para nota 9 ou mais, bom para 6 ou mais e treinar nos outros casos.",
                            expected: "ótimo\nbom\ntreinar",
                            mustInclude: ["for", "elif"],
                            solution: "notas = [9, 6, 3]\nfor nota in notas:\n    if nota >= 9:\n        print(\"ótimo\")\n    elif nota >= 6:\n        print(\"bom\")\n    else:\n        print(\"treinar\")"
                        }
                    ]
                },
                {
                    id: "py-12",
                    title: "E e ou",
                    teach: [
                        {
                            term: "and",
                            meaning: "e",
                            lines: [
                                "and significa e em inglês.",
                                "A condição só é verdadeira se as duas partes forem verdadeiras.",
                                "Exemplo: ter a idade certa e ter ingresso."
                            ],
                            example: {
                                code: "idade = 14\ningresso = True\nif idade >= 12 and ingresso:\n    print(\"Pode entrar\")",
                                output: "Pode entrar"
                            }
                        },
                        {
                            term: "or",
                            meaning: "ou",
                            lines: [
                                "or significa ou em inglês.",
                                "Basta uma das partes ser verdadeira.",
                                "O sinal == pergunta se duas coisas são iguais."
                            ],
                            example: {
                                code: "dia = \"sábado\"\nif dia == \"sábado\" or dia == \"domingo\":\n    print(\"Fim de semana!\")",
                                output: "Fim de semana!"
                            }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "Quando uma condição com and é verdadeira?",
                            options: [
                                "Quando as duas partes são verdadeiras",
                                "Quando pelo menos uma parte é verdadeira",
                                "Sempre",
                                "Nunca"
                            ]
                        },
                        {
                            type: "blank",
                            question: "Complete para ficar em casa se tiver chuva OU frio",
                            code: "chuva = True\nfrio = False\nif chuva ___ frio:\n    print(\"Fique em casa\")",
                            placeholder: "digite a palavra",
                            answer: "or",
                            hint: "Em inglês, \"ou\". Basta uma das condições ser verdade.",
                            explain: "Com or, basta chuva OU frio ser verdade para o código de dentro rodar."
                        },
                        {
                            type: "code",
                            question: "Crie nota = 8 e faltas = 2. Se a nota for maior que 6 e as faltas forem menores que 5, mostre aprovado.",
                            expected: "aprovado",
                            mustInclude: ["and"],
                            solution: "nota = 8\nfaltas = 2\nif nota > 6 and faltas < 5:\n    print(\"aprovado\")"
                        },
                        {
                            type: "choice",
                            question: "idade = 8. A condição idade < 5 or idade > 60 é verdadeira?",
                            options: [
                                "Não, nenhuma das duas partes é verdadeira",
                                "Sim, porque uma parte é verdadeira",
                                "Sim, porque or é sempre verdadeiro",
                                "Dá erro"
                            ]
                        },
                        {
                            type: "order",
                            question: "Monte o código que mostra Boa tarde",
                            lines: ["hora = 15", "if hora > 12 and hora < 18:", "    print(\"Boa tarde\")"]
                        },
                        {
                            type: "code",
                            question: "Crie a lista numeros com 3, 12, 7 e 20. Use for para mostrar só os números maiores que 5 e menores que 15.",
                            expected: "12\n7",
                            mustInclude: ["for", "and"],
                            solution: "numeros = [3, 12, 7, 20]\nfor n in numeros:\n    if n > 5 and n < 15:\n        print(n)"
                        }
                    ]
                },
                {
                    id: "py-13",
                    title: "Brincando com textos",
                    teach: [
                        {
                            term: "upper",
                            meaning: "de cima (letras maiúsculas)",
                            lines: [
                                "upper significa de cima, superior.",
                                "texto.upper() deixa todas as letras maiúsculas.",
                                "lower faz o contrário e deixa tudo minúsculo."
                            ],
                            example: { code: "nome = \"bit\"\nprint(nome.upper())\nprint(\"OI\".lower())", output: "BIT\noi" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que \"oi\".upper() mostra?",
                            options: ["OI", "oi", "Oi", "Um erro"]
                        },
                        {
                            type: "blank",
                            question: "Complete para mostrar PYTHON",
                            code: "print(\"python\".___())",
                            placeholder: "digite o método",
                            answer: "upper",
                            hint: "É o método das letras maiúsculas. Em inglês, upper quer dizer \"de cima\".",
                            explain: "\"python\".upper() deixa todas as letras maiúsculas: PYTHON."
                        },
                        {
                            type: "code",
                            question: "Crie a variável grito com o texto socorro e mostre em letras maiúsculas.",
                            expected: "SOCORRO",
                            mustInclude: ["upper()"],
                            solution: "grito = \"socorro\"\nprint(grito.upper())"
                        },
                        {
                            type: "choice",
                            question: "resposta = \"SIM\". O que resposta.lower() mostra?",
                            options: ["sim", "SIM", "Sim", "Dá erro"]
                        },
                        {
                            type: "blank",
                            question: "Complete para mostrar cada nome em maiúsculas",
                            code: "nomes = [\"ana\", \"leo\"]\nfor nome in nomes:\n    print(nome.___())",
                            placeholder: "digite o método",
                            answer: "upper",
                            hint: "É o método das letras maiúsculas. Em inglês, upper quer dizer \"de cima\".",
                            explain: "nome.upper() deixa cada nome com letras maiúsculas."
                        },
                        {
                            type: "code",
                            question: "Crie a função gritar(texto) que devolve o texto em maiúsculas. Mostre gritar(\"oba\").",
                            expected: "OBA",
                            mustInclude: ["def gritar(", "upper()", "return"],
                            solution: "def gritar(texto):\n    return texto.upper()\n\nprint(gritar(\"oba\"))"
                        }
                    ]
                },
                {
                    id: "py-14",
                    title: "Funções prontas",
                    teach: [
                        {
                            term: "sum",
                            meaning: "soma",
                            lines: [
                                "sum significa soma.",
                                "sum(lista) soma todos os números da lista.",
                                "É bem mais rápido que somar um por um."
                            ],
                            example: { code: "pontos = [3, 5, 2]\nprint(sum(pontos))", output: "10" }
                        },
                        {
                            term: "max",
                            meaning: "máximo",
                            lines: [
                                "max vem de maximum, máximo.",
                                "max(lista) devolve o maior número.",
                                "min faz o contrário e devolve o menor."
                            ],
                            example: { code: "notas = [7, 9, 6]\nprint(max(notas))\nprint(min(notas))", output: "9\n6" }
                        }
                    ],
                    exercises: [
                        {
                            type: "choice",
                            question: "O que max([4, 8, 2]) devolve?",
                            options: ["8", "2", "14", "4"]
                        },
                        {
                            type: "blank",
                            question: "Complete para mostrar o total de gols",
                            code: "gols = [1, 3, 2]\nprint(___(gols))",
                            placeholder: "digite a função",
                            answer: "sum",
                            hint: "Em inglês, \"soma\". Essa função soma todos os números da lista.",
                            explain: "sum(gols) soma 1 + 3 + 2 e mostra 6."
                        },
                        {
                            type: "code",
                            question: "Crie a lista idades com 12, 15 e 11 e mostre a maior idade.",
                            expected: "15",
                            mustInclude: ["max("],
                            solution: "idades = [12, 15, 11]\nprint(max(idades))"
                        },
                        {
                            type: "choice",
                            question: "pontos = [3, 9, 4]. O que sum(pontos) / len(pontos) calcula?",
                            options: ["A média dos pontos", "O maior ponto", "Quantos pontos existem", "O total de pontos"]
                        },
                        {
                            type: "blank",
                            question: "Complete para testar o total de gols",
                            code: "gols = [2, 0, 3]\nif ___(gols) > 4:\n    print(\"Grande campeonato\")",
                            placeholder: "digite a função",
                            answer: "sum",
                            hint: "Em inglês, \"soma\". Essa função soma todos os números da lista.",
                            explain: "sum(gols) soma 2 + 0 + 3 = 5, que é maior que 4."
                        },
                        {
                            type: "code",
                            question: "Crie a lista tempos com 30, 25 e 40. Adicione 20 com append e mostre o menor tempo com min.",
                            expected: "20",
                            mustInclude: ["append(", "min("],
                            solution: "tempos = [30, 25, 40]\ntempos.append(20)\nprint(min(tempos))"
                        }
                    ]
                },
                {
                    id: "py-m3",
                    title: "Máquinas quebradas",
                    machine: true,
                    teach: [],
                    exercises: [
                        {
                            type: "choice",
                            question: "Com nota 10, o código testa if nota >= 6 antes de elif nota >= 9. O que acontece?",
                            options: [
                                "O primeiro if já é verdadeiro e o elif nem é testado",
                                "As duas mensagens aparecem",
                                "Dá erro",
                                "Aparece Ótimo"
                            ]
                        },
                        {
                            type: "fix",
                            machine: "Medalhador",
                            story: "Ele deveria dar Ouro para 10 pontos, mas está dando Prata.",
                            question: "Conserte o medalhador para mostrar Ouro.",
                            broken: "pontos = 10\nif pontos > 5:\n    print(\"Prata\")\nelif pontos > 8:\n    print(\"Ouro\")",
                            expected: "Ouro",
                            hint: "teste primeiro a condição mais difícil.",
                            mustInclude: ["elif"],
                            solution: "pontos = 10\nif pontos > 8:\n    print(\"Ouro\")\nelif pontos > 5:\n    print(\"Prata\")"
                        },
                        {
                            type: "fix",
                            machine: "Porteiro do Parque",
                            story: "Ele deveria deixar entrar só quem tem altura E ingresso, mas deixa todo mundo.",
                            question: "Conserte o porteiro para mostrar Não pode.",
                            broken: "altura = 120\ningresso = False\nif altura >= 110 or ingresso:\n    print(\"Pode entrar\")\nelse:\n    print(\"Não pode\")",
                            expected: "Não pode",
                            hint: "para exigir as duas coisas, use and.",
                            mustInclude: ["and"],
                            solution: "altura = 120\ningresso = False\nif altura >= 110 and ingresso:\n    print(\"Pode entrar\")\nelse:\n    print(\"Não pode\")"
                        },
                        {
                            type: "fix",
                            machine: "Gritador de Nomes",
                            story: "Ele deveria gritar o nome em letras maiúsculas, mas sai baixinho.",
                            question: "Conserte para mostrar BIT.",
                            broken: "nome = \"bit\"\nprint(nome.lower())",
                            expected: "BIT",
                            hint: "para letras maiúsculas use upper.",
                            mustInclude: ["upper()"],
                            solution: "nome = \"bit\"\nprint(nome.upper())"
                        },
                        {
                            type: "fix",
                            machine: "Placar do Campeonato",
                            story: "Ele deveria somar os gols de todos os jogos, mas mostra só o maior.",
                            question: "Conserte para mostrar o total 9.",
                            broken: "gols = [2, 4, 3]\nprint(max(gols))",
                            expected: "9",
                            hint: "para somar tudo use sum.",
                            mustInclude: ["sum("],
                            solution: "gols = [2, 4, 3]\nprint(sum(gols))"
                        }
                    ]
                }
            ]
        }
    ]
};
