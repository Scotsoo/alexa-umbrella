'use strict';

/**
 * This file contains a map of messages used by the skill.
 */

const WELCOME = "Welcome to the Sample Device Address API Skill!";

const WHAT_DO_YOU_WANT = "What do you want to ask?";

const NOTIFY_MISSING_PERMISSIONS = "The Weather Man requires your location. Please enable Location permissions in the Amazon Alexa app.";

const NO_ADDRESS = "It looks like you don't have an address set. You can set your address from the companion app.";

const ADDRESS_AVAILABLE = "Here is your full address: ";

const ERROR = "Uh Oh. Looks like something went wrong.";

const LOCATION_FAILURE = "There was an error with the Device Address API. Please try again.";

const GOODBYE = "Bye! Thanks for using the Sample Device Address API Skill!";

const UNHANDLED = "This skill doesn't support that. Please ask something else.";

const HELP = "You can use this skill by asking something like: whats my address?";

const STOP = "There is nothing to stop. Did you mean to ask something else?";

const ADDRESS_NOT_COMPLETE = "The address associated with this device does not have a valid country or city. Please update this in the Amazon Alexa App";

const API_ERROR = "There was a problem checking the weather. Maybe you can just look out the window?";

module.exports = {
    "WELCOME": WELCOME,
    "WHAT_DO_YOU_WANT": WHAT_DO_YOU_WANT,
    "NOTIFY_MISSING_PERMISSIONS": NOTIFY_MISSING_PERMISSIONS,
    "NO_ADDRESS": NO_ADDRESS,
    "ADDRESS_AVAILABLE": ADDRESS_AVAILABLE,
    "ERROR": ERROR,
    "LOCATION_FAILURE": LOCATION_FAILURE,
    "GOODBYE": GOODBYE,
    "UNHANDLED": UNHANDLED,
    "HELP": HELP,
    "STOP": STOP,
    "ADDRESS_NOT_COMPLETE": ADDRESS_NOT_COMPLETE,
    "API_ERROR": API_ERROR
};
