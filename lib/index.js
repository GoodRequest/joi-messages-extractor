#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("colors");
const fs_1 = __importDefault(require("fs"));
const joi_1 = __importDefault(require("joi"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("config"));
// import Test from 'joi/lib/types'
/*
 * Older available versions were not found
 *
 * To run the script use tho following command: cross-env JOI_ERRORS_FILE_PATH=<path_name> ts-node 'joiErrorMessagesScript.ts'
 * JOI_LOCALES_FILE_PATH
 * 		- is optional
 * 		- default value is the same folder with script
 * 		- path to te directory where joiErrorMessages.ts file will be situated
 * joiErrorMessages.ts - is a default filename where all Joi error message keys with default translations are located and exported
 * Translating languages is trying to find in i18next.fallbackLng from config module otherwise will be used the default ones - english, ['en', 'sk']
 *
 * Tested versions
 * 17.6.3 +
 * 17.6.0 +
 * 17.5.0 +
 * 17.4.0 +
 * 17.3.0 +
 * 17.2.0 +
 * 17.1.1 - Error looks like: Could not find a declaration file for module 'joi'
 * */
// Joi version check
const testedVersions = ['17.6', '17.5', '17.4', '17.3', '17.2'];
if (testedVersions.indexOf(joi_1.default.version.substring(0, 4)) === -1) {
    console.log(`WARNING: This script was not tested on your joi version, errors may occur`.yellow);
}
// Creating all necessary global variables
const files = fs_1.default.readdirSync(path_1.default.resolve(process.cwd(), 'node_modules', 'joi', 'lib', 'types'), { withFileTypes: false });
const fileName = 'joiErrorMessages.ts';
const savePath = process.env.JOI_ERRORS_FILE_PATH ? path_1.default.resolve(process.cwd(), process.env.JOI_ERRORS_FILE_PATH, fileName) : path_1.default.resolve(__dirname, fileName);
// Generate template for languages, otherwise use default
let i18NextConfig = {};
try {
    i18NextConfig = config_1.default.get('i18next');
}
catch {
    console.log(`WARNING: i18next is missing in config module`.yellow);
}
const languages = i18NextConfig?.fallbackLng || ['en', 'sk'];
if (languages.length < 1) {
    console.log(`ERROR: 'i18next.fallbackLng' was not found in module 'config'.\nERROR: Please try to define some`.red);
    process.exit(1);
}
const init = async () => {
    const messagePromises = files.map(async (typeName) => {
        // Import dynamically one by one all type files from joi/lib/types
        const type = await Promise.resolve().then(() => __importStar(require(`joi/lib/types/${typeName}`)));
        // Check if Joi type has error messages of this type and save them
        // By default each type should have error messages
        const prototype = Object.getPrototypeOf(type?.default);
        // eslint-disable-next-line no-underscore-dangle
        const message = prototype?._definition?.messages;
        if (!message) {
            console.log(`WARNING: messages were not found by the root node_modules/joi/lib/types/${typeName}`.yellow);
        }
        return message;
    });
    const messages = await Promise.all(messagePromises);
    const result = {};
    // Importing actual data otherwise use an empty object
    const actualData = fs_1.default.existsSync(savePath) ? (await Promise.resolve().then(() => __importStar(require(savePath)))).default : {};
    let newErrorMessagesCount = 0;
    // Get all possible messages. If some are generated, replace them with existing ones
    languages.forEach((lang) => {
        const tempLang = {};
        const actualLang = actualData[lang];
        messages
            .filter((v) => !!v)
            .forEach((msg) => {
            Object.keys(msg).forEach((key) => {
                if (actualLang && actualLang[key]) {
                    tempLang[key] = `\t\t'${key}': '${actualLang[key]}'`;
                }
                else if (!tempLang[key]) {
                    tempLang[key] = `\t\t'${key}': '${msg?.[key].source.replace(/:/gi, '')}'`;
                    newErrorMessagesCount += 1;
                }
            });
        });
        result[lang] = tempLang;
    });
    // Write all joi messages into a file
    let template = '';
    languages.forEach((lang) => {
        template += `\n\t${lang}: {\n${Object.values(result[lang]).join(',\n')}\n\t},`;
    });
    // Remove last coma
    template = template.substring(0, template.length - 1);
    fs_1.default.writeFileSync(savePath, `const joiErrorMessages: any = {${template}\n}\n\nexport default joiErrorMessages\n`);
    console.log(`SUCCESS: ${newErrorMessagesCount} new Joi error messages were generated for the next languages: ${languages}\nMessages file path: ${savePath}: `.green);
};
init();
