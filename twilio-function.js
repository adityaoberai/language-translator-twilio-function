exports.handler = async function(context, event, callback) {
    // Getting authenticated Twilio Client
    const twilioClient = context.getTwilioClient();

    //Setting up Appwrite Client
    const appwriteSdk = require('node-appwrite');
    const appwriteClient = new appwriteSdk.Client();
    appwriteClient
        .setEndpoint(context.APPWRITE_ENDPOINT)
        .setProject(context.APPWRITE_PROJECT_ID)
        .setKey('<APPWRITE_API_KEY>'); // Was unable to use the Twilio Functions's Environment Variables for this one because of the set max length of 255 characters
    const db = new appwriteSdk.Databases(appwriteClient);
    const dbId = context.APPWRITE_DB_ID;
    const collectionId = context.APPWRITE_COLLECTION_ID;

    // Setting up OpenAI Client
    const OpenAI = require('openai');
    const openai = new OpenAI({
        apiKey: context.OPENAI_API_KEY
    });

    const twiml = new Twilio.twiml.MessagingResponse();

    let incomingMessage = event.Body.trim();
    let currentPhoneNumber = event.From.substring(9);

    // Setting currentUser to help retain state of conversation
    let currentUser = await db.listDocuments(
        dbId,
        collectionId,
        [
            appwriteSdk.Query.equal('phoneNumber', currentPhoneNumber)
        ]
    );
    if(currentUser.total == 1) {
        currentUser = currentUser.documents[0];
    } 
    else {
        currentUser = await db.createDocument(
            dbId,
            collectionId,
            appwriteSdk.ID.unique(),
            {
                phoneNumber: currentPhoneNumber,
                lang: null,
                text: null
            }
        );
    }

    if(!currentUser.text && !currentUser.lang) {
        if(incomingMessage == 'Hello Twilio' || incomingMessage == 'yes') {
            // Introductory message
            twiml.message('Hi! Welcome to the Language Translator.\n\nPlease enter the language you want to translate to.');
            return callback(null, twiml);
        }

        // Save target language
        currentUser = await db.updateDocument(
            dbId,
            collectionId,
            currentUser.$id,
            {
                phoneNumber: currentPhoneNumber,
                lang: incomingMessage,
                text: null
            }
        )
        twiml.message('Please enter the text you want to translate.');
        return callback(null, twiml);
        
    }
    
    else {
        // Save text to translate
        currentUser = await db.updateDocument(
            dbId,
            collectionId,
            currentUser.$id,
            {
                phoneNumber: currentPhoneNumber,
                lang: currentUser.lang,
                text: incomingMessage
            }
        )
    
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: "system",
                    content: "You are a language translation assistant.",
                },
                { 
                    role: "user", 
                    content: `Translate the following text to ${currentUser.lang}: ${incomingMessage}\n\nReturn only the translated text in the response with no additional content surrounding it.`
                }
            ]
        });

        const translatedText = response.choices[0].message.content.trim();

        // Send translated text to user
        await twilioClient.messages.create({
            body: 'Here is the translated text',
            from: 'whatsapp:+14155238886', // Your Twilio Sandbox number
            to: event.From,
        });

        await twilioClient.messages.create({
            body: translatedText,
            from: 'whatsapp:+14155238886', // Your Twilio Sandbox number
            to: event.From,
        });

        // Clear user state from Appwrite
        await db.deleteDocument(
            dbId,
            collectionId,
            currentUser.$id
        );

        twiml.message('If you would like to translate another text, please enter: yes');
        return callback(null, twiml);
    }
};
