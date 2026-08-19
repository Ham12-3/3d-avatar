import { describe, expect, it } from "vitest";
import { parseDemoPreferences } from "@/lib/data/preferences";

describe("demo preferences",()=>{
  it("uses safe defaults for an invalid cookie",()=>{
    expect(parseDemoPreferences("not-json")).toMatchObject({theme:"system",captionsEnabled:true,cameraDefault:false});
  });
  it("restores valid saved fields without trusting malformed values",()=>{
    expect(parseDemoPreferences(JSON.stringify({theme:"dark",cameraDefault:true,captionsEnabled:"yes"}))).toMatchObject({theme:"dark",cameraDefault:true,captionsEnabled:true});
  });
});
