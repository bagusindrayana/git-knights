import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import pino, { destination, type Logger, type LoggerOptions } from 'pino';
import { get, readable, type Readable } from 'svelte/store';

// Import the file path as per your folder structure
import { ServerEnvironment, type PinoLogger } from '../interfaces'

// Default log level will be set to silent but will be modified as per the environment in context.
const defaultLogLevel = 'silent';

// This is an IIFE, self executing funtion. It will return the Pino Logger instance 
const pinoLogger: PinoLogger = (() => {
    let pinoOptions: LoggerOptions;

    if (browser) {
        // If logger is running in browser, pretty print it.
        pinoOptions = {
            browser: { asObject: false },
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true, // show colors in log
                    levelFirst: true, // show levels first in log
                    translateTime: true, // translate the time in human readable format
                },

            },
        }
    } else {
        // If logger is running in the server, do not pretty print it.
        pinoOptions = {
            transport: {
                target: 'pino/file',
                options: {
                    destination: env.PUBLIC_LOG_FILE
                },

            },
        };
    }

    return pino(pinoOptions);
})();

pinoLogger.setLogLevel = (NODE_ENV: ServerEnvironment) => {
    let logLevel: LoggerOptions['level'] = defaultLogLevel;

    switch (NODE_ENV) {
        case ServerEnvironment.DEV:
        case ServerEnvironment.PREV:
            logLevel = 'trace'; // for Development and Preview envs, use trace log level
            break;
        case ServerEnvironment.STG:
            logLevel = 'info'; // info for Staging
            break;
        case ServerEnvironment.PROD:
            if (browser) {
                logLevel = 'silent'; // for Production, silent in browser
            } else {
                logLevel = 'info'; // and info in server
            }
            break;
    }

    logger.info(`Logger log level will be set to "${logLevel}".`);
    pinoLogger.level = logLevel;

    return logLevel;
};

// Create a Readable store for the logger as it value is never going to change.
const pinoLogger2: Readable<PinoLogger> = readable<PinoLogger>(pinoLogger);

// Exporting the logger value obtained by get() function as to always import the logger file from lib folder.
export const logger = get(pinoLogger2);

// One don't need to export, if they want to use the subscribe method or the $ syntax.