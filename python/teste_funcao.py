def soma(a, b=2):
    #"""Função que retorna a soma de dois números."""
    return a + b

def multiplica(x, y=1):
    #"""Multiplica dois números."""
    return x * y

class Calculadora:
    def __init__(self, valor_inicial=0):
        self.valor = valor_inicial
    
    def adiciona(self, x):
        self.valor += x
    
    def resultado(self):
        return self.valor

# Chamadas para testar a extensão
resultado_soma = soma(5)
resultado_multiplicacao = multiplica(4, 3)

calc = Calculadora()
calc.adiciona(10)
print(calc.resultado())
