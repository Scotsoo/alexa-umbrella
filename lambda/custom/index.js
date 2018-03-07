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
const AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient');
const Messages = require('./Messages');
const https = require('https')
const APP_ID = 'amzn1.ask.skill.349a94e0-eaaf-47b8-8059-a6565b44c6e2';
const request = require('request');
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

const getWeather = function(self, addressData) {
    const { city, countryCode } = addressData;
    console.log('addressData ', addressData)
    if (!city || !countryCode ) {
        self.emit(":tell", Messages.ADDRESS_NOT_COMPLETE);
        return;
    }
    const requestOptions = {
        host: 'lkjahsdlkjhasdkfjhgadf',
        port: 443,
        path: `/data/2.5/forecast?q=${city},${countryCode}&appid=e2b38bff7e9ea81cb061b98eb9abf94f`,
        method: 'GET',
    }
    request(`http://${requestOptions.host}${requestOptions.path}`, (err, response, body) => {
        if(err) {
            self.emit(":tell", "There was a problem checking the weather. Maybe you can just look out the window?");
            return;
        }
        var data = JSON.parse(body);
        const willRain = [data.list[0].weather.some(m => m.main === "Rain")]
        willRain.push(data.list[1].weather.some(m => m.main === "Rain"))
        if (willRain.length > 1){
            self.emit(":tell", "You should probably take an umbrella.");
            return;
        }
    })
}
const getAddress = function(self) {
    const consentToken = self.event.context.System.user.permissions ? self.event.context.System.user.permissions.consentToken : null;
    if(!consentToken) {
        self.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);

        // Lets terminate early since we can't do anything else.
        return;
    }
    const deviceId = self.event.context.System.device.deviceId;
    const apiEndpoint = self.event.context.System.apiEndpoint;

    const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
    let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();
    deviceAddressRequest.then((addressResponse) => {
        switch(addressResponse.statusCode) {
            case 200:
                const address = addressResponse.address;
                getWeather(self, address)

                break;
            case 204:
                // This likely means that the user didn't have their address set via the companion app.
                console.log("Successfully requested from the device address API, but no address was returned.");
                self.emit(":tell", Messages.NO_ADDRESS);
                break;
            case 403:
                console.log("The consent token we had wasn't authorized to access the user's address.");
                self.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);
                break;
            default:
                self.emit(":ask", Messages.LOCATION_FAILURE, Messages.LOCATION_FAILURE);
        }

        console.info("Ending getAddressHandler()");
    });

    deviceAddressRequest.catch((error) => {
        self.emit(":tell", Messages.ERROR);
        console.error(error);
        console.info("Ending getAddressHandler()");
    });
}
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
        const speachOutput = "Looks like you need a jacket!"
        this.attributes.speechOutput = speachOutput;
        getAddress(this);
        // this.attributes.repromptSpeech = "Looks like you need a jacket!";//this.t('RECIPE_REPEAT_MESSAGE');
        // const cardTitle = "You need a jacket!";
        // this.response.speak(speachOutput).listen(this.attributes.repromptSpeech);
        // this.response.cardRenderer(cardTitle, speachOutput);
        // this.emit(':responseReady');
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
