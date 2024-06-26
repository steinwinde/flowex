export type Variable = {
    /** Name of variable, used as key */
    s: string;
    
    /** Undefined, if not decided yet. True, if variable must be declared global. False if variable is local. */
    g?: boolean;
}