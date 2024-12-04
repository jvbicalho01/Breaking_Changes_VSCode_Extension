import jedi
import sys

def get_signature(code, line, column):
    script = jedi.Script(code)
    signatures = script.get_signatures(line=line, column=column)
    
    if signatures:
        signature = signatures[0]
        # Obtém apenas a representação em string sem tipos ou docstring
        return str(signature.to_string())
    return "Função não encontrada"

if __name__ == "__main__":
    code = sys.stdin.read()
    line = int(sys.argv[1])
    column = int(sys.argv[2])
    print(get_signature(code, line, column))
