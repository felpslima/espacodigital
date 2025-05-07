# Espaco Digital do Estudante

Este projeto contém uma solução SharePoint Framework (SPFx) que implementa web parts personalizadas para o portal Espaço Digital.

## Web Parts Incluídas

### Boas-Vindas
- Exibe uma mensagem de boas-vindas personalizada com o nome do usuário
- Mostra a foto do perfil do usuário
- Apresenta um carrossel de links úteis
- Suporta imagem de fundo personalizada

### Avisos
- Exibe avisos no topo da página
- Suporta textos formatados


## Pré-requisitos

- Node.js (versão 16.x ou superior)
- npm (versão 8.x ou superior)
- Yeoman e gulp-cli instalados globalmente
- Visual Studio Code (recomendado)
- Acesso a um ambiente SharePoint Online

## Instalação

1. Clone o repositório
```bash
git clone https://github.com/felpslima/espacodigital.git
cd EspacoDigital
```

2. Instale as dependências
```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento
```bash
gulp serve
```

## Compilação

Para gerar o pacote de solução para implantação:

1. Gere o bundle de produção
```bash
gulp bundle --ship
```

2. Gere o pacote de solução
```bash
gulp package-solution --ship
```

O pacote gerado estará disponível em:
```
sharepoint/solution/espaco-digital.sppkg
```

## Implantação

1. Acesse o Catálogo de Aplicativos do seu site SharePoint
2. Faça upload do arquivo `espaco-digital.sppkg`
3. Clique em "Implantar"
4. Após a implantação, as web parts estarão disponíveis para uso em qualquer página do site

## Estrutura do Projeto

```
EspacoDigital/
├── src/
│   ├── webparts/
│   │   ├── wellcome/        # Web part de Boas-Vindas
│   │   └── announcements/   # Web part de Anúncios
├── sharepoint/
│   └── solution/           # Pacote de solução gerado
└── config/                 # Configurações do projeto
```

## Desenvolvimento

- Use `gulp serve` para desenvolvimento local
- Use `gulp bundle --ship` para gerar versão de produção
- Use `gulp package-solution --ship` para gerar o pacote de solução


## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development