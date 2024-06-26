const fs = require('fs');

function executeLowJS(lowJSFilePath) {
    const lowJSContent = fs.readFileSync(lowJSFilePath, 'utf8');
    eval(lowJSContent); // Executa o código JavaScript

    // Salvar o script JS em um arquivo separado para ser incluído no HTML
    const jsFilePath = lowJSFilePath.replace('.lowjs', '.js');
    fs.writeFileSync(jsFilePath, lowJSContent);
}

module.exports = {
    executeLowJS
};
