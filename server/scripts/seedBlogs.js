import mongoose from 'mongoose';
import Blog from '../src/models/Blog.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jc-timbers');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedBlogs = async () => {
  try {
    await connectDB();

    // Clear existing blogs
    await Blog.deleteMany({});
    console.log('🗑️ Cleared existing blogs');

    // Seed initial blog data
    const blogData = [
      {
        title: 'How to Choose the Right Wood',
        excerpt: 'Understand hardwood vs softwood, grain, and durability.',
        content: `Choosing the right wood for your project is crucial for both aesthetics and longevity. Here's a comprehensive guide to help you make the best decision.

## Hardwood vs Softwood

**Hardwoods** (like Oak, Teak, Mahogany) are generally more durable and have tighter grain patterns. They're ideal for furniture, flooring, and high-traffic areas.

**Softwoods** (like Pine, Cedar, Fir) are more affordable and easier to work with. They're perfect for construction, framing, and decorative elements.

## Grain Patterns

The grain pattern affects both appearance and strength:
- **Straight grain**: Consistent, strong, easy to work with
- **Interlocked grain**: Beautiful patterns but can be challenging to work
- **Spiral grain**: Unique appearance but may cause warping

## Durability Considerations

Consider the wood's natural resistance to:
- Moisture and rot
- Insect damage
- Wear and tear
- Weather conditions

## Sustainability

Always choose sustainably sourced wood. Look for certifications like FSC (Forest Stewardship Council) to ensure responsible forestry practices.

## Maintenance Requirements

Different woods have different maintenance needs:
- Some require regular oiling
- Others need periodic staining
- Consider your maintenance commitment

By understanding these factors, you can choose wood that perfectly matches your project's requirements and your personal preferences.`,
        author: 'JC Timber Team',
        published: true,
        publishedAt: new Date('2024-01-15'),
        order: 1,
        tags: ['wood selection', 'hardwood', 'softwood', 'durability'],
        category: 'Wood Knowledge'
      },
      {
        title: 'Sustainable Timber Practices',
        excerpt: 'Learn how we source eco-friendly wood responsibly.',
        content: `At JC Timbers, sustainability isn't just a buzzword—it's our commitment to preserving forests for future generations.

## Our Sustainable Sourcing

We partner with certified suppliers who follow strict environmental standards:
- **FSC Certification**: All our wood comes from responsibly managed forests
- **Local Sourcing**: We prioritize local suppliers to reduce carbon footprint
- **Reforestation**: For every tree harvested, we ensure multiple trees are planted

## Environmental Impact

Our practices help:
- Maintain biodiversity
- Protect watersheds
- Reduce carbon emissions
- Support local communities

## Certification Process

Every batch of timber undergoes:
- Origin verification
- Quality assessment
- Environmental impact evaluation
- Chain of custody documentation

## Community Benefits

Our sustainable practices support:
- Local forest communities
- Fair trade principles
- Worker safety standards
- Economic development

## Future Commitments

We're continuously working to:
- Increase our use of reclaimed wood
- Develop new sustainable materials
- Reduce waste in our processes
- Educate customers about sustainability

By choosing JC Timbers, you're not just buying quality wood—you're supporting a sustainable future for our planet.`,
        author: 'JC Timber Team',
        published: true,
        publishedAt: new Date('2024-01-10'),
        order: 2,
        tags: ['sustainability', 'environment', 'certification', 'responsibility'],
        category: 'Sustainability'
      },
      {
        title: 'Care Tips for Your Furniture',
        excerpt: 'Extend the life of your wooden furniture with these tips.',
        content: `Proper care can extend your wooden furniture's life by decades. Here are expert tips to keep your investment looking beautiful.

## Daily Care

**Dusting**: Use a soft, dry cloth or microfiber duster. Avoid feather dusters that can scratch the surface.

**Immediate Cleanup**: Wipe spills immediately with a dry cloth to prevent staining.

## Weekly Maintenance

**Gentle Cleaning**: Use a slightly damp cloth with mild soap. Always dry immediately.

**Conditioning**: Apply furniture polish monthly to maintain the wood's natural luster.

## Seasonal Care

**Humidity Control**: Maintain 40-60% humidity to prevent cracking or warping.

**Temperature**: Avoid extreme temperature changes that can cause wood to expand and contract.

## Protection Strategies

**Coasters and Mats**: Always use coasters for drinks and mats for hot items.

**Sunlight**: Protect from direct sunlight which can fade and damage wood.

**Positioning**: Keep furniture away from heating vents and air conditioning units.

## Deep Cleaning

**Annual Deep Clean**: Use appropriate wood cleaner and conditioner.

**Professional Service**: Consider professional restoration for valuable pieces.

## Repair and Restoration

**Minor Scratches**: Use wood filler and matching stain for small repairs.

**Water Damage**: Address immediately to prevent permanent damage.

**Professional Help**: For significant damage, consult a furniture restoration expert.

## Storage Tips

**Climate Control**: Store in temperature and humidity-controlled environments.

**Protection**: Use furniture covers when storing long-term.

**Positioning**: Store pieces off the ground to prevent moisture damage.

With proper care, your wooden furniture can become a family heirloom passed down through generations.`,
        author: 'JC Timber Team',
        published: true,
        publishedAt: new Date('2024-01-05'),
        order: 3,
        tags: ['furniture care', 'maintenance', 'wood preservation', 'tips'],
        category: 'Care & Maintenance'
      }
    ];

    await Blog.insertMany(blogData);
    console.log('✅ Seeded blog data successfully');

    // Verify the data
    const count = await Blog.countDocuments();
    console.log(`📊 Total blogs created: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
    process.exit(1);
  }
};

seedBlogs();




