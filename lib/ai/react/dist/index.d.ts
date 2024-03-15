interface FunctionCall {
    /**
     * The arguments to call the function with, as generated by the model in JSON
     * format. Note that the model does not always generate valid JSON, and may
     * hallucinate parameters not defined by your function schema. Validate the
     * arguments in your code before calling your function.
     */
    arguments?: string;
    /**
     * The name of the function to call.
     */
    name?: string;
}
/**
 * The tool calls generated by the model, such as function calls.
 */
interface ToolCall {
    id: string;
    type: string;
    function: {
        name: string;
        arguments: string;
    };
}
/**
 * Controls which (if any) function is called by the model.
 * - none means the model will not call a function and instead generates a message.
 * - auto means the model can pick between generating a message or calling a function.
 * - Specifying a particular function via {"type: "function", "function": {"name": "my_function"}} forces the model to call that function.
 * none is the default when no functions are present. auto is the default if functions are present.
 */
type ToolChoice = 'none' | 'auto' | {
    type: 'function';
    function: {
        name: string;
    };
};
/**
 * A list of tools the model may call. Currently, only functions are supported as a tool.
 * Use this to provide a list of functions the model may generate JSON inputs for.
 */
interface Tool {
    type: 'function';
    function: Function;
}
interface Function {
    /**
     * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain
     * underscores and dashes, with a maximum length of 64.
     */
    name: string;
    /**
     * The parameters the functions accepts, described as a JSON Schema object. See the
     * [guide](/docs/guides/gpt/function-calling) for examples, and the
     * [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for
     * documentation about the format.
     *
     * To describe a function that accepts no parameters, provide the value
     * `{"type": "object", "properties": {}}`.
     */
    parameters: Record<string, unknown>;
    /**
     * A description of what the function does, used by the model to choose when and
     * how to call the function.
     */
    description?: string;
}
type IdGenerator = () => string;
/**
 * Shared types between the API and UI packages.
 */
interface Message {
    id: string;
    tool_call_id?: string;
    createdAt?: Date;
    content: string;
    ui?: string | JSX.Element | JSX.Element[] | null | undefined;
    role: 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool';
    /**
     * If the message has a role of `function`, the `name` field is the name of the function.
     * Otherwise, the name field should not be set.
     */
    name?: string;
    /**
     * If the assistant role makes a function call, the `function_call` field
     * contains the function call name and arguments. Otherwise, the field should
     * not be set. (Deprecated and replaced by tool_calls.)
     */
    function_call?: string | FunctionCall;
    data?: JSONValue;
    /**
     * If the assistant role makes a tool call, the `tool_calls` field contains
     * the tool call name and arguments. Otherwise, the field should not be set.
     */
    tool_calls?: string | ToolCall[];
    /**
     * Additional message-specific information added on the server via StreamData
     */
    annotations?: JSONValue[] | undefined;
}
type CreateMessage = Omit<Message, 'id'> & {
    id?: Message['id'];
};
type ChatRequest = {
    messages: Message[];
    options?: RequestOptions;
    functions?: Array<Function>;
    function_call?: FunctionCall;
    data?: Record<string, string>;
    tools?: Array<Tool>;
    tool_choice?: ToolChoice;
};
type FunctionCallHandler = (chatMessages: Message[], functionCall: FunctionCall) => Promise<ChatRequest | void>;
type ToolCallHandler = (chatMessages: Message[], toolCalls: ToolCall[]) => Promise<ChatRequest | void>;
type RequestOptions = {
    headers?: Record<string, string> | Headers;
    body?: object;
};
type ChatRequestOptions = {
    options?: RequestOptions;
    functions?: Array<Function>;
    function_call?: FunctionCall;
    tools?: Array<Tool>;
    tool_choice?: ToolChoice;
    data?: Record<string, string>;
};
type UseChatOptions = {
    /**
     * The API endpoint that accepts a `{ messages: Message[] }` object and returns
     * a stream of tokens of the AI chat response. Defaults to `/api/chat`.
     */
    api?: string;
    /**
     * A unique identifier for the chat. If not provided, a random one will be
     * generated. When provided, the `useChat` hook with the same `id` will
     * have shared states across components.
     */
    id?: string;
    /**
     * Initial messages of the chat. Useful to load an existing chat history.
     */
    initialMessages?: Message[];
    /**
     * Initial input of the chat.
     */
    initialInput?: string;
    /**
     * Callback function to be called when a function call is received.
     * If the function returns a `ChatRequest` object, the request will be sent
     * automatically to the API and will be used to update the chat.
     */
    experimental_onFunctionCall?: FunctionCallHandler;
    /**
     * Callback function to be called when a tool call is received.
     * If the function returns a `ChatRequest` object, the request will be sent
     * automatically to the API and will be used to update the chat.
     */
    experimental_onToolCall?: ToolCallHandler;
    /**
     * Callback function to be called when the API response is received.
     */
    onResponse?: (response: Response) => void | Promise<void>;
    /**
     * Callback function to be called when the chat is finished streaming.
     */
    onFinish?: (message: Message) => void;
    /**
     * Callback function to be called when an error is encountered.
     */
    onError?: (error: Error) => void;
    /**
     * A way to provide a function that is going to be used for ids for messages.
     * If not provided nanoid is used by default.
     */
    generateId?: IdGenerator;
    /**
     * The credentials mode to be used for the fetch request.
     * Possible values are: 'omit', 'same-origin', 'include'.
     * Defaults to 'same-origin'.
     */
    credentials?: RequestCredentials;
    /**
     * HTTP headers to be sent with the API request.
     */
    headers?: Record<string, string> | Headers;
    /**
     * Extra body object to be sent with the API request.
     * @example
     * Send a `sessionId` to the API along with the messages.
     * ```js
     * useChat({
     *   body: {
     *     sessionId: '123',
     *   }
     * })
     * ```
     */
    body?: object;
    /**
     * Whether to send extra message fields such as `message.id` and `message.createdAt` to the API.
     * Defaults to `false`. When set to `true`, the API endpoint might need to
     * handle the extra fields before forwarding the request to the AI service.
     */
    sendExtraMessageFields?: boolean;
};
type UseCompletionOptions = {
    /**
     * The API endpoint that accepts a `{ prompt: string }` object and returns
     * a stream of tokens of the AI completion response. Defaults to `/api/completion`.
     */
    api?: string;
    /**
     * An unique identifier for the chat. If not provided, a random one will be
     * generated. When provided, the `useChat` hook with the same `id` will
     * have shared states across components.
     */
    id?: string;
    /**
     * Initial prompt input of the completion.
     */
    initialInput?: string;
    /**
     * Initial completion result. Useful to load an existing history.
     */
    initialCompletion?: string;
    /**
     * Callback function to be called when the API response is received.
     */
    onResponse?: (response: Response) => void | Promise<void>;
    /**
     * Callback function to be called when the completion is finished streaming.
     */
    onFinish?: (prompt: string, completion: string) => void;
    /**
     * Callback function to be called when an error is encountered.
     */
    onError?: (error: Error) => void;
    /**
     * The credentials mode to be used for the fetch request.
     * Possible values are: 'omit', 'same-origin', 'include'.
     * Defaults to 'same-origin'.
     */
    credentials?: RequestCredentials;
    /**
     * HTTP headers to be sent with the API request.
     */
    headers?: Record<string, string> | Headers;
    /**
     * Extra body object to be sent with the API request.
     * @example
     * Send a `sessionId` to the API along with the prompt.
     * ```js
     * useChat({
     *   body: {
     *     sessionId: '123',
     *   }
     * })
     * ```
     */
    body?: object;
};
type JSONValue = null | string | number | boolean | {
    [x: string]: JSONValue;
} | Array<JSONValue>;

