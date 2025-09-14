#!/usr/bin/env node
export declare function buildParser(args?: string[]): import("yargs").Argv<{
    input: string;
} & {
    title: string;
} & {
    out: string | undefined;
} & {
    size: string[] | undefined;
}>;
export declare function main(): Promise<void>;
