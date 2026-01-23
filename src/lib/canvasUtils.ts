import { PixelCrop } from 'react-image-crop';

export async function getCroppedImg(
    image: HTMLImageElement, // Mudamos para receber o Elemento de Imagem direto
    crop: PixelCrop,
    fileName = 'cropped.jpg'
): Promise<File | null> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Define o tamanho final fixo (400x400 como no Husky)
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Configurações de qualidade para imagem suave
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
        image,
        crop.x * scaleX,        // Ajusta X para escala real
        crop.y * scaleY,        // Ajusta Y para escala real
        crop.width * scaleX,    // Ajusta Largura para escala real
        crop.height * scaleY,   // Ajusta Altura para escala real
        0,
        0,
        outputSize,             // Desenha no tamanho fixo 400
        outputSize              // Desenha no tamanho fixo 400
    );

    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }
                const file = new File([blob], fileName, { type: 'image/jpeg' });
                resolve(file);
            },
            'image/jpeg',
            0.95 // Qualidade 95%
        );
    });
}