/**
 * A stream wrapper to send custom JSON-encoded data back to the client.
 */
declare class experimental_StreamData {
    private encoder;
    private controller;
    stream: TransformStream<Uint8Array, Uint8Array>;
    private isClosedPromise;
    private isClosedPromiseResolver;
    private isClosed;
    private data;
    private messageAnnotations;
    constructor();
    close(): Promise<void>;
    append(value: JSONValue): void;
    appendMessageAnnotation(value: JSONValue): void;
}

/**
 * This is a naive implementation of the streaming React response API.
 * Currently, it can carry the original raw content, data payload and a special
 * UI payload and stream them via "rows" (nested promises).
 * It must be used inside Server Actions so Flight can encode the React elements.
 *
 * It is naive as unlike the StreamingTextResponse, it does not send the diff
 * between the rows, but flushing the full payload on each row.
 */

type UINode = string | JSX.Element | JSX.Element[] | null | undefined;
/**
 * A utility class for streaming React responses.
 */
declare class experimental_StreamingReactResponse {
    constructor(res: ReadableStream, options?: {
        ui?: (message: {
            content: string;
            data?: JSONValue[] | undefined;
        }) => UINode | Promise<UINode>;
        data?: experimental_StreamData;
        generateId?: IdGenerator;
    });
}

