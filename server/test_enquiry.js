import fetch from 'node-fetch';

async function testEnquiry() {
    try {
        console.log('Sending request to /api/enquiries...');
        const payload = {
            productId: "67ccbd1ae1655adbbd410ae2", // dummy valid-looking id, maybe will pass format or we can use fake one
            enquiryType: 'made-to-order',
            contactName: 'Test User',
            contactEmail: 'test@example.com',
            contactPhone: '1234567890',
            customDescription: 'Test description',
            selectedOptions: {
                woodType: 'Oak',
                dimensions: '100x100'
            }
        };

        // Using a fake JWT in Authorization header might be needed if route is protected
        // But let's first check what the error is.
        const res = await fetch('http://localhost:5001/api/enquiries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ...' // Maybe the error is auth-related?
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Script error:', err);
    }
}

testEnquiry();
