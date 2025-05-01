"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const genai_1 = require("@google/genai");
require("dotenv/config");
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const getCurrentTimeAndDateFunctionDeclaration = {
    name: "get_current_time_and_date",
    description: "Gives the current time and date.",
    parameters: {
        type: genai_1.Type.OBJECT,
        properties: {
            dateAndTime: {
                type: genai_1.Type.STRING,
                description: "The current time and date.",
            },
        },
        required: ["dateAndTime"],
    },
};
const config = {
    tools: [
        {
            functionDeclarations: [getCurrentTimeAndDateFunctionDeclaration],
        },
    ],
};
const getCurrentTimeAndDateFunction = () => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    const dateAndTime = date.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
    });
    return { dateAndTime };
});
const contents = [
    {
        role: "user",
        parts: [{ text: "whats the date and time today?" }],
    },
];
function startChat() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const chat = yield ai.models.generateContent({
            model: "gemini-2.0-flash", // or "gemini-2.0-pro"
            config: config,
            contents: contents,
        });
        let functionCall = (_a = chat.functionCalls) === null || _a === void 0 ? void 0 : _a[0];
        console.log("Function Call: ", functionCall);
        const tool_call = (_b = chat.functionCalls) === null || _b === void 0 ? void 0 : _b[0];
        let result;
        if (tool_call && tool_call.name === 'get_current_time_and_date') {
            result = yield getCurrentTimeAndDateFunction();
        }
        else {
            console.log("No valid function call found.");
        }
        // Create a function response part
        const function_response_part = {
            name: tool_call === null || tool_call === void 0 ? void 0 : tool_call.name,
            response: { result }
        };
        // Append function call and result of the function execution to contents
        contents.push({ role: 'model', parts: [{ text: JSON.stringify({ functionCall: tool_call }) }] });
        contents.push({ role: 'user', parts: [{ text: JSON.stringify({ functionResponse: function_response_part }) }] });
        // Get the final response from the model
        const final_response = yield ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: contents,
            config: config,
        });
        console.log(final_response.text);
    });
}
startChat();