type UseChatHelpers = {
    /** Current messages in the chat */
    messages: Message[];
    /** The error object of the API request */
    error: undefined | Error;
    /**
     * Append a user message to the chat list. This triggers the API call to fetch
     * the assistant's response.
     * @param message The message to append
     * @param options Additional options to pass to the API call
     */
    append: (message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
    /**
     * Reload the last AI chat response for the given chat history. If the last
     * message isn't from the assistant, it will request the API to generate a
     * new response.
     */
    reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
    /**
     * Abort the current request immediately, keep the generated tokens if any.
     */
    stop: () => void;
    /**
     * Update the `messages` state locally. This is useful when you want to
     * edit the messages on the client, and then trigger the `reload` method
     * manually to regenerate the AI response.
     */
    setMessages: (messages: Message[]) => void;
    /** The current value of the input */
    input: string;
    /** setState-powered method to update the input value */
    setInput: React.Dispatch<React.SetStateAction<string>>;
    /** An input/textarea-ready onChange handler to control the value of the input */
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
    /** Form submission handler to automatically reset input and append a user message */
    handleSubmit: (e: React.FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions) => void;
    metadata?: Object;
    /** Whether the API request is in progress */
    isLoading: boolean;
    /** Additional data added on the server via StreamData */
    data?: JSONValue[] | undefined;
};
type StreamingReactResponseAction = (payload: {
    messages: Message[];
    data?: Record<string, string>;
}) => Promise<experimental_StreamingReactResponse>;
declare function useChat({ api, id, initialMessages, initialInput, sendExtraMessageFields, experimental_onFunctionCall, experimental_onToolCall, onResponse, onFinish, onError, credentials, headers, body, generateId, }?: Omit<UseChatOptions, 'api'> & {
    api?: string | StreamingReactResponseAction;
    key?: string;
}): UseChatHelpers;

type UseCompletionHelpers = {
    /** The current completion result */
    completion: string;
    /**
     * Send a new prompt to the API endpoint and update the completion state.
     */
    complete: (prompt: string, options?: RequestOptions) => Promise<string | null | undefined>;
    /** The error object of the API request */
    error: undefined | Error;
    /**
     * Abort the current API request but keep the generated tokens.
     */
    stop: () => void;
    /**
     * Update the `completion` state locally.
     */
    setCompletion: (completion: string) => void;
    /** The current value of the input */
    input: string;
    /** setState-powered method to update the input value */
    setInput: React.Dispatch<React.SetStateAction<string>>;
    /**
     * An input/textarea-ready onChange handler to control the value of the input
     * @example
     * ```jsx
     * <input onChange={handleInputChange} value={input} />
     * ```
     */
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
    /**
     * Form submission handler to automatically reset input and append a user message
     * @example
     * ```jsx
     * <form onSubmit={handleSubmit}>
     *  <input onChange={handleInputChange} value={input} />
     * </form>
     * ```
     */
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    /** Whether the API request is in progress */
    isLoading: boolean;
    /** Additional data added on the server via StreamData */
    data?: JSONValue[] | undefined;
};
declare function useCompletion({ api, id, initialCompletion, initialInput, credentials, headers, body, onResponse, onFinish, onError, }?: UseCompletionOptions): UseCompletionHelpers;

type AssistantStatus = 'in_progress' | 'awaiting_message';
type UseAssistantHelpers = {
    /**
     * The current array of chat messages.
     */
    messages: Message[];
    /**
     * The current thread ID.
     */
    threadId: string | undefined;
    /**
     * The current value of the input field.
     */
    input: string;
    /**
     * setState-powered method to update the input value.
     */
    setInput: React.Dispatch<React.SetStateAction<string>>;
    /**
     * Handler for the `onChange` event of the input field to control the input's value.
     */
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
    /**
     * Form submission handler that automatically resets the input field and appends a user message.
     */
    submitMessage: (event?: React.FormEvent<HTMLFormElement>, requestOptions?: {
        data?: Record<string, string>;
    }) => Promise<void>;
    /**
     * The current status of the assistant. This can be used to show a loading indicator.
     */
    status: AssistantStatus;
    /**
     * The error thrown during the assistant message processing, if any.
     */
    error: undefined | unknown;
};
type UseAssistantOptions = {
    /**
     * The API endpoint that accepts a `{ threadId: string | null; message: string; }` object and returns an `AssistantResponse` stream.
     * The threadId refers to an existing thread with messages (or is `null` to create a new thread).
     * The message is the next message that should be appended to the thread and sent to the assistant.
     */
    api: string;
    /**
     * An optional string that represents the ID of an existing thread.
     * If not provided, a new thread will be created.
     */
    threadId?: string | undefined;
    /**
     * An optional literal that sets the mode of credentials to be used on the request.
     * Defaults to "same-origin".
     */
    credentials?: RequestCredentials;
    /**
     * An optional object of headers to be passed to the API endpoint.
     */
    headers?: Record<string, string> | Headers;
    /**
     * An optional, additional body object to be passed to the API endpoint.
     */
    body?: object;
    /**
     * An optional callback that will be called when the assistant encounters an error.
     */
    onError?: (error: Error) => void;
};
declare function experimental_useAssistant({ api, threadId: threadIdParam, credentials, headers, body, onError, }: UseAssistantOptions): UseAssistantHelpers;

export { AssistantStatus, CreateMessage, Message, UseAssistantHelpers, UseAssistantOptions, UseChatHelpers, UseChatOptions, UseCompletionHelpers, experimental_useAssistant, useChat, useCompletion };
import * as react_jsx_runtime from 'react/jsx-runtime';

type Props = {
    /**
     * A ReadableStream produced by the AI SDK.
     */
    stream: ReadableStream;
};
/**
 * A React Server Component that recursively renders a stream of tokens.
 * Can only be used inside of server components.
 */
declare function Tokens(props: Props): Promise<react_jsx_runtime.JSX.Element>;

export { Tokens };
