# Twilio Challenge: Language Translator via Twilio Functions, WhatsApp, Appwrite & OpenAI

## Description
Twilio function that translates language using GPT-4o and responds through the Twilio Programmable Messaging on WhatsApp

https://github.com/adityaoberai/language-translator-twilio-function/assets/31401437/2cefb6be-b11f-4e05-9e74-8c5ff6cb6e3f

## How it works

- **Twilio Programmable Messaging (WhatsApp Sandbox)** and **Twilio Functions** is used to communicate with the user
- **Appwrite Database** is used to store the state of the user through the conversation, and all conversation data is deleted as soon as the translation is sent to the user
- **OpenAI's GPT-4o API** is used to translate the text to the specified language
