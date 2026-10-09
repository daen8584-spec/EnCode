export const LESSONS = [
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
                example: {
                    code: "print(\"Oi\")",
                    output: "Oi"
                }
            }
        ],
        exercises: [
            {
                type: "multiple-choice",
                question: "O que print() faz?",
                options: ["Mostra algo na tela", "Guarda um valor", "Apaga a tela", "Fecha o programa"],
                correct: 0
            },
            {
                type: "fill-blank",
                question: "Complete o código para mostrar Olá, mundo!",
                codeTemplate: "___(\"Olá, mundo!\")",
                placeholder: "digite o comando",
                answer: "print"
            },
            {
                type: "write-code",
                question: "Use print para mostrar a mensagem Olá, mundo!",
                starter: "# Digite seu código abaixo\n",
                expectedOutput: "Olá, mundo!"
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
                example: {
                    code: "nome = \"Ana\"\nprint(nome)",
                    output: "Ana"
                }
            }
        ],
        exercises: [
            {
                type: "multiple-choice",
                question: "O que é uma variável?",
                options: ["Uma caixa que guarda um valor", "Um comando de imprimir", "Um erro do Python", "Uma cor"],
                correct: 0
            },
            {
                type: "fill-blank",
                question: "Complete para criar a variável idade com o valor 25",
                codeTemplate: "idade ___ 25",
                placeholder: "digite o operador",
                answer: "="
            },
            {
                type: "write-code",
                question: "Crie uma variável chamada nome com o valor Ana e mostre com print.",
                starter: "# Digite seu código abaixo\n",
                expectedOutput: "Ana"
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
                example: {
                    code: "nome = \"Ana\"\ncor = 'azul'",
                    output: "Ana\nazul"
                }
            },
            {
                term: "int",
                lines: [
                    "int é abreviação de integer, número inteiro.",
                    "Números ficam sem aspas.",
                    "int e string são diferentes, mesmo parecidos."
                ],
                example: {
                    code: "idade = 25\nprint(idade + 1)",
                    output: "26"
                }
            }
        ],
        exercises: [
            {
                type: "multiple-choice",
                question: "Qual desses é uma string?",
                options: ["'texto'", "42", "3.14", "True"],
                correct: 0
            },
            {
                type: "fill-blank",
                question: "Complete para juntar texto e número",
                codeTemplate: "idade = 25\nprint('Idade: ' + ___(idade))",
                placeholder: "digite a função",
                answer: "str"
            },
            {
                type: "write-code",
                question: "Mostre o resultado da soma de 5 com 3.",
                starter: "# Digite seu código abaixo\n",
                expectedOutput: "8"
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
                example: {
                    code: "idade = 20\nif idade >= 18:\n    print(\"Maior\")",
                    output: "Maior"
                }
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
                type: "multiple-choice",
                question: "O que if significa em português?",
                options: ["se", "senão", "para", "enquanto"],
                correct: 0
            },
            {
                type: "fill-blank",
                question: "Complete a condição para verificar se é maior de idade",
                codeTemplate: "idade = 20\n___ idade >= 18:\n    print('Maior')",
                placeholder: "digite a palavra-chave",
                answer: "if"
            },
            {
                type: "write-code",
                question: "Se 10 for maior que 5, mostre a palavra maior.",
                starter: "# Digite seu código abaixo\n",
                expectedOutput: "maior"
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
                example: {
                    code: "for i in range(3):\n    print(i)",
                    output: "0\n1\n2"
                }
            },
            {
                term: "range",
                lines: [
                    "range significa intervalo em inglês.",
                    "range(3) cria a sequência 0, 1, 2.",
                    "O último número fica de fora."
                ],
                example: {
                    code: "for i in range(1, 4):\n    print(i)",
                    output: "1\n2\n3"
                }
            }
        ],
        exercises: [
            {
                type: "multiple-choice",
                question: "Para que serve o for?",
                options: ["Repetir algo várias vezes", "Guardar valores", "Mostrar na tela", "Tomar decisões"],
                correct: 0
            },
            {
                type: "fill-blank",
                question: "Complete o loop para contar de 0 a 2",
                codeTemplate: "for i in ___(3):\n    print(i)",
                placeholder: "digite a função",
                answer: "range"
            },
            {
                type: "write-code",
                question: "Mostre os números 1, 2 e 3, um por linha, usando for.",
                starter: "# Digite seu código abaixo\n",
                expectedOutput: "1\n2\n3"
            }
        ]
    }
];

export const UNITS = [
    {
        id: "unit-1",
        title: "Fundamentos",
        description: "Primeiros comandos e variáveis em Python",
        lessons: ["py-1", "py-2", "py-3", "py-4", "py-5"]
    }
];

export const LESSON_XP_BASE = 10;
export const EXERCISE_XP = 2;

