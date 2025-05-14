
# 🧩 DABC Matcher - VSCode Extension

**DABC Matcher** é uma extensão para o Visual Studio Code que identifica chamadas de funções específicas das bibliotecas **NumPy**, **Pandas** e **Scikit-learn** (sklearn), verificando se parâmetros considerados importantes (chamados de parâmetros **DABC**) foram **omitidos**.

O foco é apoiar boas práticas de uso dessas bibliotecas, alertando o desenvolvedor sobre chamadas potencialmente incompletas ou que podem gerar comportamentos inesperados.

---

## ✨ Funcionalidades

- ✅ Detecta chamadas de funções conhecidas das bibliotecas `numpy`, `pandas` e `sklearn`.
- ✅ Verifica se o parâmetro definido como essencial foi passado.
- ✅ Aceita **passagem de parâmetro nomeada** (`axis=1`) e **posicional** (`argsort(1)`).
- ✅ **Ignora o parâmetro `self`** na contagem de posições em métodos de instância.
- ✅ Hover com explicação detalhada sobre a chamada.
- ✅ Sublinha a função em vermelho **se o parâmetro não foi passado**.
- ✅ Mantém sem sublinhado se o parâmetro foi passado corretamente.

---

## 📌 Exemplos de uso

### Função de exemplo:

```python
def argsort(self, axis=np._NoValue, kind=None, order=None, endwith=True, fill_value=None)
```

### Situações:

| Chamada                     | Resultado                                                                 |
|----------------------------|---------------------------------------------------------------------------|
| `np.argsort()`             | 🔴 Sublinhado <br> *“parâmetro 'axis' não passado - potencial DABC encontrado”* |
| `np.argsort(axis=1)`       | ✅ Sem sublinhado <br> *“parâmetro 'axis' passado”*                         |
| `np.argsort(1)`            | ✅ Sem sublinhado <br> *“parâmetro 'axis' passado (forma posicional)”*      |

> A análise considera tanto passagem **nomeada** quanto **posicional** e faz correspondência com a definição original da função, inclusive desconsiderando `self` quando presente.

---

## 📚 Como funciona internamente

A extensão utiliza um conjunto de funções conhecidas definidas em arquivos como `dabc_functions.ts`, por exemplo:

```ts
{
'id': 0,
  'dabc_msg': 'Previously, the default was documented to be -1, but that was in error. At some future date, the default will change to -1, as originally intended. Until then, the axis should be given explicitly when ``arr.ndim > 1``, to avoid a FutureWarning.',
  'version': '1.13.0',
  'class': 'MaskedArrayFutureWarning(FutureWarning)',
  'method': 'def argsort(self,axis=np._NoValue,kind=None,order=None,endwith=True,fill_value=None)',
  'param': 'axis : int',
  'default': 'np._NoValue',
  'dabc_module': 'Masked Arrays',
  'reason': 'Maintainability',
  'effect': 'Behavior'
}
```

Com base nisso, a extensão:

1. Analisa o texto do arquivo Python aberto.
2. Identifica chamadas de função (`argsort(...)`, `np.argsort(...)`, etc.).
3. Verifica se essa função está na lista de funções conhecidas.
4. Se estiver, analisa se o parâmetro indicado (por exemplo, `axis`) foi passado.
5. Mostra feedback no hover e sublinha a chamada **somente se o parâmetro for omitido**.

---

## 🧪 Bibliotecas suportadas

- 📘 **NumPy**
- 📗 **Pandas**
- 📙 **Scikit-learn**

Cada função tem sua assinatura e parâmetro crítico definidos manualmente em listas no arquivo `dabc_functions.ts`.

---

## ⚙️ Como executar a extensão localmente

### 1. Clone o repositório

```bash
git clone https://github.com/jvbicalho01/Breaking_Changes_VSCode_Extension
cd Breaking_Changes_VSCode_Extension
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Compile (se estiver usando TypeScript)

```bash
npm run compile
```

> Se estiver usando o VSCode, ele pode compilar automaticamente ao salvar (`Ctrl+S`).

### 4. Rode a extensão

- Pressione `F5` no VSCode para abrir uma nova janela de desenvolvimento com a extensão ativada.
    - Na primeira execução pode aparecer algumas opções, é só selecionar a "VS Code ... Developer", ou dar o comando `Ctrl+Shift+P` e selecione a opção "Debug: Start Debugging"
- Abra um arquivo `.py` e veja a mágica acontecer!

---

## 🧩 Estrutura de diretórios

```
├── src/
│   ├── extension.ts         ← Arquivo principal da extensão
│   ├── dabc_functions.ts    ← Listas de funções e parâmetros DABC
├── .vscode/
│   └── launch.json          ← Configuração para execução e debug
├── package.json             ← Configuração da extensão VSCode
├── tsconfig.json            ← Configuração do TypeScript
└── README.md                ← Este arquivo
```

---

## 🔧 Personalização

Você pode adicionar suas próprias funções ao arquivo `dabc_functions.ts`:

```ts
export const numpy_functions: DABC_Functions[] = [
  {
  'id': 0,
  'dabc_msg': 'Previously, the default was documented to be -1, but that was in error. At some future date, the default will change to -1, as originally intended. Until then, the axis should be given explicitly when ``arr.ndim > 1``, to avoid a FutureWarning.',
  'version': '1.13.0',
  'class': 'MaskedArrayFutureWarning(FutureWarning)',
  'method': 'def argsort(self,axis=np._NoValue,kind=None,order=None,endwith=True,fill_value=None)',
  'param': 'axis : int',
  'default': 'np._NoValue',
  'dabc_module': 'Masked Arrays',
  'reason': 'Maintainability',
  'effect': 'Behavior'
},
  ...
];
```

Basta seguir o mesmo formato para adicionar novas entradas, inclusive de outras bibliotecas.

---


## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.


