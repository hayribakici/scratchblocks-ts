import JSZip from "jszip";
import { toScratchblocks } from "parse-sb3-blocks";
import { LanguageCode } from "../types";



export class ScratchProject {

    private readonly targets: readonly ScratchTarget[];

    constructor(json: any, readonly lang: LanguageCode = "en") {
        this.targets = json.targets.map(
            (target: any) => new ScratchTarget(target, lang)
        );
    }

    getTargets(): readonly ScratchTarget[] {
        return this.targets;
    }

    getTarget(name: string): ScratchTarget | undefined {
        return this.targets.find(target => target.name === name);
    }
}

export class ScratchTarget {

    readonly name: string;
    readonly isStage: boolean;
    private readonly scripts: readonly ScratchScript[];

    constructor(json: any, lang: LanguageCode) {
        this.name = json.name;
        this.isStage = json.isStage;
        this.scripts = Object.keys(json.blocks)
            .filter(id => json.blocks[id].topLevel)
            .map(id => new ScratchScript(
                this,
                json.blocks[id].opcode,
                {
                    id,
                    blocks: json.blocks,
                },
                lang
            ));
    }

    getScripts(): readonly ScratchScript[] {
        return this.scripts;
    }
}

export class ScratchScript {

    constructor(
        readonly target: ScratchTarget,
        readonly opcode: string,
        readonly sb3Json: {
            readonly id: string;
            readonly blocks: any;
        },
        private readonly lang: LanguageCode
    ) { }

    contains(opcode: string): boolean {
        var stack = [this.sb3Json.id];
        var visited = new Set<String>();
        while (stack.length > 0) {
            var id = stack.pop()!;
            if (visited.has(id)) {
                continue;
            }
            visited.add(id);
            const block = this.sb3Json.blocks[id];

            if (block.opcode === opcode) {
                return true;
            }

            if (block.next) {
                stack.push(block.next);
            }
            this.pushChildren(id, stack);
        }
        return false;
    }

    private pushChildren(id: string, stack: string[]): void {
        const inputs = this.sb3Json.blocks[id].inputs;

        for (const name of Object.keys(inputs)) {
            const input = inputs[name];

            for (const value of input.slice(1)) {
                if (typeof value === "string" && this.sb3Json.blocks[value]) {
                    stack.push(value);
                }
            }
        }
    }

    toScratchblocks(lang: LanguageCode = this.lang): string {
        return toScratchblocks(
            this.sb3Json.id,
            this.sb3Json.blocks,
            lang
        );
    }
}

export async function readSB3(file: File, lang: LanguageCode = "en"): Promise<ScratchProject> {
    const archive = await JSZip.loadAsync(await file.arrayBuffer());
    const projectFile = archive.file("project.json");

    if (!projectFile) {
        throw new Error("The SB3 archive does not contain project.json");
    }

    const json = JSON.parse(await projectFile.async("string"));
    return new ScratchProject(json, lang);
}
