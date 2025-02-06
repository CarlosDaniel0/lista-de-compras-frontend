<div style="display: flex; gap: 8px">
<img src="https://img.shields.io/badge/react-%2361DAFB.svg?&style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/typescript-%233178C6.svg?&style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/styled--components-%23DB7093.svg?&style=for-the-badge&logo=styled-components&logoColor=white" />
<img src="https://img.shields.io/badge/leaflet-%23199900.svg?&style=for-the-badge&logo=leaflet&logoColor=white" />
<img src="https://img.shields.io/badge/redux-%23764ABC.svg?&style=for-the-badge&logo=redux&logoColor=white" />
<img src="https://img.shields.io/badge/mapbox-%23000000.svg?&style=for-the-badge&logo=mapbox&logoColor=white" />
<img src="https://img.shields.io/badge/prisma-%232D3748.svg?&style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white"/>
</div>

# Lista de Compras

Faça suas listas de compras e acompanhe o valor gasto em um só lugar

## Bibliotecas

- [x] [date-fns](https://date-fns.org/)
- [x] [Leaflet](https://leafletjs.com/)
- [x] [Prisma](https://www.prisma.io/)
- [x] [React.js](https://react.dev/)
- [x] [Redux](https://redux.js.org/)
- [x] [SQLite](https://www.sqlite.org/)
- [x] [Styled Components](https://styled-components.com/)
- [x] [Tesseract.js](https://tesseract.projectnaptha.com/)
- [x] [Vite](https://vite.dev/)
- [x] [Zxing](https://www.npmjs.com/package/@zxing/library)

## Início Rápido

1 - Altere o nome do arquivo .env.example para .env e adicione as credencias do
[Mapbox](https://www.mapbox.com/) para configurar os estilos de camadas para o mapa

- [User Name](https://docs.mapbox.com/api/maps/styles/)
- [Style ID](https://docs.mapbox.com/api/maps/styles/) (Claro ou Escuro para combinar com o tema)
- [Token](https://console.mapbox.com/account/access-tokens/)
- [API URL](https://github.com/CarlosDaniel0/lista-de-compras-backend)
- [Google Client ID](https://console.cloud.google.com/apis/credentials?hl=pt-br)

![Exemplo de configuração de estilo de camada com o mapbox](/docs/mapbox.png)

> É possível configurar estilos de mapa personalizados e utilizá-los no projeto consulte a API do Mapbox para mais detalhes

2 - Faça a instalação das dependências

```bash
# Instalar as dependências
yarn
```

4 - Para configurar o funcionamento da PWA offile é necessário configurar
a estrutura do Banco de Dados embutido (SQLite) utilizando o prisma

Tipos de dados aceitos:

|  Prisma  | Tipo SQLite   |
|----------|---------------|
|  String  |     TEXT      |
|  Boolean |    BOOLEAN    |
|    Int   |    INTEGER    |
|   BigInt |    INTEGER    |
|   Float  |      REAL     |
|  Decimal |     DECIMAL   |
| DateTime |    NUMERIC    |
|    Json  |	 JSONB     |
|   Bytes  |  	 BLOB      |
|    Enum  | 	 TEXT      |

No terminal rode o comando para criar a estrutura das tabelas
em SQL para utiliza-las posteriormente durante a criação do banco
```bash
yarn migrate
```

Um arquivo SQL será  criado no diretório abaixo e será utilizado na 
criação do banco SQLite local
```
src
└─lib
   └─database
      │ migration.sql <<< 
      │ sqlite.ts
      │ worker.ts
```

3 - Rode o projeto

```bash
# Rodar o projeto
yarn dev
```