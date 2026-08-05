import assert from "assert/strict";
import { readFileSync } from "fs";
import path from "path";

import {
  readSB3,
  ScratchProject,
} from "../src/project/project";
import { OpcodeGreenFlag } from "../src/project/opcodes";

async function test(name: string, run: () => Promise<void>) {
  await run();
  console.log(`ok - ${name}`);
}

async function readTestProject(): Promise<ScratchProject> {
  const bytes = readFileSync(path.join(process.cwd(), "tests/game.sb3"));
  const file = new File([bytes], "game.sb3");

  return readSB3(file);
}

void test("reads a Scratch project from an SB3 file", async () => {
  const project = await readTestProject();

  assert.ok(project instanceof ScratchProject);
}).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

void test("reads the targets from a Scratch project", async () => {
  const project = await readTestProject();

  assert.deepEqual(
    project.getTargets().map(({ name, isStage }) => ({ name, isStage })),
    [
      { name: "Stage", isStage: true },
      { name: "Crab", isStage: false },
    ]
  );
}).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

void test("reads the scripts from a target", async () => {
  const project = await readTestProject();
  const target = project.getTarget("Crab");

  assert.ok(target);
  assert.deepEqual(
    target?.getScripts().map(script => script.opcode),
    ["event_whenflagclicked", "procedures_definition"]
  );
  assert.ok(target?.getScripts().every(script => script.sb3Json.id));
}).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

void test("finds blocks contained in a script", async () => {
  const project = await readTestProject();
  const target = project.getTarget("Crab");

  assert.ok(target);
  const script = target.getScripts().find(
    script => script.opcode === OpcodeGreenFlag
  );

  assert.ok(script);
  assert.equal(script.contains(OpcodeGreenFlag), true);
  assert.equal(script.contains("procedures_call"), true);
  assert.equal(script.contains("control_if"), true);
  assert.equal(script.contains("sensing_touchingobject"), true);
  assert.equal(script.contains("looks_sayforsecs"), true);
}).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

void test("does not include blocks from another script", async () => {
  const project = await readTestProject();
  const target = project.getTarget("Crab");

  assert.ok(target);
  const script = target.getScripts().find(
    script => script.opcode === OpcodeGreenFlag
  );

  assert.ok(script);
  assert.equal(script.contains("procedures_definition"), false);
  assert.equal(script.contains("motion_gotoxy"), false);
  assert.equal(script.contains("control_repeat_until"), false);
}).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

void test("converts a script to Scratchblocks source", async () => {
  const project = await readTestProject();
  const target = project.getTarget("Crab");

  assert.ok(target);
  const script = target?.getScripts().find(
    script => script.opcode === OpcodeGreenFlag
  );

  assert.ok(script);
  assert.equal(
    script.toScratchblocks(),
    [
      "when @greenFlag clicked",
      "springe herum bis die Leertaste gedrückt wird::custom",
      "if <touching [edge v]?> then",
      "    say [Gewonnen!] for (2) seconds",
      "end",
    ].join("\n")
  );
}).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
