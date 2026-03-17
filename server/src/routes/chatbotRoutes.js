import express from 'express';
import { GoogleGenAI } from '@google/genai';
import Product from '../models/Product.js';
import ServiceEnquiry from '../models/ServiceEnquiry.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Format history for Gemini API
    const formattedHistory = history ? history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) : [];

    // Fetch a condensed list of active products to give Woodpecker context
    const products = await Product.find({ isActive: true })
      .select('name category subcategory price')
      .limit(100) // limit to avoid massive prompts
      .lean();

    const productListString = products.map(p => `- ${p.name} (${p.category}${p.subcategory ? `, ${p.subcategory}` : ''}) - ₹${p.price}`).join('\n');

const systemInstruction = `You are "Woodpecker", an intelligent, helpful, and highly knowledgeable customer service AI assistant for "JC-Timbers".
JC-Timbers is a premium timber and furniture company. Your avatar is a woodpecker.
Tone: Professional, welcoming, helpful, and concise.

You have two main capabilities:
1. Product Recommendations: We sell premium timber, furniture, doors, and construction materials. If asked about what products or doors we have available, kindly list or recommend items from the catalog provided below. 
2. Service Bookings: JC-Timbers OFFERS "Timber Cutting & Processing" services including Planing, Resawing, Debarking, and Sawing. If a customer asks to book a service (e.g. "book a sawing service for 10 logs of Teak wood"), you MUST use the \`book_timber_processing\` tool to book it for them. Ask for any missing details (like dimensions, wood type, logs, requested date, time) before calling the tool.

Here is the current catalog of available products at JC-Timbers:
${productListString || "No products currently available."}

If asked about things unrelated to timber, wood products, our processing services, or JC-Timbers, politely guide the conversation back.`;

    // Add current message to history. This part requires the right structure depending on the specific GenAI SDK version.
    let contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Understood. I am Woodpecker, the assistant.' }] },
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] }
    ];

    const bookTimberProcessingTool = {
      functionDeclarations: [
        {
          name: "book_timber_processing",
          description: "Used to book a timber cutting and processing service request for the customer. Ensure you have gathered all required details before calling this. If the user is a guest (no user object logged in), kindly ask them to log in to book.",
          parameters: {
            type: "OBJECT",
            properties: {
              workType: {
                type: "STRING",
                description: "Type of work. Must be one of: Planing, Resawing, Debarking, Sawing, Other"
              },
              woodType: { type: "STRING", description: "Type of wood" },
              numberOfLogs: { type: "NUMBER", description: "Number of logs" },
              thickness: { type: "NUMBER", description: "Thickness in inches" },
              width: { type: "NUMBER", description: "Width in inches" },
              length: { type: "NUMBER", description: "Length in feet" },
              cubicFeet: { type: "NUMBER", description: "Total calculated cubic feet" },
              requestedDate: { type: "STRING", description: "Requested date (YYYY-MM-DD)" },
              requestedTime: { type: "STRING", description: "Requested time (HH:MM)" }
            },
            required: ["workType", "woodType", "numberOfLogs", "thickness", "width", "length", "cubicFeet", "requestedDate", "requestedTime"]
          }
        }
      ]
    };

    let response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      tools: [bookTimberProcessingTool]
    });

    // Handle function calling
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      
      if (call.name === 'book_timber_processing') {
        const userObj = req.body.user;
        let functionResponseText;
        
        if (!userObj || !userObj._id) {
          functionResponseText = "Error: User is not logged in. Ask them to log in first.";
        } else {
          try {
            const args = call.args;
            const newEnquiry = new ServiceEnquiry({
              customerId: userObj._id,
              customerName: userObj.name || 'Chatbot User',
              customerEmail: userObj.email || '',
              phoneNumber: userObj.phoneNumber || '',
              workType: args.workType,
              logItems: [{
                woodType: args.woodType,
                numberOfLogs: args.numberOfLogs,
                thickness: args.thickness,
                width: args.width,
                length: args.length,
                cubicFeet: args.cubicFeet
              }],
              cubicFeet: args.cubicFeet,
              requestedDate: new Date(args.requestedDate),
              requestedTime: args.requestedTime,
              status: "ENQUIRY_RECEIVED"
            });
            await newEnquiry.save();
            functionResponseText = `Success! Booking ID: ${newEnquiry._id}`;
          } catch (e) {
            console.error('Booking save error:', e);
            functionResponseText = `Error saving booking: ${e.message}`;
          }
        }

        // Return the function call response back to Gemini to get the final conversational output
        contents.push({
          role: 'model',
          parts: [{ functionCall: call }]
        });
        
        contents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: 'book_timber_processing',
              response: { result: functionResponseText }
            }
          }]
        });

        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          tools: [bookTimberProcessingTool]
        });
      }
    }

    return res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: 'An error occurred while communicating with the chatbot.' });
  }
});

export default router;
