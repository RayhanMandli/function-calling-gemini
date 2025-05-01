import { GoogleGenAI, Type } from "@google/genai";
import readline from "readline";
import "dotenv/config";
import { log } from "console";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });


//declare the function
const getCurrentTimeAndDateFunctionDeclaration: object = {
  name: "get_current_time_and_date",
  description: "Gives the current time and date.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      dateAndTime: {
        type: Type.STRING,
        description: "The current time and date.",
      },
    },
    required: ["dateAndTime"],
  },
};
//define the function
const getCurrentTimeAndDateFunction = async () => {
  const date = new Date();
  const dateAndTime = date.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  return { dateAndTime };
};
//config 
const config = {
  tools: [
    {
      functionDeclarations: [getCurrentTimeAndDateFunctionDeclaration],
    },
  ],
};
//the first quesion
const contents = [
  {
    role: "user",
    parts: [{ text: "whats the date and time today?" }],
  },
];

//main function
async function startChat() {

  //ask for the first question
  const chat = await ai.models.generateContent({
    model: "gemini-2.0-flash", // or "gemini-2.0-pro"
    config: config,
    contents: contents,
  });

  //get the function call if it requires to call one
  const tool_call = chat.functionCalls?.[0];

let result;

//determine which function to call
if (tool_call && tool_call.name === 'get_current_time_and_date') {
  result = await getCurrentTimeAndDateFunction();
} else {
  console.log("No valid function call found.");
}

// Create a function response part to send back to ai
const function_response_part = {
  name: tool_call?.name,
  response: { result }
}

// Append function call and result of the function execution to contents
contents.push({ role: 'model', parts: [{ text: JSON.stringify({ functionCall: tool_call }) }] });
contents.push({ role: 'user', parts: [{text: JSON.stringify({ functionResponse: function_response_part })}] });

// Get the final response because you send the function call and the result of the function execution now model knows the details

const final_response = await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: contents,
  config: config, 

});
//here's the result
console.log(final_response.text);
  
}

startChat();
