import jedi

code = """
def soma(a, b=2):
    return a + b
"""

# Cria o script Jedi
script = jedi.Script(code)

# Usando o método 'get_names()' para listar todas as definições
names = script.get_names()

print("Nomes encontrados no código:")
for name in names:
    print(f"Nome: {name.full_name} - Descrição: {name.description}")

# Ajustando o método para pegar a assinatura da função corretamente
# Passando a linha e a coluna para o get_signatures, lembrando que Python é 1-based, então a linha da função começa em 2 e a coluna na 4
signatures = script.get_signatures(line=2, column=4)

print("\nAssinaturas encontradas:")
if signatures:
    for signature in signatures:
        print(f"Assinatura: {signature.name}")
        print(f"Parâmetros: {[param.name for param in signature.params]}")
else:
    print("Assinatura não encontrada.")
