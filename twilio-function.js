exports.handler = async function(context, event, callback) {
    const twilioClient = context.getTwilioClient();

    const OpenAI = require('openai');
    const openai = new OpenAI({
        apiKey: context.OPENAI_API_KEY
    });

    const twiml = new Twilio.twiml.MessagingResponse();

    const incomingMsg = event.Body.trim();

    if(incomingMsg == "Hello Twilio") {
        await twilioClient.messages.create({
            body: `Hi! Welcome to the Language Translator.\n\nPlease enter the text and language you want to translate to in the format as follows:`,
            from: 'whatsapp:+14155238886', // Your Twilio Sandbox number
            to: event.From,
        });
        twiml.message('Text to translate:\n\nLanguage to translate to:');
        return callback(null, twiml);
    }

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: "system",
                content: "You are a language translation assistant.",
            },
            { 
                role: "user", 
                content: `Translate the following text using the following info: ${incomingMsg}\n\nReturn the response in the following format: "Translated Text: [TRANSLATED TEXT]"`
            }
        ]
    });

    const translatedText = response.choices[0].message.content.trim();

    twiml.message(translatedText);

    return callback(null, twiml);
};
