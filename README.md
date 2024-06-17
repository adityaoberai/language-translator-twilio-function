# Twilio Challenge: Language Translator via Twilio Functions, WhatsApp, Appwrite & OpenAI

## Description
Twilio function that translates language using GPT-4o and responds through the Twilio Programmable Messaging on WhatsApp

https://github.com/adityaoberai/language-translator-twilio-function/assets/31401437/7e042bcd-72f5-46aa-9de4-dad5dcb2aba1

## How it works

- **Twilio Programmable Messaging (WhatsApp Sandbox)** and **Twilio Functions** is used to communicate with the user
- **Appwrite Database** is used to store the state of the user through the conversation, and all conversation data is deleted as soon as the translation is sent to the user
- **OpenAI's GPT-4o API** is used to translate the text to the specified language