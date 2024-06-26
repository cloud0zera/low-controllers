const fs = require('fs');
const path = require('path');

function parseLowSSToCSS(lowssContent) {
    let cssContent = lowssContent;

    // Converter sintaxe LowSS para CSS
    cssContent = cssContent.replace(/([\w-]+)\s*:\s*\{([\s\S]*?)\}/g, (match, selector, properties) => {
        let formattedProperties = properties.trim().replace(/\n\s*/g, ' ');
        return `${selector} { ${formattedProperties} }`;
    });

    return cssContent;
}

module.exports = {
    parseLowSSToCSS
};
