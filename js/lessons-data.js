export const LESSONS = [
    {
        id: "py-1",
        title: "Olá, mundo!",
        instruction: "Toda jornada começa com uma saudação. Vamos aprender a imprimir texto na tela.",
        exercises: [
            {
                type: "multiple-choice",
                question: "Qual comando imprime texto em Python?",
                options: ["print()", "echo()", "console.log()", "printf()"],
                correct: 0
            },
            {
                type: "fill-blank",
                question: "Complete o código para imprimir a mensagem:",
                codeTemplate: "___('Olá, mundo!')",
                placeholder: "digite o comando",
                answer: "print"
            },
            {
                type: "write-code",
                question: "Escreva um código que imprima exatamente a mensagem Olá, mundo!",
                starter: "# Digite seu código abaixo\n",
                expectedOutput: "Olá, mundo!"
            }
        ]
    },
    {
        id: "py-2",
        title: "Variáveis",
        instruction: "Variáveis guardam valores. Pense nelas como caixas com nomes.",
        exercises: [
            {
                type: "multiple-choice",
                question: "Como criar uma variável chamada nome com o valor Ana?",
                options: ["nome = 'Ana'", "var nome = 'Ana'", "let nome = 'Ana'", "string nome = 'Ana'"],
                correct: 0
            },
            {
                type: "fill-blank",
                question: "Complete para criar a variável idade com valor 25:",
                codeTemplate: "idade ___ 25",
                placeholder: "digite o operador",
                answer: "="
            },
            {
                type: "write-code",
                question: "Crie uma variável chamada nome com o valor Ana e imprima essa variável.",
                starter: "# Digite seu código abaixo\n",
                expectedOutput: "Ana"
            }
        ]
    },
    {
        id: "py-3",
        title: "Números e texto",
        instruction: "Python diferencia números de texto. Strings ficam entre aspas, números não.",
        exercises: [
            {
                type: "multiple-choice",
                question: "Qual destes é uma string em Python?",
                options: ["'texto'", "42", "3.14", "True"],
                correct: 0
            },
            {
                type: "fill-blank",
                question: "Complete o código para juntar texto e número:",
                codeTemplate: "idade = 25\nprint('Idade: ' + ___(idade))",
                placeholder: "digite a função",
                answer: "str"
            },
            {
                type: "write-code",
                question: "Imprima o resultado da soma de 5 com 3.",
                starter: "# Digite seu código abaixo\n",
                expectedOutput: "8"
            }
        ]
    },
    {
        id: "py-4",
        title: "Condições",
        instruction: "Condições permitem que o programa tome decisões com base em comparações.",
        exercises: [
            {
                type: "multiple-choice",
                question: "Como verificar se a idade é maior ou igual a 18?",
                options: ["if idade >= 18:", "if idade >= 18 then", "if (idade >= 18)", "when idade >= 18"],
                correct: 0
            },
            {
                type: "fill-blank",
                question: "Complete a condição para verificar se é maior de idade:",
                codeTemplate: "idade = 20\n___ idade >= 18:\n    print('Maior de idade')",
                placeholder: "digite a palavra-chave",
                answer: "if"
            },
            {
                type: "write-code",
                question: "Se 10 for maior que 5, imprima a palavra maior. Use uma condição if.",
                starter: "# Digite seu código abaixo\n",
                expectedOutput: "maior"
            }
        ]
    },
    {
        id: "py-5",
        title: "Repetições",
        instruction: "Loops repetem blocos de código. O for é perfeito para contar.",
        exercises: [
            {
                type: "multiple-choice",
                question: "Como repetir um bloco 3 vezes em Python?",
                options: ["for i in range(3):", "for (i = 0; i < 3; i++)", "repeat 3", "loop 3 times"],
                correct: 0
            },
            {
                type: "fill-blank",
                question: "Complete o loop para contar de 0 a 2:",
                codeTemplate: "for i in ___(3):\n    print(i)",
                placeholder: "digite a função",
                answer: "range"
            },
            {
                type: "write-code",
                question: "Imprima os números 1, 2 e 3, um por linha, usando um loop for.",
                starter: "# Digite seu código abaixo\n",
                expectedOutput: "1\n2\n3"
            }
        ]
    }
];

export const UNIT_NAME = "Fundamentos de Python";
export const LESSON_XP_BASE = 10;
export const EXERCISE_XP = 2;

export const UNITS = [
    {
        id: "unit-1",
        title: "Fundamentos",
        description: "Variáveis, números e primeiras instruções em Python",
        lessons: ["py-1", "py-2", "py-3", "py-4", "py-5"]
    }
];

