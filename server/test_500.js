import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function test() {
    try {
        const form = new FormData();
        form.append('name', 'Test Sofa');
        form.append('category', 'furniture');
        form.append('subcategory', 'Sofa');
        form.append('price', '500');
        form.append('quantity', '10');
        form.append('unit', 'pieces');
        form.append('productType', 'ready-stock');
        form.append('attributes', JSON.stringify({ upholsteryColors: ['Red'] }));
        form.append('customizationOptions', JSON.stringify({}));

        // Create a dummy image file
        fs.writeFileSync('dummy.jpg', 'dummy content');
        form.append('images', fs.createReadStream('dummy.jpg'));
        form.append('imageColors', 'Red');

        console.log('Sending request...');
        const res = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            body: form
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (fs.existsSync('dummy.jpg')) fs.unlinkSync('dummy.jpg');
    } catch (err) {
        console.error('Script error:', err);
    }
}

test();
