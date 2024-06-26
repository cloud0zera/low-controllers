const fs = require('fs');
const path = require('path');
const { parseLowSSToCSS } = require('./lowSSController');
const { executeLowJS } = require('./lowJSController');

function parseComponent(content) {
    // Função recursiva para processar componentes
    let result = content;
    const divRegex = /component\.div\s*=\s*\{([\s\S]*?)\}/g;
    result = result.replace(divRegex, (match, divContent) => {
        let classMatch = divContent.match(/class="([^"]+)"/);
        let classAttribute = classMatch ? ` class="${classMatch[1]}"` : '';
        divContent = divContent.replace(/class="[^"]+"/, ''); // Remove class do conteúdo
        return `<div${classAttribute}>${parseComponent(divContent.trim())}</div>`;
    });

    // Processar outros componentes (h1, p, etc.)
    result = result.replace(/component\.h1\s*=\s*"([^"]+)"/g, '<h1>$1</h1>');
    result = result.replace(/component\.paragraph\s*=\s*"([^"]+)"/g, '<p>$1</p>');

    return result;
}

function parseLowToHTML(lowFilePath) {
    let lowContent = fs.readFileSync(lowFilePath, 'utf8');
    let styleContent = '';
    let scriptContent = '';

    let htmlContent = lowContent;

    // Inicializar seções de HTML
    let headContent = '';
    let bodyContent = '';

    // Substituir <low-html> por <html>
    htmlContent = htmlContent.replace(/<low-html>/g, '<!DOCTYPE html>\n<html lang="en">');

    // Processar .head=
    const headMatch = /\.head=\s*\{([\s\S]*?)\}/.exec(htmlContent);
    if (headMatch) {
        headContent = headMatch[1].trim().replace(/component\.title\s*=\s*"([^"]+)"/, '<title>$1</title>');
        
        // Processar includeStyle
        const includeStyleMatch = /includeStyle\.archive\s*=\s*"([^"]+)"/.exec(headContent);
        if (includeStyleMatch) {
            const lowssFilePath = path.join(path.dirname(lowFilePath), includeStyleMatch[1]);
            if (fs.existsSync(lowssFilePath)) {
                const lowssContent = fs.readFileSync(lowssFilePath, 'utf8');
                styleContent = parseLowSSToCSS(lowssContent);
            }
            headContent = headContent.replace(includeStyleMatch[0], ''); // Remove o bloco original
        }

        // Processar includeScript
        const includeScriptMatch = /includeScript\.archive\s*=\s*"([^"]+)"/.exec(headContent);
        if (includeScriptMatch) {
            const lowjsFilePath = path.join(path.dirname(lowFilePath), includeScriptMatch[1]);
            if (fs.existsSync(lowjsFilePath)) {
                executeLowJS(lowjsFilePath);
                scriptContent = `<script src="${includeScriptMatch[1].replace('.lowjs', '.js')}"></script>`;
            }
            headContent = headContent.replace(includeScriptMatch[0], ''); // Remove o bloco original
        }

        htmlContent = htmlContent.replace(headMatch[0], ''); // Remove o bloco original
    }

    // Processar .body=
    const bodyMatch = /\.body=\s*\{([\s\S]*?)\}/.exec(htmlContent);
    if (bodyMatch) {
        bodyContent = parseComponent(bodyMatch[1].trim());
        htmlContent = htmlContent.replace(bodyMatch[0], ''); // Remove o bloco original
    }

    // Construir HTML final
    htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        ${headContent}
        <style>
            ${styleContent}
        </style>
        ${scriptContent}
    </head>
    <body>
        ${bodyContent}
    </body>
    </html>`;

    return htmlContent;
}

module.exports = {
    parseLowToHTML
};
