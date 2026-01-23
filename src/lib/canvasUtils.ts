import { PixelCrop } from 'react-image-crop';

export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: PixelCrop,
    outputSize = 400 // Padrão 400x400, pode mudar para 512 se quiser mais qualidade
): Promise<File | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    // Configura o canvas para o tamanho quadrado desejado
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Desenha a imagem cortada no canvas redimensionado
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
    );

    // Transforma o canvas em um arquivo (Blob)
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            // Cria um objeto File a partir do Blob para facilitar o upload
            const file = new File([blob], 'product-thumbnail.jpg', { type: 'image/jpeg' });
            resolve(file);
        }, 'image/jpeg', 0.95); // Qualidade JPG 95%
    });
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });