import jedi
import sys

def get_signature(code, line, column):
    script = jedi.Script(code)
    signatures = script.get_signatures(line=line, column=column)

    if signatures:
        signature = signatures[0]
        params_info = []

        for param in signature.params:
            param_str = param.name
            default = param.get_default()
            if default is not None:
                param_str += f"={default}"
            params_info.append(param_str)

        return f"{signature.name}({', '.join(params_info)})"
    return "Função não encontrada"

if __name__ == "__main__":
    code = sys.argv[1]
    line = int(sys.argv[2])
    column = int(sys.argv[3])
    print(get_signature(code, line, column))
