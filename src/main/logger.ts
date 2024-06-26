// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(verbose: boolean, message: Error | string, ...args: any[]): void {
    if(verbose) {
        if(message instanceof Error) {
            if(Array.isArray(message.message)) {
                console.log(message.message[0], args);
            } else {
                console.log(message, args);
            }
        } else {
            console.log(message, args);
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function warn(message?: string, ...args: any[]): void {
    console.warn(message, args);
}