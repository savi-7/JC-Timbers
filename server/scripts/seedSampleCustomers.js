import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';

dotenv.config();

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

async function ensureDummyProduct() {
	let p = await Product.findOne({ name: 'Sample Product (Seed)' });
	if (p) return p;
	p = new Product({
		name: 'Sample Product (Seed)',
		description: 'Seeded product for order items',
		price: 999,
		category: 'timber',
		subcategory: 'generic',
		unit: 'pieces',
		quantity: 100000,
		isActive: true
	});
	await p.save();
	return p;
}

async function main() {
	await connectDB();
	const product = await ensureDummyProduct();

	const names = [
		['Aarav Sharma', 'aarav.sharma'],
		['Vivaan Mehta', 'vivaan.mehta'],
		['Diya Patel', 'diya.patel'],
		['Ishita Rao', 'ishita.rao'],
		['Aditya Singh', 'aditya.singh'],
		['Kavya Iyer', 'kavya.iyer'],
		['Arjun Verma', 'arjun.verma'],
		['Riya Jain', 'riya.jain'],
		['Kabir Gupta', 'kabir.gupta'],
		['Anaya Kulkarni', 'anaya.kulkarni']
	];

	for (const [fullName, handle] of names) {
		let user = await User.findOne({ email: handle + '@example.com' });
		if (!user) {
			user = new User({ name: fullName, email: handle + '@example.com', role: 'customer' });
			await user.save();
		}

		// Decide segment-like behavior
		const target = pick(['Basic', 'Value', 'Premium']);
		const orderCount = target === 'Premium' ? randInt(8, 18) : target === 'Value' ? randInt(4, 10) : randInt(1, 5);
		const avgBase = target === 'Premium' ? randInt(8000, 15000) : target === 'Value' ? randInt(3000, 8000) : randInt(500, 3000);
		const returnEvery = target === 'Premium' ? 10 : target === 'Value' ? 6 : 4; // higher return rate for Basic

		for (let i = 0; i < orderCount; i++) {
			const price = Math.max(100, Math.round(avgBase * (0.7 + Math.random() * 0.6))); // ±30%
			const qty = randInt(1, 3);
			const totalAmount = price * qty;
			const isReturned = (i % returnEvery === 0) && i !== 0;

			const order = new Order({
				user: user._id,
				items: [{ product: product._id, name: product.name, price, quantity: qty }],
				totalAmount,
				shippingCost: 0,
				address: { name: fullName, phone: '9999999999', addressLine: '123 Main St', city: 'City', state: 'State', zip: '560001' },
				status: isReturned ? 'Cancelled' : 'Delivered',
				paymentMethod: 'Online',
				paymentStatus: isReturned ? 'Refunded' : 'Paid'
			});
			await order.save();
		}
		console.log(`Seeded customer ${fullName} (${target}) with ${orderCount} orders`);
	}

	await mongoose.connection.close();
	console.log('Seeding complete');
}

main().catch(async (e) => {
	console.error(e);
	try { await mongoose.connection.close(); } catch {}
	process.exit(1);
});


