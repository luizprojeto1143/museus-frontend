// Script para gerar ícones PWA a partir da logo
const sharp = require('sharp');
const path = require('path');

const inputImage = path.join(__dirname, 'public/logo-culturaviva.jpg');

async function generateIcons() {
    try {
        // Gerar ícone 192x192
        await sharp(inputImage)
            .resize(192, 192, { fit: 'contain', background: { r: 42, g: 26, b: 17, alpha: 1 } })
            .png()
            .toFile(path.join(__dirname, 'public/pwa-192x192.png'));
        console.log('✅ pwa-192x192.png gerado');

        // Gerar ícone 512x512
        await sharp(inputImage)
            .resize(512, 512, { fit: 'contain', background: { r: 42, g: 26, b: 17, alpha: 1 } })
            .png()
            .toFile(path.join(__dirname, 'public/pwa-512x512.png'));
        console.log('✅ pwa-512x512.png gerado');

        // Gerar favicon 32x32
        await sharp(inputImage)
            .resize(32, 32, { fit: 'contain', background: { r: 42, g: 26, b: 17, alpha: 1 } })
            .png()
            .toFile(path.join(__dirname, 'public/favicon.png'));
        console.log('✅ favicon.png gerado');

        // Gerar apple-touch-icon 180x180
        await sharp(inputImage)
            .resize(180, 180, { fit: 'contain', background: { r: 42, g: 26, b: 17, alpha: 1 } })
            .png()
            .toFile(path.join(__dirname, 'public/apple-touch-icon.png'));
        console.log('✅ apple-touch-icon.png gerado');

        console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao gerar ícones:', error);
    }
}

generateIcons();
