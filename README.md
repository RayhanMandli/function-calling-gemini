---

```markdown
# 🔧 Function Calling in Gemini API (with Node.js)

This repository demonstrates how to implement **Function Calling** using the Google Gemini API via the `@google/genai` Node.js SDK.

> Function Calling allows AI models to intelligently decide **when** and **how** to invoke specific functions based on user input. This bridges AI and application logic in a seamless way.

---

## 📚 What is Function Calling?

Function calling enables an AI model (like Gemini or GPT) to:

1. **Recognize** when a user query matches a predefined function.
2. **Automatically request** a function call with relevant parameters.
3. **Allow your code to execute** the function and return the result.
4. **Incorporate the result** into the model's next response.

This allows the model to stay up-to-date, interact with external tools, and handle dynamic tasks — all while staying grounded.

---

## 🛠️ Workflow Overview

### ➤ Step 1: Define the Function

```ts
const getCurrentTimeAndDateFunctionDeclaration = {
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
```

This tells Gemini that a function named `get_current_time_and_date` is available for use, and what parameters it expects.

---

### ➤ Step 2: Provide the Tool Config

```ts
const config = {
  tools: [
    {
      functionDeclarations: [getCurrentTimeAndDateFunctionDeclaration],
    },
  ],
};
```

This tool config is passed when initiating a chat, so Gemini knows what tools it can use.

---

### ➤ Step 3: Send a User Prompt

```ts
const contents = [
  {
    role: "user",
    parts: [{ text: "What's the date and time today?" }],
  },
];
```

Gemini analyzes this prompt and **decides** whether it needs to call any declared functions.

---

### ➤ Step 4: Detect and Handle the Function Call

```ts
const chat = await ai.models.generateContent({ model, config, contents });
const tool_call = chat.functionCalls?.[0];
```

If Gemini determines a function should be called, the `functionCalls` array will contain details like the name and arguments.

You then manually **run the function** in your code:

```ts
if (tool_call?.name === 'get_current_time_and_date') {
  result = await getCurrentTimeAndDateFunction();
}
```

---

### ➤ Step 5: Respond Back with the Result

After execution, provide the function's result back to the model:

```ts
const function_response_part = {
  name: tool_call.name,
  response: { result }
};
```

Then push this as a new message from the user to simulate a "tool response":

```ts
contents.push({ role: 'user', parts: [{ text: JSON.stringify({ functionResponse: function_response_part }) }] });
```

---

### ➤ Step 6: Get the Final AI Response

Now Gemini has everything — your original prompt, the function call, and the function result. It can now **respond with a final message**:

```ts
const final_response = await ai.models.generateContent({ model, contents, config });
console.log(final_response.text);
```

✅ Done! The model now responds with dynamic, function-backed information.

---

## 🧪 Sample Output

```bash
Function Call: get_current_time_and_date
Result: { dateAndTime: '5/1/2025, 10:34:12 AM' }
Final Response: The current date and time is 5/1/2025, 10:34:12 AM.
```

---

## 💡 Why Use Function Calling?

- 💬 Let AI interact with live data (dates, APIs, databases, etc.)
- ⚙️ Connect AI to tools in a secure, structured way
- 🤖 Build smart assistants and agents that execute real logic
- 🧠 Reduce hallucinations by grounding AI in real responses

---