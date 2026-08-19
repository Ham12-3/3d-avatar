import { defaultPreferences } from "@/lib/data/repository";
import type { UserPreferences } from "@/lib/domain/types";

export const demoPreferencesCookie="nova-demo-preferences";

export function parseDemoPreferences(value:string|undefined):UserPreferences{
  if(!value)return defaultPreferences;
  try{
    const parsed=JSON.parse(value) as Partial<UserPreferences>;
    return {
      theme:parsed.theme==="light"||parsed.theme==="dark"||parsed.theme==="system"?parsed.theme:defaultPreferences.theme,
      captionsEnabled:typeof parsed.captionsEnabled==="boolean"?parsed.captionsEnabled:defaultPreferences.captionsEnabled,
      microphoneDefault:typeof parsed.microphoneDefault==="boolean"?parsed.microphoneDefault:defaultPreferences.microphoneDefault,
      cameraDefault:typeof parsed.cameraDefault==="boolean"?parsed.cameraDefault:defaultPreferences.cameraDefault,
      screenSharePrompt:typeof parsed.screenSharePrompt==="boolean"?parsed.screenSharePrompt:defaultPreferences.screenSharePrompt,
    };
  }catch{return defaultPreferences;}
}
