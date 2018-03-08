/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a sample skill built with Amazon Alexa Skills nodejs
 * skill development kit.
 * This sample supports multiple languages (en-US, en-GB, de-GB).
 * The Intent Schema, Custom Slot and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-howto
 **/

'use strict';

const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.349a94e0-eaaf-47b8-8059-a6565b44c6e2';

const intents = require('./intents');
const languageStrings = {
    'en': {
        translation: {
            // TODO: Update these messages to customize.
            SKILL_NAME: 'Jack Testing',
            WELCOME_MESSAGE: "Welcome to %s. You can ask a question like, do I need a jacket? ... Now, what can I help you with?",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            HELP_MESSAGE: "You can ask questions such as, do I need a Jacket?...Now, what can I help you with?",
            HELP_REPROMPT:  "You can ask questions such as, do I needa a Jacket?...Now, what can I help you with?",
            STOP_MESSAGE: 'Goodbye!'
        },
    },
    'en-GB': {
        translation: {
            SKILL_NAME: 'Jack Testing',
        },
    },
};
const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address";

const PERMISSIONS = [ALL_ADDRESS_PERMISSION];



const handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'DoINeedAJacketIntent': function () {
        intents.jacketIntent(this);
        //getAddress(this);
    },
    'DoINeedAnUmbrellaIntent': function () {
        intents.umbrellaIntent(this);
    },
    // 'RecipeIntent': function () {
    //     const itemSlot = this.event.request.intent.slots.Item;
    //     let itemName;
    //     if (itemSlot && itemSlot.value) {
    //         itemName = itemSlot.value.toLowerCase();
    //     }

    //     const cardTitle = this.t('DISPLAY_CARD_TITLE', this.t('SKILL_NAME'), itemName);
    //     const myRecipes = this.t('RECIPES');
    //     const recipe = myRecipes[itemName];

    //     if (recipe) {
    //         this.attributes.speechOutput = recipe;
    //         this.attributes.repromptSpeech = this.t('RECIPE_REPEAT_MESSAGE');

    //         this.response.speak(recipe).listen(this.attributes.repromptSpeech);
    //         this.response.cardRenderer(cardTitle, recipe);
    //         this.emit(':responseReady');
    //     } else {
    //         let speechOutput = this.t('RECIPE_NOT_FOUND_MESSAGE');
    //         const repromptSpeech = this.t('RECIPE_NOT_FOUND_REPROMPT');
    //         if (itemName) {
    //             speechOutput += this.t('RECIPE_NOT_FOUND_WITH_ITEM_NAME', itemName);
    //         } else {
    //             speechOutput += this.t('RECIPE_NOT_FOUND_WITHOUT_ITEM_NAME');
    //         }
    //         speechOutput += repromptSpeech;

    //         this.attributes.speechOutput = speechOutput;
    //         this.attributes.repromptSpeech = repromptSpeech;

    //         this.response.speak(speechOutput).listen(repromptSpeech);
    //         this.emit(':responseReady');
    //     }
    // },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
